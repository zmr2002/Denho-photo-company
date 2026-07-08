import { site } from './site';
import type { DisplayText } from '@/lib/text/display-text';
import type { GalleryImage, WorkMediaType } from '@/data/pages';
import type { ArticleImageBlock, ArticleSection } from '@/lib/content/types';

export interface HomeNewsItem {
	date: string;
	category: string;
	title: string;
	excerpt: string;
	detailTitle?: string;
	detailBody?: string;
	detailLead?: string;
	detailSectionTitle?: string;
	detailParagraphs?: string[];
	detailImage?: ArticleImageBlock;
	detailSections?: ArticleSection[];
	detailClosing?: string;
	closeLabel?: string;
}

export interface HomeServiceItem {
	number: string;
	label: string;
	title: DisplayText;
	description: string;
	mediaLabel: string;
	mediaTone: 'neutral' | 'warm' | 'cool' | 'rust';
}

export interface HomeWorkItem {
	category: string;
	title: DisplayText;
	description: string;
	scope: string;
	mediaLabel: string;
	mediaTone: 'neutral' | 'warm' | 'cool' | 'rust';
	mediaType?: WorkMediaType;
	video?: boolean;
	galleryImages?: GalleryImage[];
}

export interface HomeContent {
	hero: {
		label: string;
		title: DisplayText;
		description: string;
		mediaLabel: string;
	};
	about: {
		label: string;
		title: DisplayText;
		description: string;
		languageNote: string;
		linkLabel: string;
	};
	news: {
		label: string;
		title: DisplayText;
		items: HomeNewsItem[];
	};
	services: {
		label: string;
		title: DisplayText;
		description: string;
		linkLabel: string;
		items: HomeServiceItem[];
	};
	works: {
		label: string;
		title: DisplayText;
		description: string;
		linkLabel: string;
		items: HomeWorkItem[];
	};
	contact: {
		label: string;
		title: DisplayText;
		description: string;
		linkLabel: string;
	};
}

export const homeContent: Record<'ja' | 'zh', HomeContent> = {
	ja: {
		hero: {
			label: '写真 / 映像 / 当日納品',
			title: ['企画から納品まで、', '現場に寄り添う映像制作。'],
			description:
				'イベント、空間、インタビュー、ポートレートなど、目的に合わせて写真と映像を設計し、制作全体を一貫して支援します。',
			mediaLabel: 'ホーム メインビジュアル',
		},
		about: {
			label: '会社について',
			title: ['伝えるべき価値を、', '現場から丁寧にすくい上げる。'],
			description:
				`${site.name}は、日本国内の写真・映像制作を企画から撮影、編集、納品まで支援する制作会社です。企業活動や空間、人の魅力を理解し、用途に合った形で届けます。`,
			languageNote: '日本語 / 简体中文 / English に対応',
			linkLabel: '会社について',
		},
		news: {
			label: 'お知らせ',
			title: '最近の取り組み',
			items: [],
		},
		services: {
			label: 'サービス',
			title: '4つの制作領域',
			description:
				'プロジェクトの目的と現場条件を整理し、写真、映像、当日素材共有、編集を組み合わせます。',
			linkLabel: 'サービス詳細',
			items: [
				{
					number: '01',
					label: 'イベント / カンファレンス',
					title: 'イベント・カンファレンス',
					description: '企業イベントや会議の流れ、登壇、交流を一日の記録として整理します。',
					mediaLabel: 'イベント撮影',
					mediaTone: 'rust',
				},
				{
					number: '02',
					label: '空間 / 宿泊 / 店舗',
					title: '空間・宿泊施設',
					description: '空間の設計意図、素材、利用体験を写真と短い映像で伝えます。',
					mediaLabel: '空間撮影',
					mediaTone: 'warm',
				},
				{
					number: '03',
					label: 'インタビュー / ブランド',
					title: 'インタビュー・ブランドストーリー',
					description: '企業や人の背景を聞き取り、信頼感のある物語として構成します。',
					mediaLabel: 'インタビュー撮影',
					mediaTone: 'cool',
				},
				{
					number: '04',
					label: 'ポートレート / プロフィール',
					title: 'ポートレート・プロフィール',
					description: '用途に合わせて、自然でプロフェッショナルな人物表現を整えます。',
					mediaLabel: 'ポートレート撮影',
					mediaTone: 'neutral',
				},
			],
		},
		works: {
			label: '制作実績',
			title: ['プロジェクトから見る', '制作事例'],
			description: '目的と現場条件に合わせて設計したサンプル事例を紹介します。',
			linkLabel: '制作実績を見る',
			items: [],
		},
		contact: {
			label: 'お問い合わせ',
			title: ['撮影・映像制作の', 'ご相談はこちら'],
			description: '企画段階のご相談から、撮影日が決まっている案件まで対応します。',
			linkLabel: 'プロジェクトを相談する',
		},
	},
	zh: {
		hero: {
			label: '摄影 / 视频 / 现场交付',
			title: ['从策划到交付，', '为现场提供影像制作支持。'],
			description:
				'面向活动、空间、访谈与人像项目，根据传播目的组织摄影、视频、现场素材交付与后期制作。',
			mediaLabel: '首页主视觉',
		},
		about: {
			label: '关于公司',
			title: ['从真实现场中，', '提炼值得被看见的价值。'],
			description:
				`${site.name}是一家位于日本的摄影与视频制作公司，提供从策划、拍摄、编辑到最终交付的一体化支持。`,
			languageNote: '支持日语、简体中文与英语项目沟通',
			linkLabel: '了解公司',
		},
		news: {
			label: '通知',
			title: '近期项目',
			items: [],
		},
		services: {
			label: '服务',
			title: '四大业务领域',
			description: '根据项目目标和现场条件，组合摄影、视频、现场传图与后期制作。',
			linkLabel: '查看服务详情',
			items: [
				{
					number: '01',
					label: '活动 / 会议',
					title: '活动与会议',
					description: '记录企业活动、会议流程、演讲内容与现场交流。',
					mediaLabel: '活动拍摄',
					mediaTone: 'rust',
				},
				{
					number: '02',
					label: '空间 / 住宿 / 店铺',
					title: '空间与住宿影像',
					description: '通过照片与视频呈现空间设计、设施细节和真实体验。',
					mediaLabel: '空间拍摄',
					mediaTone: 'warm',
				},
				{
					number: '03',
					label: '访谈 / 品牌故事',
					title: '访谈与品牌故事',
					description: '整理企业和人物背景，将真实内容组织成可信的叙事。',
					mediaLabel: '访谈拍摄',
					mediaTone: 'cool',
				},
				{
					number: '04',
					label: '人像 / 职业形象',
					title: '人像与职业形象',
					description: '为商务人士、创作者和团队呈现自然且专业的形象。',
					mediaLabel: '人像拍摄',
					mediaTone: 'neutral',
				},
			],
		},
		works: {
			label: '制作案例',
			title: ['从项目理解', '我们的制作方式'],
			description: '每个案例都围绕具体目标与现场条件展开。',
			linkLabel: '查看制作案例',
			items: [],
		},
		contact: {
			label: '咨询',
			title: ['咨询日本摄影与', '视频制作项目'],
			description: '无论处于初步策划阶段，还是已经确定拍摄日期，都可以先联系团队。',
			linkLabel: '开始项目咨询',
		},
	},
};
