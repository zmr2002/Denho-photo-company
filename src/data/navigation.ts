export type SiteLanguage = 'ja' | 'zh' | 'en';

export const navigationLabels: Record<
	SiteLanguage,
	{ home: string; services: string; works: string; about: string; contact: string }
> = {
	ja: {
		home: 'ホーム',
		services: 'サービス',
		works: '制作実績',
		about: '会社情報',
		contact: 'お問い合わせ',
	},
	zh: {
		home: '首页',
		services: '服务',
		works: '案例',
		about: '关于',
		contact: '咨询',
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
	{ lang: 'zh', label: '简中', href: '/zh/' },
	{ lang: 'en', label: 'EN', href: '/en/' },
] as const;

export const getLanguageBase = (lang: SiteLanguage) => `/${lang}`;
