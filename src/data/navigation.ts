export type SiteLanguage = 'ja' | 'zh' | 'en';

export const navigationLabels: Record<
	SiteLanguage,
	{ home: string; services: string; works: string; about: string; contact: string }
> = {
	ja: {
		home: 'HOME',
		services: 'SERVICES',
		works: 'WORKS',
		about: 'ABOUT',
		contact: 'CONTACT',
	},
	zh: {
		home: 'HOME',
		services: 'SERVICES',
		works: 'WORKS',
		about: 'ABOUT',
		contact: 'CONTACT',
	},
	en: {
		home: 'HOME',
		services: 'SERVICES',
		works: 'WORKS',
		about: 'ABOUT',
		contact: 'CONTACT',
	},
};

export const languageLinks = [
	{ lang: 'ja', label: 'JP', href: '/ja/' },
	{ lang: 'zh', label: '中文', href: '/zh/' },
	{ lang: 'en', label: 'EN', href: '/en/' },
] as const;

export const getLanguageBase = (lang: SiteLanguage) => `/${lang}`;
