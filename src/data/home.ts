import { site } from './site';

export interface HomeNewsItem {
	date: string;
	category: string;
	title: string;
	excerpt: string;
}

export interface HomeServiceItem {
	number: string;
	label: string;
	title: string;
	description: string;
	mediaLabel: string;
	mediaTone: 'neutral' | 'warm' | 'cool' | 'rust';
}

export interface HomeWorkItem {
	category: string;
	title: string;
	description: string;
	scope: string;
	mediaLabel: string;
	mediaTone: 'neutral' | 'warm' | 'cool' | 'rust';
}

export interface HomeContent {
	hero: {
		label: string;
		title: string;
		description: string;
		mediaLabel: string;
	};
	about: {
		label: string;
		title: string;
		description: string;
		languageNote: string;
		linkLabel: string;
	};
	news: {
		label: string;
		title: string;
		items: HomeNewsItem[];
	};
	services: {
		label: string;
		title: string;
		description: string;
		linkLabel: string;
		items: HomeServiceItem[];
	};
	works: {
		label: string;
		title: string;
		description: string;
		linkLabel: string;
		items: HomeWorkItem[];
	};
	contact: {
		label: string;
		title: string;
		description: string;
		linkLabel: string;
	};
}

export const homeContent: Record<'ja' | 'zh', HomeContent> = {
	ja: {
		hero: {
			label: 'Photography / Film / Live Delivery',
			title: '企画から納品まで、現場に応える映像制作。',
			description:
				'イベント、空間、インタビュー、ポートレート。目的に合わせて写真と映像を設計し、制作全体を一貫して支えます。',
			mediaLabel: 'Cinematic hero visual',
		},
		about: {
			label: 'About',
			title: '伝えるべき価値を、現場から丁寧にすくい上げる。',
			description:
				`${site.name}は、日本国内の写真・映像制作を企画から撮影、編集、納品まで支援するプロダクションです。企業活動や空間、人の魅力を理解し、用途に適したかたちで届けます。`,
			languageNote: '日本語・英語・中国語に対応',
			linkLabel: '会社について',
		},
		news: {
			label: 'News / Recent Projects',
			title: '最近の取り組み',
			items: [
				{
					date: '2026.06.08',
					category: 'EVENT',
					title: '企業カンファレンスの写真・映像記録を担当',
					excerpt: '登壇、会場、交流の様子を一日の流れに沿って記録しました。',
				},
				{
					date: '2026.05.24',
					category: 'SPACE',
					title: '宿泊施設のブランドビジュアル制作',
					excerpt: '客室、共用部、滞在体験を伝える写真と短編映像を制作しました。',
				},
				{
					date: '2026.05.10',
					category: 'INTERVIEW',
					title: '採用向けインタビューコンテンツを制作',
					excerpt: '企画、収録、編集まで一貫して企業の声を形にしました。',
				},
			],
		},
		services: {
			label: 'Services',
			title: '4つの事業領域',
			description:
				'プロジェクトの目的と現場条件を整理し、写真、映像、ライブデリバリーを組み合わせます。',
			linkLabel: 'サービス詳細',
			items: [
				{
					number: '01',
					label: 'Event / Conference',
					title: 'イベント・カンファレンス',
					description: '企業イベント、セミナー、国際会議などの重要な時間を記録します。',
					mediaLabel: 'Event and conference',
					mediaTone: 'rust',
				},
				{
					number: '02',
					label: 'Space / Property / Stay',
					title: '空間・不動産・宿泊施設',
					description: '空間の設計意図と利用体験が伝わる写真・映像を制作します。',
					mediaLabel: 'Space and property',
					mediaTone: 'warm',
				},
				{
					number: '03',
					label: 'Interview / Documentary',
					title: 'インタビュー・ブランドストーリー',
					description: '企業や人の背景を聞き取り、信頼につながる物語として構成します。',
					mediaLabel: 'Interview and documentary',
					mediaTone: 'cool',
				},
				{
					number: '04',
					label: 'Portrait / Profile',
					title: 'ポートレート・プロフィール',
					description: 'ビジネス、アーティスト、チームの個性を自然に引き出します。',
					mediaLabel: 'Portrait and profile',
					mediaTone: 'neutral',
				},
			],
		},
		works: {
			label: 'Selected Works',
			title: 'プロジェクトから見る制作実績',
			description: '媒体ではなく、目的と現場に合わせて設計したケースを紹介します。',
			linkLabel: '制作実績を見る',
			items: [
				{
					category: 'EVENT / CONFERENCE',
					title: 'Annual Business Conference 2026',
					description: '基調講演からネットワーキングまで、イベント全体の熱量を写真と映像で記録。',
					scope: 'PHOTO / FILM / LIVE DELIVERY',
					mediaLabel: 'Conference project',
					mediaTone: 'rust',
				},
				{
					category: 'SPACE / STAY',
					title: 'Quiet Stay in Setouchi',
					description: '光、素材、周辺環境を通して、宿泊施設で過ごす時間を視覚化。',
					scope: 'PLANNING / PHOTO / SHORT FILM',
					mediaLabel: 'Hospitality project',
					mediaTone: 'warm',
				},
				{
					category: 'INTERVIEW / BRAND STORY',
					title: 'People Behind the Brand',
					description: '創業者と現場チームへの取材から、企業の姿勢を短編ドキュメンタリーに。',
					scope: 'DIRECTION / INTERVIEW / EDITING',
					mediaLabel: 'Brand story project',
					mediaTone: 'cool',
				},
			],
		},
		contact: {
			label: 'Contact',
			title: '撮影・映像制作のご相談はこちら',
			description: '企画段階のご相談から、撮影日が決まっている案件まで対応します。',
			linkLabel: 'プロジェクトを相談する',
		},
	},
	zh: {
		hero: {
			label: 'Photography / Film / Live Delivery',
			title: '从策划到交付，为现场提供完整的影像制作。',
			description:
				'面向活动、空间、访谈与人像项目，根据传播目标统筹摄影、视频与现场即时交付。',
			mediaLabel: 'Cinematic hero visual',
		},
		about: {
			label: 'About',
			title: '从真实现场中，提炼值得被看见的价值。',
			description:
				`${site.name}是一家位于日本的专业摄影与视频制作公司，提供从策划、拍摄、编辑到最终交付的一体化支持。`,
			languageNote: '支持日语、英语与中文项目沟通',
			linkLabel: '了解公司',
		},
		news: {
			label: 'News / Recent Projects',
			title: '近期项目',
			items: [
				{
					date: '2026.06.08',
					category: 'EVENT',
					title: '完成企业会议摄影与视频记录',
					excerpt: '围绕演讲、会场与交流环节，完整记录一天的活动流程。',
				},
				{
					date: '2026.05.24',
					category: 'SPACE',
					title: '完成住宿设施品牌视觉制作',
					excerpt: '通过客房、公共空间与入住体验呈现项目特点。',
				},
				{
					date: '2026.05.10',
					category: 'INTERVIEW',
					title: '制作企业招聘访谈内容',
					excerpt: '从策划与采访到剪辑，完整呈现企业团队的真实声音。',
				},
			],
		},
		services: {
			label: 'Services',
			title: '四大业务领域',
			description: '根据项目目标和现场条件，组合摄影、视频、现场传图与后期制作。',
			linkLabel: '查看服务详情',
			items: [
				{
					number: '01',
					label: 'Event / Conference',
					title: '活动与会议',
					description: '记录企业活动、研讨会、国际会议及重要现场。',
					mediaLabel: 'Event and conference',
					mediaTone: 'rust',
				},
				{
					number: '02',
					label: 'Space / Property / Stay',
					title: '空间、地产与住宿',
					description: '通过照片与视频呈现空间设计、设施和真实体验。',
					mediaLabel: 'Space and property',
					mediaTone: 'warm',
				},
				{
					number: '03',
					label: 'Interview / Documentary',
					title: '访谈、纪录与品牌故事',
					description: '理解企业和人物背景，将真实内容组织成可信的叙事。',
					mediaLabel: 'Interview and documentary',
					mediaTone: 'cool',
				},
				{
					number: '04',
					label: 'Portrait / Profile',
					title: '人像与职业形象',
					description: '为商务人士、艺术家及团队呈现自然且专业的形象。',
					mediaLabel: 'Portrait and profile',
					mediaTone: 'neutral',
				},
			],
		},
		works: {
			label: 'Selected Works',
			title: '从项目理解我们的制作',
			description: '每个案例都围绕具体目标与现场条件展开，而不是简单堆叠照片。',
			linkLabel: '查看制作案例',
			items: [
				{
					category: 'EVENT / CONFERENCE',
					title: 'Annual Business Conference 2026',
					description: '从主题演讲到现场交流，以摄影、视频和即时传图记录完整活动。',
					scope: 'PHOTO / FILM / LIVE DELIVERY',
					mediaLabel: 'Conference project',
					mediaTone: 'rust',
				},
				{
					category: 'SPACE / STAY',
					title: 'Quiet Stay in Setouchi',
					description: '通过光线、材质与周边环境，呈现住宿空间的真实体验。',
					scope: 'PLANNING / PHOTO / SHORT FILM',
					mediaLabel: 'Hospitality project',
					mediaTone: 'warm',
				},
				{
					category: 'INTERVIEW / BRAND STORY',
					title: 'People Behind the Brand',
					description: '采访创始人与团队成员，将企业态度制作成短篇纪录内容。',
					scope: 'DIRECTION / INTERVIEW / EDITING',
					mediaLabel: 'Brand story project',
					mediaTone: 'cool',
				},
			],
		},
		contact: {
			label: 'Contact',
			title: '咨询日本摄影与视频制作项目',
			description: '无论处于初步策划阶段，还是已经确定拍摄日期，都可以联系我们。',
			linkLabel: '开始项目咨询',
		},
	},
};
