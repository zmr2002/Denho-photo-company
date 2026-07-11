package jp.co.tianho.api.shared.error;

import jakarta.validation.ConstraintViolationException;
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
