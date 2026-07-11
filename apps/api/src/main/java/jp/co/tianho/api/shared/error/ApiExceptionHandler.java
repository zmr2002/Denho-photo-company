package jp.co.tianho.api.shared.error;

import jakarta.validation.ConstraintViolationException;
import jp.co.tianho.api.content.publicapi.ContentNotFoundException;
import jp.co.tianho.api.content.admin.ContentRevisionException;
import jp.co.tianho.api.auth.AuthenticationFailedException;
import jp.co.tianho.api.auth.AdministratorUserManagementException;
import jp.co.tianho.api.auth.MfaVerificationException;
import jp.co.tianho.api.media.MediaAssetNotFoundException;
import jp.co.tianho.api.media.DuplicateMediaException;
import jp.co.tianho.api.media.ImageValidationException;
import jp.co.tianho.api.media.MediaLifecycleException;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MediaLifecycleException.class)
    ResponseEntity<ProblemDetail> handleMediaLifecycle(MediaLifecycleException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Media lifecycle conflict");
        problem.setType(URI.create("/problems/media-lifecycle-conflict"));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(ImageValidationException.class)
    ResponseEntity<ProblemDetail> handleImageValidation(ImageValidationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, exception.getMessage());
        problem.setTitle("Image validation failed");
        problem.setType(URI.create("/problems/image-validation-failed"));
        return ResponseEntity.unprocessableContent().body(problem);
    }

    @ExceptionHandler(DuplicateMediaException.class)
    ResponseEntity<ProblemDetail> handleDuplicateMedia(DuplicateMediaException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Duplicate media asset");
        problem.setType(URI.create("/problems/duplicate-media-asset"));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(MediaAssetNotFoundException.class)
    ResponseEntity<ProblemDetail> handleMediaNotFound(MediaAssetNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Media asset not found");
        problem.setType(URI.create("/problems/media-asset-not-found"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(ContentRevisionException.class)
    ResponseEntity<ProblemDetail> handleContentRevision(ContentRevisionException exception) {
        HttpStatus status = exception.reason() == ContentRevisionException.Reason.NOT_FOUND
                ? HttpStatus.NOT_FOUND
                : HttpStatus.CONFLICT;
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, exception.getMessage());
        problem.setTitle(status == HttpStatus.NOT_FOUND ? "Content not found" : "Content revision conflict");
        problem.setType(URI.create(status == HttpStatus.NOT_FOUND
                ? "/problems/content-not-found"
                : "/problems/content-revision-conflict"));
        return ResponseEntity.status(status).body(problem);
    }

    @ExceptionHandler(MfaVerificationException.class)
    ResponseEntity<ProblemDetail> handleMfaVerification(MfaVerificationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
        problem.setTitle("Account verification failed");
        problem.setType(URI.create("/problems/account-verification-failed"));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(AdministratorUserManagementException.class)
    ResponseEntity<ProblemDetail> handleUserManagement(AdministratorUserManagementException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("User management conflict");
        problem.setType(URI.create("/problems/user-management-conflict"));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(AuthenticationFailedException.class)
    ResponseEntity<ProblemDetail> handleAuthenticationFailed(AuthenticationFailedException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
        problem.setTitle("Authentication failed");
        problem.setType(URI.create("/problems/authentication-failed"));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(ContentNotFoundException.class)
    ResponseEntity<ProblemDetail> handleContentNotFound(ContentNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Content not found");
        problem.setType(URI.create("/problems/content-not-found"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> handleInvalidBody(MethodArgumentNotValidException exception) {
        ProblemDetail problem = validationProblem("Request body validation failed");
        List<FieldViolation> violations = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldViolation(error.getField(), error.getDefaultMessage()))
                .toList();
        problem.setProperty("violations", violations);
        return ResponseEntity.badRequest().body(problem);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException exception) {
        ProblemDetail problem = validationProblem("Request parameter validation failed");
        List<FieldViolation> violations = exception.getConstraintViolations().stream()
                .map(violation -> new FieldViolation(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()))
                .toList();
        problem.setProperty("violations", violations);
        return ResponseEntity.badRequest().body(problem);
    }

    private ProblemDetail validationProblem(String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
        problem.setTitle("Invalid request");
        problem.setType(URI.create("/problems/validation-error"));
        return problem;
    }

    record FieldViolation(String field, String message) {
    }
}
