package jp.co.tianho.api.content.admin;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jp.co.tianho.api.content.admin.AdminContentService.ArticleBlockInput;

public class ArticleBlockValidator implements ConstraintValidator<ValidArticleBlock, ArticleBlockInput> {

    @Override
    public boolean isValid(ArticleBlockInput block, ConstraintValidatorContext context) {
        if (block == null || block.type() == null) return true;
        return switch (block.type()) {
            case "heading" -> hasText(block.heading());
            case "paragraph" -> hasText(block.body());
            case "image" -> hasText(block.imagePath());
            default -> true;
        };
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
