package jp.co.tianho.api.content.admin;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ArticleBlockValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidArticleBlock {

    String message() default "Article block content does not match its type";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
