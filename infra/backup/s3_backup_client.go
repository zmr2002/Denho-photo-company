package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"sort"
	"strconv"
	"strings"
	"time"
)

type client struct {
	endpoint  *url.URL
	bucket    string
	accessKey string
	secretKey string
	region    string
	http      *http.Client
}

type listResult struct {
	IsTruncated           bool     `xml:"IsTruncated"`
	NextContinuationToken string   `xml:"NextContinuationToken"`
	Contents              []object `xml:"Contents"`
}

type object struct {
	Key          string `xml:"Key"`
	LastModified string `xml:"LastModified"`
}

func required(name string) string {
	value := os.Getenv(name)
	if value == "" {
		fatal(fmt.Errorf("%s is required", name))
	}
	return value
}

func newClient() *client {
	endpoint, err := url.Parse(required("BACKUP_ENDPOINT"))
	if err != nil || endpoint.Scheme == "" || endpoint.Host == "" {
		fatal(fmt.Errorf("invalid BACKUP_ENDPOINT: %w", err))
	}
	region := os.Getenv("BACKUP_REGION")
	if region == "" {
		region = "auto"
	}
	return &client{
		endpoint:  endpoint,
		bucket:    required("BACKUP_BUCKET"),
		accessKey: required("BACKUP_ACCESS_KEY"),
		secretKey: required("BACKUP_SECRET_KEY"),
		region:    region,
		http:      &http.Client{Timeout: 10 * time.Minute},
	}
}

func hmacSHA256(key []byte, value string) []byte {
	mac := hmac.New(sha256.New, key)
	_, _ = mac.Write([]byte(value))
	return mac.Sum(nil)
}

func signingKey(secret, date, region string) []byte {
	key := hmacSHA256([]byte("AWS4"+secret), date)
	key = hmacSHA256(key, region)
	key = hmacSHA256(key, "s3")
	return hmacSHA256(key, "aws4_request")
}

func hashReader(reader io.Reader) (string, error) {
	digest := sha256.New()
	if _, err := io.Copy(digest, reader); err != nil {
		return "", err
	}
	return hex.EncodeToString(digest.Sum(nil)), nil
}

func (c *client) request(method, key string, query url.Values, source *os.File) (*http.Response, error) {
	requestURL := *c.endpoint
	requestURL.Path = "/" + path.Join(c.endpoint.Path, c.bucket, key)
	if strings.HasSuffix(key, "/") {
		requestURL.Path += "/"
	}
	requestURL.RawQuery = query.Encode()

	payloadHash := hex.EncodeToString(sha256.New().Sum(nil))
	var body io.Reader
	var contentLength int64
	if source != nil {
		var err error
		payloadHash, err = hashReader(source)
		if err != nil {
			return nil, err
		}
		if _, err = source.Seek(0, io.SeekStart); err != nil {
			return nil, err
		}
		info, err := source.Stat()
		if err != nil {
			return nil, err
		}
		contentLength = info.Size()
		body = source
	}

	request, err := http.NewRequest(method, requestURL.String(), body)
	if err != nil {
		return nil, err
	}
	if source != nil {
		request.ContentLength = contentLength
	}
	now := time.Now().UTC()
	amzDate := now.Format("20060102T150405Z")
	dateStamp := now.Format("20060102")
	canonicalHeaders := "host:" + requestURL.Host + "\n" +
		"x-amz-content-sha256:" + payloadHash + "\n" +
		"x-amz-date:" + amzDate + "\n"
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"
	canonicalRequest := strings.Join([]string{
		method,
		requestURL.EscapedPath(),
		requestURL.Query().Encode(),
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	}, "\n")
	requestHash := sha256.Sum256([]byte(canonicalRequest))
	scope := strings.Join([]string{dateStamp, c.region, "s3", "aws4_request"}, "/")
	stringToSign := strings.Join([]string{"AWS4-HMAC-SHA256", amzDate, scope, hex.EncodeToString(requestHash[:])}, "\n")
	signature := hex.EncodeToString(hmacSHA256(signingKey(c.secretKey, dateStamp, c.region), stringToSign))
	request.Header.Set("x-amz-content-sha256", payloadHash)
	request.Header.Set("x-amz-date", amzDate)
	request.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential="+c.accessKey+"/"+scope+", SignedHeaders="+signedHeaders+", Signature="+signature)

	response, err := c.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		defer response.Body.Close()
		message, _ := io.ReadAll(io.LimitReader(response.Body, 2048))
		return nil, fmt.Errorf("S3 request failed: %s: %s", response.Status, strings.TrimSpace(string(message)))
	}
	return response, nil
}

func (c *client) put(key, filename string) error {
	source, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer source.Close()
	response, err := c.request(http.MethodPut, key, url.Values{}, source)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, err = io.Copy(io.Discard, response.Body)
	return err
}

func (c *client) get(key, filename string) error {
	response, err := c.request(http.MethodGet, key, url.Values{}, nil)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	destination, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer destination.Close()
	_, err = io.Copy(destination, response.Body)
	return err
}

func (c *client) delete(key string) error {
	response, err := c.request(http.MethodDelete, key, url.Values{}, nil)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, err = io.Copy(io.Discard, response.Body)
	return err
}

func (c *client) deleteExpired(prefix string, cutoff time.Time) error {
	continuationToken := ""
	for {
		query := url.Values{"list-type": {"2"}, "prefix": {prefix}}
		if continuationToken != "" {
			query.Set("continuation-token", continuationToken)
		}
		response, err := c.request(http.MethodGet, "", query, nil)
		if err != nil {
			return err
		}
		var result listResult
		decodeErr := xml.NewDecoder(response.Body).Decode(&result)
		response.Body.Close()
		if decodeErr != nil {
			return decodeErr
		}
		sort.Slice(result.Contents, func(i, j int) bool { return result.Contents[i].Key < result.Contents[j].Key })
		for _, storedObject := range result.Contents {
			modified, err := time.Parse(time.RFC3339, storedObject.LastModified)
			if err != nil {
				return err
			}
			if !modified.After(cutoff) {
				if err := c.delete(storedObject.Key); err != nil {
					return err
				}
			}
		}
		if !result.IsTruncated {
			return nil
		}
		if result.NextContinuationToken == "" {
			return errors.New("S3 listing was truncated without a continuation token")
		}
		continuationToken = result.NextContinuationToken
	}
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}

func main() {
	if len(os.Args) < 2 {
		fatal(errors.New("expected put, get, or delete-expired command"))
	}
	client := newClient()
	switch os.Args[1] {
	case "put":
		if len(os.Args) != 4 {
			fatal(errors.New("put requires an object key and source file"))
		}
		if err := client.put(os.Args[2], os.Args[3]); err != nil {
			fatal(err)
		}
	case "get":
		if len(os.Args) != 4 {
			fatal(errors.New("get requires an object key and destination file"))
		}
		if err := client.get(os.Args[2], os.Args[3]); err != nil {
			fatal(err)
		}
	case "delete-expired":
		if len(os.Args) != 4 {
			fatal(errors.New("delete-expired requires a prefix and retention days"))
		}
		retentionDays, err := strconv.Atoi(os.Args[3])
		if err != nil {
			fatal(err)
		}
		if retentionDays < 1 {
			fatal(errors.New("retention days must be positive"))
		}
		cutoff := time.Now().UTC().Add(-time.Duration(retentionDays) * 24 * time.Hour)
		if err := client.deleteExpired(os.Args[2], cutoff); err != nil {
			fatal(err)
		}
	default:
		fatal(errors.New("expected put, get, or delete-expired command"))
	}
}
