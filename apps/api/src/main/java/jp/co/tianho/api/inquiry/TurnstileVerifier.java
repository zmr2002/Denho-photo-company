package jp.co.tianho.api.inquiry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class TurnstileVerifier {

    private final RestClient restClient;
    private final boolean enabled;
    private final String secret;

    public TurnstileVerifier(
            @Value("${tianho.inquiry.turnstile.enabled:false}") boolean enabled,
            @Value("${tianho.inquiry.turnstile.secret:}") String secret) {
        this.restClient = RestClient.builder().baseUrl("https://challenges.cloudflare.com").build();
        this.enabled = enabled;
        this.secret = secret;
    }

    public void verify(String token, String remoteAddress) {
        if (!enabled) return;
        if (secret.isBlank() || token == null || token.isBlank()) throw new InquiryVerificationException();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secret);
        form.add("response", token);
        form.add("remoteip", remoteAddress);
        try {
            VerificationResponse result = restClient.post()
                    .uri("/turnstile/v0/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(VerificationResponse.class);
            if (result == null || !result.success()) throw new InquiryVerificationException();
        } catch (RestClientException exception) {
            throw new InquiryVerificationException();
        }
    }

    private record VerificationResponse(boolean success) {
    }
}
