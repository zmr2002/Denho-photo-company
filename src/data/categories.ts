export const serviceCategoryIds = ['event', 'space', 'interview', 'portrait'] as const;

export type ServiceCategoryId = (typeof serviceCategoryIds)[number];

export const worksCategoryIds = ['featured', ...serviceCategoryIds, 'video'] as const;

export type WorksCategoryId = (typeof worksCategoryIds)[number];
