export const tutorialArticleSlug = "admin-tutorial-sample";
export const tutorialArticleCategory = "后台教学";

export function localeLabel(locale: string) {
  if (locale === "ja") return "日语页面（ja）";
  if (locale === "zh") return "中文页面（zh）";
  if (locale === "en") return "英语页面（en）";
  return locale;
}

export function statusLabel(status: string) {
  if (status === "published") return "已发布";
  if (status === "draft") return "草稿";
  return status;
}

export function mediaTypeLabel(mediaType: string) {
  if (mediaType === "photo") return "照片";
  if (mediaType === "gallery") return "图片相册";
  if (mediaType === "video") return "视频";
  return mediaType;
}

export function isTutorialArticle(article: { slug: string; category: string }) {
  return article.slug === tutorialArticleSlug || article.category === tutorialArticleCategory;
}
