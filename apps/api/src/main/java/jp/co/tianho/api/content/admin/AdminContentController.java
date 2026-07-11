package jp.co.tianho.api.content.admin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.content.admin.AdminContentService.ArticleInput;
import jp.co.tianho.api.content.admin.AdminContentService.NoticeInput;
import jp.co.tianho.api.content.admin.AdminContentService.WorkImagesInput;
import jp.co.tianho.api.content.admin.ContentRevisionService.ResourceType;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminContentController {

    private final AdminContentService contentService;

    public AdminContentController(AdminContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/articles")
    List<JsonNode> articles() {
        return contentService.findAll(ResourceType.ARTICLE);
    }

    @GetMapping("/articles/{id}")
    JsonNode article(@PathVariable UUID id) {
        return contentService.findOne(ResourceType.ARTICLE, id);
    }

    @PostMapping("/articles")
    @ResponseStatus(HttpStatus.CREATED)
    JsonNode createArticle(
            @Valid @RequestBody ArticleInput input,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return contentService.createArticle(input, actor, request.getRemoteAddr());
    }

    @PatchMapping("/articles/{id}")
    JsonNode updateArticle(
            @PathVariable UUID id,
            @Valid @RequestBody ArticleUpdateRequest body,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return contentService.updateArticle(id, body.article(), body.expectedVersion(), actor, request.getRemoteAddr());
    }

    @GetMapping("/works")
    List<JsonNode> works() {
        return contentService.findAll(ResourceType.WORK);
    }

    @GetMapping("/works/{id}")
    JsonNode work(@PathVariable UUID id) {
        return contentService.findOne(ResourceType.WORK, id);
    }

    @PatchMapping("/works/{id}/images")
    JsonNode updateWorkImages(
            @PathVariable UUID id,
            @Valid @RequestBody WorkImagesInput input,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return contentService.updateWorkImages(id, input, actor, request.getRemoteAddr());
    }

    @GetMapping("/notices")
    List<JsonNode> notices() {
        return contentService.findAll(ResourceType.NOTICE);
    }

    @PatchMapping("/notices")
    JsonNode saveNotice(
            @Valid @RequestBody NoticeInput input,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return contentService.saveNotice(input, actor, request.getRemoteAddr());
    }

    public record ArticleUpdateRequest(long expectedVersion, @Valid @NotNull ArticleInput article) {
    }
}
