package jp.co.tianho.api.inquiry;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record PublicInquiryRequest(
        @NotNull UUID idempotencyKey,
        @NotBlank @Size(max = 240) String nameCompany,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(max = 160) String projectType,
        @Size(max = 120) String requestedDate,
        @Size(max = 240) String location,
        @NotBlank @Size(min = 20, max = 5000) String message,
        @NotBlank @Pattern(regexp = "ja|zh|en") String locale,
        @NotBlank @Pattern(regexp = "2026-07") String consentVersion,
        @AssertTrue boolean consented,
        @Size(max = 2048) String turnstileToken,
        @Size(max = 240) String companyWebsite) {
}
