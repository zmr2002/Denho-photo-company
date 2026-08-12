package jp.co.tianho.api.content.admin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.content.admin.ContentRevisionService.ContentAction;
import jp.co.tianho.api.content.admin.ContentRevisionService.ContentStateResponse;
import jp.co.tianho.api.content.admin.ContentRevisionService.ResourceType;
import jp.co.tianho.api.content.admin.ContentRevisionService.RevisionResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class ContentRevisionController {

    private final ContentRevisionService revisionService;

    public ContentRevisionController(ContentRevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @GetMapping("/{collection:articles|works|notices}/{id}/revisions")
    List<RevisionResponse> findRevisions(
            @PathVariable String collection,
            @PathVariable UUID id) {
        return revisionService.findRevisions(resourceType(collection), id);
    }

    @PostMapping("/{collection:articles|works|notices}/{id}/{action:publish|archive|restore|unpublish}")
    ContentStateResponse changeState(
            @PathVariable String collection,
            @PathVariable UUID id,
            @PathVariable String action,
            @Valid @RequestBody VersionRequest body,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        ContentAction contentAction = switch (action) {
            case "publish" -> ContentAction.PUBLISH;
            case "archive" -> ContentAction.ARCHIVE;
            case "restore" -> ContentAction.RESTORE;
            case "unpublish" -> ContentAction.UNPUBLISH;
            default -> throw new IllegalArgumentException("Unsupported content action");
        };
        return revisionService.changeState(
                resourceType(collection), id, body.expectedVersion(), contentAction, actor, request.getRemoteAddr());
    }

    private ResourceType resourceType(String collection) {
        return switch (collection) {
            case "articles" -> ResourceType.ARTICLE;
            case "works" -> ResourceType.WORK;
            case "notices" -> ResourceType.NOTICE;
            default -> throw new IllegalArgumentException("Unsupported content collection");
        };
    }

    record VersionRequest(@NotNull Long expectedVersion) {
    }
}
