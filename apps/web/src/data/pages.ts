import { site } from './site';
import type { ServiceCategoryId, WorksCategoryId } from './categories';
import type { DisplayText } from '@/lib/text/display-text';

export type MediaTone = 'neutral' | 'warm' | 'cool' | 'rust';

export interface ServiceField {
	categoryId: ServiceCategoryId;
	number: string;
	label: string;
	title: DisplayText;
	description: string;
	mediaLabel: string;
	mediaTone: MediaTone;
	formats: string[];
	reversed?: boolean;
}

export type WorkMediaType = 'photo' | 'video' | 'gallery';

export interface GalleryImage {
	label: string;
	alt: string;
	tone: MediaTone;
	src?: string;
}

export interface WorkCase {
	category?: string;
	title: string;
	description: string;
	scope: string;
	mediaLabel: string;
	mediaTone: MediaTone;
	mediaType: WorkMediaType;
	galleryImages?: GalleryImage[];
}

export interface WorkCategory {
	id: WorksCategoryId;
	number: string;
	label: string;
	title: DisplayText;
	description: string;
	impressionLabel: string;
	impressionTone: MediaTone;
	cases: WorkCase[];
}

export interface PageHeroContent {
	eyebrow: string;
	title: DisplayText;
	description: string;
}

export interface ServicesPageContent {
	metaTitle: string;
	metaDescription: string;
	hero: PageHeroContent;
	fieldsHeading: { label: string; title: DisplayText; description: string };
	fields: ServiceField[];
	processHeading: { label: string; title: DisplayText; description: string };
	process: { number: string; label: string; title: string; text: string }[];
	cta: { label: string; title: DisplayText; linkLabel: string };
}

export interface WorksPageContent {
	metaTitle: string;
	metaDescription: string;
	hero: PageHeroContent;
	categories: WorkCategory[];
	cta: { label: string; title: DisplayText; linkLabel: string };
}

export interface SampleRequestContent {
	label: string;
	title: DisplayText;
	description: string;
	linkLabel: string;
}

export interface AboutPageContent {
	metaTitle: string;
	metaDescription: string;
	hero: PageHeroContent;
	mediaLabel: string;
	statementLabel: string;
	statementTitle: DisplayText;
	statementParagraphs: string[];
	attitudeHeading: { label: string; title: DisplayText };
	attitudes: { number: string; title: string; text: string }[];
	typesHeading: { label: string; title: DisplayText; description: string };
	projectTypes: string[];
	languageLabel: string;
	languageTitle: DisplayText;
	languageDescription: string;
	companyInfo: { term: string; detail: string }[];
	sampleRequest: SampleRequestContent;
}

export interface InquiryFormContent {
	ariaLabel: string;
	nameLabel: string;
	nameEnglish: string;
	namePlaceholder: string;
	emailLabel: string;
	emailEnglish: string;
	projectLabel: string;
	projectEnglish: string;
	projectPlaceholder: string;
	projectOptions: string[];
	dateLabel: string;
	dateEnglish: string;
	datePlaceholder: string;
	locationLabel: string;
	locationEnglish: string;
	locationPlaceholder: string;
	messageLabel: string;
	messageEnglish: string;
	messagePlaceholder: string;
	buttonLabel: string;
	statusText: string;
}

export interface ContactPageContent {
	metaTitle: string;
	metaDescription: string;
	hero: PageHeroContent;
	guideLabel: string;
	guideTitle: DisplayText;
	guideItems: string[];
	googleFormTitle: string;
	googleFormText: string;
	formHeading: string;
	formStatus: string;
	form: InquiryFormContent;
	facts: { label: string; value: string }[];
	sampleRequest: SampleRequestContent;
}

const serviceFormats = {
	ja: {
		event: ['企画', '写真撮影', '映像撮影', '当日共有', '編集', '納品'],
		space: ['撮影計画', '写真撮影', '短編映像', 'レタッチ', '納品'],
		interview: ['構成', 'インタビュー', '写真撮影', '映像撮影', '編集'],
		portrait: ['撮影設計', '人物撮影', 'プロフィール映像', 'レタッチ', '納品'],
	},
	zh: {
		event: ['策划', '摄影', '视频拍摄', '现场交付', '编辑', '交付'],
		space: ['拍摄计划', '摄影', '短视频', '修图', '交付'],
		interview: ['内容整理', '访谈', '摄影', '视频拍摄', '编辑'],
		portrait: ['拍摄设计', '人像摄影', '形象视频', '修图', '交付'],
	},
};

export const servicesPageContent: Record<'ja' | 'zh', ServicesPageContent> = {
	ja: {
		metaTitle: 'サービス',
		metaDescription: 'イベント、空間、インタビュー、ポートレートに対応する写真・映像制作サービス。',
		hero: {
			eyebrow: 'サービス',
			title: ['プロジェクトの目的から、', '最適な制作体制を組み立てる。'],
			description: '単一の撮影メニューではなく、企画、写真、映像、編集、納品を目的に合わせて設計します。',
		},
		fieldsHeading: {
			label: '制作領域',
			title: '4つの事業領域',
			description: '現場と用途に応じて、写真・映像・迅速な素材共有を組み合わせます。',
		},
		fields: [
			{ categoryId: 'event', number: '01', label: 'イベント / 会議', title: 'イベント・カンファレンス', description: '企業イベントや会議の進行、登壇者、参加者の交流を記録します。', mediaLabel: 'イベント制作', mediaTone: 'rust', formats: serviceFormats.ja.event },
			{ categoryId: 'space', number: '02', label: '空間 / 宿泊', title: '空間・宿泊施設', description: 'ホテル、店舗、施設の設計意図や利用体験を視覚化します。', mediaLabel: '空間制作', mediaTone: 'warm', formats: serviceFormats.ja.space, reversed: true },
			{ categoryId: 'interview', number: '03', label: 'インタビュー', title: 'インタビュー・ブランドストーリー', description: '企業や人の背景を聞き取り、信頼感のあるコンテンツとして構成します。', mediaLabel: 'インタビュー制作', mediaTone: 'cool', formats: serviceFormats.ja.interview },
			{ categoryId: 'portrait', number: '04', label: 'ポートレート', title: 'ポートレート・プロフィール', description: '用途に合わせて自然で整った人物表現を制作します。', mediaLabel: 'ポートレート制作', mediaTone: 'neutral', formats: serviceFormats.ja.portrait, reversed: true },
		],
		processHeading: { label: '制作の流れ', title: '相談から納品まで', description: '制作範囲と成果物を明確にし、各工程を一貫して進行します。' },
		process: [
			{ number: '01', label: '相談', title: 'お問い合わせ・ヒアリング', text: '背景、用途、日程、場所、納品希望を確認します。' },
			{ number: '02', label: '設計', title: '企画・方向設計', text: '撮影内容、進行、体制、ビジュアル方向を整理します。' },
			{ number: '03', label: '撮影', title: '現場撮影', text: '計画を軸に、現場の変化に対応しながら撮影します。' },
			{ number: '04', label: '編集', title: '編集・レタッチ', text: '選定、色調整、レタッチ、編集を行います。' },
			{ number: '05', label: '納品', title: '最終納品', text: '合意した形式とスケジュールでデータを納品します。' },
		],
		cta: { label: '制作相談', title: '目的に合った制作方法をご提案します。', linkLabel: '制作について相談する' },
	},
	zh: {
		metaTitle: '服务',
		metaDescription: '面向活动、空间、访谈与人像项目的摄影和视频制作服务。',
		hero: {
			eyebrow: '服务',
			title: ['围绕项目场景，', '组织完整的影像制作。'],
			description: '我们从项目目的出发，统筹策划、摄影、视频、现场交付、编辑与最终文件交付。',
		},
		fieldsHeading: {
			label: '业务领域',
			title: '四大业务领域',
			description: '每个领域都可以根据项目需要，组合照片、视频与快速交付方式。',
		},
		fields: [
			{ categoryId: 'event', number: '01', label: '活动 / 会议', title: '活动与会议', description: '记录企业活动、会议流程、演讲内容与现场交流。', mediaLabel: '活动制作', mediaTone: 'rust', formats: serviceFormats.zh.event },
			{ categoryId: 'space', number: '02', label: '空间 / 住宿', title: '空间与住宿', description: '呈现酒店、店铺和空间项目的设计、设施与使用体验。', mediaLabel: '空间制作', mediaTone: 'warm', formats: serviceFormats.zh.space, reversed: true },
			{ categoryId: 'interview', number: '03', label: '访谈', title: '访谈与品牌故事', description: '从采访和内容方向开始，制作可信的品牌叙事。', mediaLabel: '访谈制作', mediaTone: 'cool', formats: serviceFormats.zh.interview },
			{ categoryId: 'portrait', number: '04', label: '人像', title: '人像与职业形象', description: '为个人、团队和企业资料制作自然且专业的形象。', mediaLabel: '人像制作', mediaTone: 'neutral', formats: serviceFormats.zh.portrait, reversed: true },
		],
		processHeading: { label: '制作流程', title: '从沟通到交付', description: '清晰的流程让范围、现场执行与最终成果保持一致。' },
		process: [
			{ number: '01', label: '咨询', title: '咨询与需求沟通', text: '确认项目背景、用途、时间、地点及交付预期。' },
			{ number: '02', label: '策划', title: '策划与方向', text: '整理拍摄重点、现场流程、人员安排与视觉方向。' },
			{ number: '03', label: '拍摄', title: '现场拍摄', text: '根据计划执行，并针对现场变化保持专业判断。' },
			{ number: '04', label: '编辑', title: '剪辑与后期', text: '完成筛选、调色、精修、剪辑及必要的内容整理。' },
			{ number: '05', label: '交付', title: '最终交付', text: '按照约定格式、尺寸与时间提供最终文件。' },
		],
		cta: { label: '项目咨询', title: '从项目目标开始，确定合适的制作方式。', linkLabel: '咨询制作项目' },
	},
};

const jaWorkCategories: WorkCategory[] = [
	{
		id: 'featured',
		number: '00',
		label: '注目プロジェクト',
		title: '注目のプロジェクト',
		description: '複数の制作領域を組み合わせた代表的なサンプルです。',
		impressionLabel: '代表的な制作事例',
		impressionTone: 'rust',
		cases: [
			{ title: '会議と採用広報の記録', description: 'イベント記録と人物撮影を組み合わせた広報用サンプル。', scope: '写真 / 映像 / 編集', mediaLabel: '複合制作', mediaTone: 'rust', mediaType: 'gallery' },
			{ title: '宿泊施設のブランド素材', description: '空間、スタッフ、滞在シーンをまとめた制作事例。', scope: '空間撮影 / 短編映像', mediaLabel: '宿泊施設素材', mediaTone: 'warm', mediaType: 'gallery' },
		],
	},
	{
		id: 'event',
		number: '01',
		label: 'イベント / 会議',
		title: 'イベント・カンファレンス',
		description: '会場全体の空気、登壇者、参加者の交流を一日の流れとして記録します。',
		impressionLabel: 'イベントの空気感',
		impressionTone: 'rust',
		cases: [
			{ title: '企業カンファレンス', description: '登壇、会場、参加者交流を一日の流れとして記録。', scope: 'イベント撮影 / 当日共有', mediaLabel: 'カンファレンス撮影', mediaTone: 'rust', mediaType: 'gallery' },
			{ title: '発表会ハイライト', description: '公開用写真と短い映像素材を同時に制作。', scope: '写真 / 映像', mediaLabel: '発表会素材', mediaTone: 'cool', mediaType: 'photo' },
		],
	},
	{
		id: 'space',
		number: '02',
		label: '空間 / 宿泊',
		title: '空間・宿泊施設',
		description: '設計、素材、光、利用シーンから、その場所で過ごす時間を伝えます。',
		impressionLabel: '空間と滞在の雰囲気',
		impressionTone: 'warm',
		cases: [
			{ title: 'ホテル客室と共用部', description: '空間設計、光、滞在導線を伝える写真シリーズ。', scope: '空間撮影 / レタッチ', mediaLabel: 'ホテル空間', mediaTone: 'warm', mediaType: 'gallery' },
			{ title: '店舗利用シーン', description: '利用者目線のシーンとディテールを組み合わせて撮影。', scope: '写真 / シーン設計', mediaLabel: '店舗撮影', mediaTone: 'neutral', mediaType: 'photo' },
		],
	},
	{
		id: 'interview',
		number: '03',
		label: 'インタビュー',
		title: 'インタビュー・ブランドストーリー',
		description: '人の言葉と仕事の風景を組み合わせ、組織の背景と価値観を伝えます。',
		impressionLabel: '言葉と仕事の記録',
		impressionTone: 'cool',
		cases: [
			{ title: '創業者インタビュー', description: '言葉、表情、仕事場のディテールを組み合わせたブランドストーリー。', scope: '構成 / 写真 / 編集', mediaLabel: 'インタビュー記録', mediaTone: 'cool', mediaType: 'gallery' },
			{ title: 'チーム紹介コンテンツ', description: '採用や広報に使える人物と現場の紹介素材を制作。', scope: '人物撮影 / 取材', mediaLabel: 'チーム紹介', mediaTone: 'neutral', mediaType: 'photo' },
		],
	},
	{
		id: 'portrait',
		number: '04',
		label: 'ポートレート',
		title: 'ポートレート・プロフィール',
		description: '用途と人物像を理解し、自然さと信頼感を両立した表現を設計します。',
		impressionLabel: '人物表現',
		impressionTone: 'neutral',
		cases: [
			{ title: 'クリエイティブリーダー', description: '複数名のプロフィールを統一感のあるシリーズとして撮影。', scope: '人物撮影 / レタッチ', mediaLabel: 'リーダー撮影', mediaTone: 'neutral', mediaType: 'gallery' },
			{ title: '経営者プロフィール', description: '企業サイトと広報資料に対応する人物写真を制作。', scope: '撮影設計 / 写真', mediaLabel: 'プロフィール撮影', mediaTone: 'cool', mediaType: 'photo' },
			{ title: 'アーティストの制作現場', description: '制作環境と人物を組み合わせた短いプロフィール映像。', scope: '人物撮影 / 映像', mediaLabel: 'アーティスト映像', mediaTone: 'warm', mediaType: 'video' },
		],
	},
	{
		id: 'video',
		number: '05',
		label: '映像プロジェクト',
		title: '映像プロジェクト',
		description: '音、動き、時間の流れを生かし、短編映像や記録映像として構成します。',
		impressionLabel: '映像の流れ',
		impressionTone: 'rust',
		cases: [
			{ title: '工房の一日', description: '制作現場の一日を観察的に撮影したサンプル映像。', scope: '映像 / 音声 / 編集', mediaLabel: '工房映像', mediaTone: 'rust', mediaType: 'video' },
			{ title: '宿泊施設ブランド映像', description: '到着から滞在までの時間を短編映像として構成。', scope: '企画 / 映像', mediaLabel: '宿泊映像', mediaTone: 'warm', mediaType: 'video' },
			{ title: 'イベントハイライト', description: 'イベントの要点と熱量を公開用ハイライトに編集。', scope: 'イベント / 映像 / 編集', mediaLabel: 'ハイライト映像', mediaTone: 'cool', mediaType: 'video' },
		],
	},
];

const zhWorkCategories: WorkCategory[] = [
	{
		id: 'featured',
		number: '00',
		label: '精选项目',
		title: '精选项目',
		description: '结合多个制作领域的代表性样例。',
		impressionLabel: '代表性制作案例',
		impressionTone: 'rust',
		cases: [
			{ title: '会议与招聘传播记录', description: '结合活动记录与人物拍摄的传播素材样例。', scope: '摄影 / 视频 / 编辑', mediaLabel: '综合制作', mediaTone: 'rust', mediaType: 'gallery' },
			{ title: '住宿品牌素材', description: '整理空间、工作人员与入住场景的制作案例。', scope: '空间拍摄 / 短视频', mediaLabel: '住宿素材', mediaTone: 'warm', mediaType: 'gallery' },
		],
	},
	{
		id: 'event',
		number: '01',
		label: '活动 / 会议',
		title: '活动与会议',
		description: '以完整的一天为单位，记录场地氛围、演讲内容与参与者交流。',
		impressionLabel: '活动现场氛围',
		impressionTone: 'rust',
		cases: [
			{ title: '企业会议', description: '记录演讲、场地与参与者交流，呈现完整活动流程。', scope: '活动摄影 / 现场交付', mediaLabel: '会议拍摄', mediaTone: 'rust', mediaType: 'gallery' },
			{ title: '发布会亮点', description: '同步制作公开用照片与短视频素材。', scope: '摄影 / 视频', mediaLabel: '发布会素材', mediaTone: 'cool', mediaType: 'photo' },
		],
	},
	{
		id: 'space',
		number: '02',
		label: '空间 / 住宿',
		title: '空间与住宿',
		description: '从设计、材质、光线与使用场景中传达空间体验。',
		impressionLabel: '空间与住宿氛围',
		impressionTone: 'warm',
		cases: [
			{ title: '酒店客房与公共区域', description: '用系列照片呈现空间设计、光线与入住动线。', scope: '空间摄影 / 修图', mediaLabel: '酒店空间', mediaTone: 'warm', mediaType: 'gallery' },
			{ title: '店铺使用场景', description: '结合顾客视角的场景与细节进行拍摄。', scope: '摄影 / 场景设计', mediaLabel: '店铺拍摄', mediaTone: 'neutral', mediaType: 'photo' },
		],
	},
	{
		id: 'interview',
		number: '03',
		label: '访谈 / 品牌故事',
		title: '访谈与品牌故事',
		description: '结合人物表达与工作现场，传达组织背景和价值观。',
		impressionLabel: '人物表达与现场',
		impressionTone: 'cool',
		cases: [
			{ title: '创始人访谈', description: '结合语言、表情与工作场景细节，形成品牌故事内容。', scope: '内容整理 / 摄影 / 编辑', mediaLabel: '访谈记录', mediaTone: 'cool', mediaType: 'gallery' },
			{ title: '团队介绍内容', description: '制作适用于招聘与传播的人物和现场介绍素材。', scope: '人物摄影 / 采访', mediaLabel: '团队介绍', mediaTone: 'neutral', mediaType: 'photo' },
		],
	},
	{
		id: 'portrait',
		number: '04',
		label: '人像',
		title: '人像与职业形象',
		description: '理解人物与用途，在自然状态和专业信任之间建立平衡。',
		impressionLabel: '人物形象',
		impressionTone: 'neutral',
		cases: [
			{ title: '创意负责人', description: '为多位负责人建立统一且保留个性的形象系列。', scope: '人像摄影 / 修图', mediaLabel: '负责人拍摄', mediaTone: 'neutral', mediaType: 'gallery' },
			{ title: '管理者形象', description: '适用于企业网站与公关资料的管理者肖像。', scope: '拍摄设计 / 摄影', mediaLabel: '管理者肖像', mediaTone: 'cool', mediaType: 'photo' },
			{ title: '工作室中的艺术家', description: '结合创作环境与人物状态的短篇形象视频。', scope: '人像 / 视频', mediaLabel: '艺术家视频', mediaTone: 'warm', mediaType: 'video' },
		],
	},
	{
		id: 'video',
		number: '05',
		label: '视频项目',
		title: '视频项目',
		description: '利用声音、动作与时间变化，制作品牌短片和记录内容。',
		impressionLabel: '视频节奏',
		impressionTone: 'rust',
		cases: [
			{ title: '工坊的一天', description: '以观察式拍摄呈现工作现场与制作精神。', scope: '视频 / 声音 / 编辑', mediaLabel: '工坊视频', mediaTone: 'rust', mediaType: 'video' },
			{ title: '住宿品牌短片', description: '将抵达至入住的过程组织成住宿品牌短片。', scope: '策划 / 视频', mediaLabel: '住宿视频', mediaTone: 'warm', mediaType: 'video' },
			{ title: '活动精彩回顾', description: '将活动重点与现场氛围剪辑为公开版精华。', scope: '活动 / 视频 / 编辑', mediaLabel: '活动回顾', mediaTone: 'cool', mediaType: 'video' },
		],
	},
];

export const worksPageContent: Record<'ja' | 'zh', WorksPageContent> = {
	ja: {
		metaTitle: '制作実績',
		metaDescription: 'イベント、空間、インタビュー、ポートレートの制作事例。',
		hero: { eyebrow: '制作実績', title: ['目的と現場から、', 'プロジェクトを設計する。'], description: 'プロジェクトの背景、制作範囲、成果物が伝わるサンプル事例として紹介します。' },
		categories: jaWorkCategories,
		cta: { label: '制作相談', title: '日本で同様のプロジェクトを検討されていますか。', linkLabel: '制作チームに相談する' },
	},
	zh: {
		metaTitle: '制作案例',
		metaDescription: '活动、空间、访谈与人像项目的制作案例。',
		hero: { eyebrow: '制作案例', title: ['每个项目，', '都从目的与现场开始。'], description: '案例以项目为单位呈现制作范围和内容方向。当前影像区域为本地占位素材。' },
		categories: zhWorkCategories,
		cta: { label: '项目咨询', title: '需要在日本完成类似项目吗。', linkLabel: '联系制作团队' },
	},
};

export const aboutPageContent: Record<'ja' | 'zh', AboutPageContent> = {
	ja: {
		metaTitle: '会社について',
		metaDescription: '制作領域、姿勢、日本国内での実行体制、多言語対応について。',
		hero: { eyebrow: '会社について', title: ['日本を拠点に、', '企画から納品まで支える。'], description: '企業、組織、ブランドのための写真・映像制作会社として、映像がプロジェクトにどう機能するかを考え続けます。' },
		mediaLabel: '制作チーム',
		statementLabel: '会社の考え方',
		statementTitle: ['画を記録するだけでなく、', '何を伝えるべきかを', '理解する。'],
		statementParagraphs: [
			`${site.name}は、イベント、空間、インタビュー、ブランドストーリー、人物撮影を支援します。用途から写真、映像、当日共有、編集を設計します。`,
			'日本国内での現場実行に加え、企画、方向設計、撮影、編集、最終納品まで一貫して対応します。',
		],
		attitudeHeading: { label: '制作姿勢', title: '制作に対する姿勢' },
		attitudes: [
			{ number: '01', title: '目的を先に理解する', text: 'ブランド発信、記録、採用、販売など、用途に応じて撮影の重点を整理します。' },
			{ number: '02', title: '現場で判断する', text: '事前計画を軸にしながら、時間、人、空間の変化に応じて判断します。' },
			{ number: '03', title: '納品まで責任を持つ', text: 'ファイル仕様、公開時期、編集工程までを制作の一部として扱います。' },
		],
		typesHeading: { label: '対応領域', title: '対応するプロジェクト', description: '企業活動、商業空間、ブランドコンテンツ、人物表現に合わせた制作体制を提供します。' },
		projectTypes: ['イベント・会議', '空間・宿泊施設', 'インタビュー・ブランド', 'ポートレート'],
		languageLabel: '多言語対応',
		languageTitle: ['日本での制作を、', '複数言語で支える。'],
		languageDescription: '関係者や資料の言語に合わせて、日本語、簡体中文、英語でのプロジェクトコミュニケーションを支援します。',
		companyInfo: [
			{ term: '会社名', detail: site.name },
			{ term: '読み方', detail: site.reading },
			{ term: '所在地', detail: '日本 / 詳細確認中' },
			{ term: '事業内容', detail: '写真撮影、映像制作、編集、納品' },
			{ term: '備考', detail: '会社情報は仮の表示です' },
		],
		sampleRequest: {
			label: '相談サンプル',
			title: '制作事例や参考範囲について相談する',
			description: '参考事例をご希望の場合は、撮影内容、用途、希望する方向性をお知らせください。',
			linkLabel: '問い合わせる',
		},
	},
	zh: {
		metaTitle: '关于公司',
		metaDescription: `了解${site.name}的制作领域、工作态度、日本本地执行与多语言支持。`,
		hero: { eyebrow: '关于公司', title: ['立足日本，', '为项目提供完整影像制作支持。'], description: '我们面向企业、组织与品牌提供摄影和视频制作，从前期理解到最终交付，持续关注影像如何服务项目。' },
		mediaLabel: '制作团队',
		statementLabel: '公司理念',
		statementTitle: ['不只是记录画面，', '而是理解项目需要传达什么。'],
		statementParagraphs: [
			`${site.name}支持活动、空间、访谈、品牌故事与人物形象等项目。我们根据用途组织摄影、视频和现场快速交付。`,
			'团队在日本本地执行，并可从策划、方向整理、现场拍摄、编辑与交付持续支持。',
		],
		attitudeHeading: { label: '制作态度', title: '我们的制作态度' },
		attitudes: [
			{ number: '01', title: '先理解项目目的', text: '影像用于品牌传播、活动记录、招聘还是销售，会决定拍摄重点与制作方式。' },
			{ number: '02', title: '重视现场判断', text: '前期计划建立共同方向，现场则根据时间、人物与空间变化保持专业判断。' },
			{ number: '03', title: '对最终交付负责', text: '从文件规格到发布时间，将后期与交付作为制作的一部分。' },
		],
		typesHeading: { label: '项目类型', title: '支持的项目类型', description: '围绕企业活动、商业空间、品牌内容与人物表达，提供适合规模的制作组合。' },
		projectTypes: ['活动与会议', '空间与住宿', '访谈与品牌故事', '人像与职业形象'],
		languageLabel: '多语言支持',
		languageTitle: ['在日本制作，', '以多语言沟通支持。'],
		languageDescription: '根据项目参与方和资料语言，支持日语、简体中文与英语沟通。',
		companyInfo: [
			{ term: '公司名称', detail: site.name },
			{ term: '日语读音', detail: site.reading },
			{ term: '所在地', detail: '日本 / 详细信息待确认' },
			{ term: '业务内容', detail: '摄影、视频制作、编辑、交付' },
			{ term: '备注', detail: '公司信息为临时显示' },
		],
		sampleRequest: {
			label: '咨询样例',
			title: '咨询拍摄案例与参考样片',
			description: '如需查看过往制作参考，请在咨询时说明拍摄内容、项目用途与期望方向。',
			linkLabel: '前往咨询',
		},
	},
};

export const contactPageContent: Record<'ja' | 'zh', ContactPageContent> = {
	ja: {
		metaTitle: 'お問い合わせ',
		metaDescription: '日本国内の写真・映像制作プロジェクトに関するお問い合わせページ。',
		hero: { eyebrow: 'お問い合わせ', title: ['プロジェクトの背景、', '日程、用途から', 'お聞かせください。'], description: '企画段階でも、撮影日が決まっている案件でも、現在わかる範囲から制作内容をご相談ください。' },
		guideLabel: 'ご相談前に',
		guideTitle: 'ご相談時にあると役立つ情報',
		guideItems: ['プロジェクトの背景と用途', '撮影希望日と所要時間', '都市、会場、地域', '希望する成果物', '納品時期と使用媒体'],
		googleFormTitle: '外部フォーム連携予定',
		googleFormText: '正式な送信方法は後続フェーズで確定します。',
		formHeading: 'お問い合わせフォーム',
		formStatus: '静的表示 / 送信なし',
		form: {
			ariaLabel: 'プロジェクトお問い合わせフォーム',
			nameLabel: 'お名前 / 会社名',
			nameEnglish: 'お名前 / 会社名',
			namePlaceholder: 'お名前または会社名',
			emailLabel: 'メールアドレス',
			emailEnglish: 'メールアドレス',
			projectLabel: 'プロジェクト種別',
			projectEnglish: 'プロジェクト種別',
			projectPlaceholder: '種別を選択',
			projectOptions: ['イベント', '空間', 'インタビュー', 'ポートレート', 'その他'],
			dateLabel: '撮影希望日',
			dateEnglish: '撮影希望日',
			datePlaceholder: 'YYYY / MM / DD または未定',
			locationLabel: '撮影場所',
			locationEnglish: '撮影場所',
			locationPlaceholder: '都市、会場、地域',
			messageLabel: 'ご相談内容',
			messageEnglish: 'ご相談内容',
			messagePlaceholder: '背景、用途、必要な制作内容、納期など',
			buttonLabel: '相談内容を送信',
			statusText: 'デモ表示のため送信されません。正式版では確認済みの連絡方法に接続します。',
		},
		facts: [
			{ label: '対応エリア', value: '日本国内を中心に対応' },
			{ label: '対応言語', value: '日本語 / 简体中文 / English' },
			{ label: '返信目安', value: '仮表示' },
		],
		sampleRequest: {
			label: '相談サンプル',
			title: '制作事例や参考範囲について相談する',
			description: '参考事例をご希望の場合は、フォームに撮影内容と用途をご記入ください。',
			linkLabel: '問い合わせる',
		},
	},
	zh: {
		metaTitle: '项目咨询',
		metaDescription: '咨询在日本的活动、空间、访谈、人像摄影与视频制作项目。',
		hero: { eyebrow: '项目咨询', title: ['请从项目背景、', '时间与用途开始说明。'], description: '即使项目仍在策划中，也可以先就制作范围和执行方式进行沟通。' },
		guideLabel: '咨询前',
		guideTitle: '有助于确认项目的信息',
		guideItems: ['项目背景与影像用途', '拍摄日期与预计时长', '城市、场地或大致区域', '需要的交付内容', '交付时间与使用平台'],
		googleFormTitle: '外部表单链接预留位置',
		googleFormText: '正式链接将在后续阶段加入。',
		formHeading: '项目咨询表单',
		formStatus: '静态展示 / 暂不提交',
		form: {
			ariaLabel: '项目咨询表单',
			nameLabel: '姓名 / 公司名称',
			nameEnglish: '姓名 / 公司名称',
			namePlaceholder: '请输入姓名或公司名称',
			emailLabel: '邮箱',
			emailEnglish: '邮箱',
			projectLabel: '项目类型',
			projectEnglish: '项目类型',
			projectPlaceholder: '请选择项目类型',
			projectOptions: ['活动', '空间', '访谈', '人像', '其他'],
			dateLabel: '拍摄日期',
			dateEnglish: '拍摄日期',
			datePlaceholder: 'YYYY / MM / DD 或待定',
			locationLabel: '拍摄地点',
			locationEnglish: '拍摄地点',
			locationPlaceholder: '城市、场地或大致区域',
			messageLabel: '项目说明',
			messageEnglish: '项目说明',
			messagePlaceholder: '请简单说明项目背景、用途、所需内容与交付时间',
			buttonLabel: '提交项目咨询',
			statusText: '演示表单暂不提交数据。正式版本将接入确认后的联系渠道。',
		},
		facts: [
			{ label: '制作区域', value: '以日本为主' },
			{ label: '支持语言', value: '日本語 / 简体中文 / English' },
			{ label: '回复', value: '临时显示' },
		],
		sampleRequest: {
			label: '咨询样例',
			title: '咨询拍摄案例与参考样片',
			description: '如需过往制作参考，请在表单中填写拍摄内容与用途。',
			linkLabel: '前往咨询',
		},
	},
};
