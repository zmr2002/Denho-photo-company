package jp.co.tianho.api.content.publicapi;

import jakarta.validation.constraints.Pattern;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/public")
public class PublicContentController {

    private static final String LOCALE_PATTERN = "ja|zh|en";

    private final PublicContentService contentService;

    public PublicContentController(PublicContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/articles")
    List<PublicContentResponse.ArticleSummary> articles(
            @RequestParam(defaultValue = "ja") @Pattern(regexp = LOCALE_PATTERN) String locale) {
        return contentService.findArticles(locale);
    }

    @GetMapping("/articles/{slug}")
    PublicContentResponse.ArticleDetail article(
            @PathVariable String slug,
            @RequestParam(defaultValue = "ja") @Pattern(regexp = LOCALE_PATTERN) String locale) {
        return contentService.findArticle(locale, slug);
    }

    @GetMapping("/works")
    List<PublicContentResponse.WorkSummary> works(
            @RequestParam(defaultValue = "ja") @Pattern(regexp = LOCALE_PATTERN) String locale) {
        return contentService.findWorks(locale);
    }

    @GetMapping("/works/{slug}")
    PublicContentResponse.WorkDetail work(
            @PathVariable String slug,
            @RequestParam(defaultValue = "ja") @Pattern(regexp = LOCALE_PATTERN) String locale) {
        return contentService.findWork(locale, slug);
    }

    @GetMapping("/notices/current")
    ResponseEntity<PublicContentResponse.Notice> currentNotice(
            @RequestParam(defaultValue = "ja") @Pattern(regexp = LOCALE_PATTERN) String locale) {
        return contentService.findCurrentNotice(locale)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
