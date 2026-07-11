package jp.co.tianho.api.inquiry;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.inquiry.InquiryService.InquiryResponse;
import jp.co.tianho.api.inquiry.InquiryService.PublicInquiryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
public class InquiryController {

    private final InquiryService inquiryService;
    private final InquiryProtectionService protectionService;

    public InquiryController(InquiryService inquiryService, InquiryProtectionService protectionService) {
        this.inquiryService = inquiryService;
        this.protectionService = protectionService;
    }

    @PostMapping("/api/v1/public/inquiries")
    @ResponseStatus(HttpStatus.CREATED)
    PublicInquiryResponse create(
            @Valid @RequestBody PublicInquiryRequest request,
            HttpServletRequest servletRequest) {
        java.util.Optional<PublicInquiryResponse> existing = inquiryService.findExisting(request.idempotencyKey());
        if (existing.isPresent()) return existing.get();
        if (request.companyWebsite() != null && !request.companyWebsite().isBlank()) {
            return new PublicInquiryResponse(UUID.randomUUID(), InquiryStatus.NEW, java.time.OffsetDateTime.now());
        }
        String ipHash = protectionService.verify(servletRequest.getRemoteAddr(), request.turnstileToken());
        return inquiryService.create(request, ipHash);
    }

    @GetMapping("/api/v1/admin/inquiries")
    List<InquiryResponse> findAll(
            @RequestParam(defaultValue = "NEW") InquiryStatus status) {
        return inquiryService.findAll(status);
    }

    @PatchMapping("/api/v1/admin/inquiries/{id}/status")
    InquiryResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusRequest body,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return inquiryService.changeStatus(id, body.status(), actor, request.getRemoteAddr());
    }

    public record StatusRequest(@NotNull InquiryStatus status) {
    }
}
