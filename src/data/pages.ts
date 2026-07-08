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

export interface WorkCase {
	title: string;
	description: string;
	scope: string;
	mediaLabel: string;
	mediaTone: MediaTone;
	mediaType: WorkMediaType;
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

const sharedFormats = {
	event: ['Photography', 'Videography', 'Live photo delivery', 'Planning', 'Editing', 'Delivery'],
	space: ['Photography', 'Short video', 'Detail cuts', 'Editing / Retouching', 'Delivery'],
	interview: ['Planning', 'Interview direction', 'Photography', 'Videography', 'Editing', 'Subtitles later'],
	portrait: ['Photography', 'Video profile', 'Direction', 'Retouching', 'Delivery'],
};

export const servicesPageContent: Record<'ja' | 'zh', ServicesPageContent> = {
	ja: {
		metaTitle: `サービス | ${site.name}`,
		metaDescription: 'イベント、空間、インタビュー、ポートレートの4領域に対応する写真・映像制作サービス。',
		hero: {
			eyebrow: 'Services',
			title: 'プロジェクトの目的から、最適な制作体制を組み立てる。',
			description: '単一の撮影メニューではなく、企画、写真、映像、ライブデリバリー、編集、納品を目的に合わせて設計します。',
		},
		fieldsHeading: {
			label: 'Business Fields',
			title: '4つの事業領域',
			description: '現場と用途に応じて、写真・映像・迅速な素材共有を組み合わせます。',
		},
		fields: [
			{ categoryId: 'event', number: '01', label: 'Event / Conference', title: 'イベント・カンファレンス', description: '企業イベント、国際会議、セミナーなどの空間、登壇、交流を記録。必要に応じて撮影当日の写真共有にも対応します。', mediaLabel: 'Event and conference production', mediaTone: 'rust', formats: sharedFormats.event },
			{ categoryId: 'space', number: '02', label: 'Space / Property / Stay', title: '空間・不動産・宿泊施設', description: 'ホテル、民泊、店舗、飲食店、不動産の設計意図、設備、ディテール、利用体験を視覚化します。', mediaLabel: 'Space and hospitality production', mediaTone: 'warm', formats: sharedFormats.space, reversed: true },
			{ categoryId: 'interview', number: '03', label: 'Interview / Documentary / Brand Story', title: 'インタビュー・ブランドストーリー', description: '創業者ストーリー、採用コンテンツ、企業紹介などを、事前のヒアリングから撮影・編集まで一貫して制作します。', mediaLabel: 'Interview and brand story production', mediaTone: 'cool', formats: sharedFormats.interview },
			{ categoryId: 'portrait', number: '04', label: 'Portrait / Profile', title: 'ポートレート・プロフィール', description: 'ビジネス、クリエイター、アーティスト、チームの個性を、用途に適した自然で信頼感のある表現に整えます。', mediaLabel: 'Portrait and profile production', mediaTone: 'neutral', formats: sharedFormats.portrait, reversed: true },
		],
		processHeading: { label: 'Production Process', title: '相談から納品まで', description: '制作範囲と成果物を明確にし、各工程を一貫して進行します。' },
		process: [
			{ number: '01', label: 'Inquiry / Hearing', title: 'お問い合わせ・ヒアリング', text: '背景、用途、日程、場所、納品希望を確認します。' },
			{ number: '02', label: 'Planning / Direction', title: '企画・方向設計', text: '撮影内容、進行、体制、ビジュアル方向を整理します。' },
			{ number: '03', label: 'Shooting', title: '撮影', text: '計画を軸に、現場の変化に対応しながら撮影します。' },
			{ number: '04', label: 'Editing / Retouching', title: '編集・レタッチ', text: '選定、色調整、レタッチ、編集を行います。' },
			{ number: '05', label: 'Delivery', title: '納品', text: '合意した形式とスケジュールでデータを納品します。' },
		],
		cta: { label: 'Project Inquiry', title: '目的に合った制作方法をご提案します。', linkLabel: '制作について相談する' },
	},
	zh: {
		metaTitle: `服务 | ${site.name}`,
		metaDescription: '了解活动会议、空间住宿、访谈纪录与人像形象四大影像制作领域。',
		hero: { eyebrow: 'Services', title: '围绕项目场景，组织完整的影像制作。', description: '我们不以单项功能拆分服务，而是从项目目的出发，统筹策划、摄影、视频、现场传图、编辑与交付。' },
		fieldsHeading: { label: 'Business Fields', title: '四大业务领域', description: '每个领域都可以根据项目需要，组合照片、视频与快速交付方式。' },
		fields: [
			{ categoryId: 'event', number: '01', label: 'Event / Conference', title: '活动与会议', description: '面向企业活动、国际会议、研讨会与大型聚会，完整记录空间、人物、演讲与现场交流。可根据传播节奏提供即时照片交付。', mediaLabel: 'Event and conference production', mediaTone: 'rust', formats: sharedFormats.event },
			{ categoryId: 'space', number: '02', label: 'Space / Property / Stay', title: '空间、地产与住宿', description: '为酒店、民宿、商业空间、餐厅与地产项目呈现设计、设施、细节及实际使用体验。', mediaLabel: 'Space and hospitality production', mediaTone: 'warm', formats: sharedFormats.space, reversed: true },
			{ categoryId: 'interview', number: '03', label: 'Interview / Documentary / Brand Story', title: '访谈、纪录与品牌故事', description: '从前期采访与内容方向开始，制作创始人故事、招聘内容、企业介绍及纪录风格的品牌影像。', mediaLabel: 'Interview and brand story production', mediaTone: 'cool', formats: sharedFormats.interview },
			{ categoryId: 'portrait', number: '04', label: 'Portrait / Profile', title: '人像与职业形象', description: '服务商务人士、创作者、艺术家与企业团队，在专业表达与自然状态之间建立合适的视觉形象。', mediaLabel: 'Portrait and profile production', mediaTone: 'neutral', formats: sharedFormats.portrait, reversed: true },
		],
		processHeading: { label: 'Production Process', title: '从沟通到交付', description: '清晰的制作流程，让项目范围、现场执行与最终成果保持一致。' },
		process: [
			{ number: '01', label: 'Inquiry / Hearing', title: '咨询与需求沟通', text: '确认项目背景、用途、时间、地点及交付预期。' },
			{ number: '02', label: 'Planning / Direction', title: '策划与方向', text: '整理拍摄重点、现场流程、人员安排与视觉方向。' },
			{ number: '03', label: 'Shooting', title: '现场拍摄', text: '根据计划执行，并针对现场变化保持专业判断。' },
			{ number: '04', label: 'Editing / Retouching', title: '剪辑与后期', text: '完成筛选、调色、精修、剪辑及必要的内容整理。' },
			{ number: '05', label: 'Delivery', title: '最终交付', text: '按照约定格式、尺寸与时间提供最终文件。' },
		],
		cta: { label: 'Project Inquiry', title: '从项目目标开始，确定合适的制作方式。', linkLabel: '咨询制作项目' },
	},
};

export const worksPageContent: Record<'ja' | 'zh', WorksPageContent> = {
	ja: {
		metaTitle: `制作実績 | ${site.name}`,
		metaDescription: 'イベント、空間、インタビュー、ポートレート、映像制作のケーススタディ。',
		hero: { eyebrow: 'Works / Case Study', title: '目的と現場から、プロジェクトを設計する。', description: '媒体単位ではなく、プロジェクトの背景、制作範囲、成果物が伝わるケースとして紹介します。' },
		categories: [
			{
				id: 'featured',
				number: '00',
				label: 'Featured Projects',
				title: '注目のプロジェクト',
				description: '複数の制作領域を組み合わせた代表的なプロジェクト。',
				impressionLabel: 'Selected production overview',
				impressionTone: 'rust',
				cases: [
					{ title: 'Annual Business Conference 2026', description: '企画連携から写真、映像、当日の素材共有までを一貫して担当。', scope: 'EVENT / PHOTO / FILM', mediaLabel: 'Annual conference', mediaTone: 'rust', mediaType: 'gallery' },
					{ title: 'Quiet Stay in Setouchi', description: '光と素材を通して、滞在施設のブランド体験を視覚化。', scope: 'SPACE / PHOTO / FILM', mediaLabel: 'Setouchi stay', mediaTone: 'warm', mediaType: 'photo' },
					{ title: 'People Behind the Brand', description: '創業者とチームの言葉から企業の姿勢を短編映像に。', scope: 'INTERVIEW / FILM', mediaLabel: 'Brand documentary', mediaTone: 'cool', mediaType: 'video' },
				],
			},
			{
				id: 'event',
				number: '01',
				label: 'Event / Conference',
				title: 'イベント・カンファレンス',
				description: '会場全体の空気、登壇者、参加者の交流を、一日の流れとして記録します。',
				impressionLabel: 'Live event atmosphere',
				impressionTone: 'rust',
				cases: [
					{ title: 'International Leadership Forum', description: '講演とディスカッションを中心に国際会議の全体像を記録。', scope: 'PHOTO / DOCUMENTATION', mediaLabel: 'Leadership forum', mediaTone: 'cool', mediaType: 'gallery' },
					{ title: 'Product Launch Evening', description: '発表、展示、来場者の反応をブランド発信向けに撮影。', scope: 'PHOTO / LIVE DELIVERY', mediaLabel: 'Product launch', mediaTone: 'rust', mediaType: 'photo' },
					{ title: 'Corporate Award Ceremony', description: '式典の進行と受賞者の表情を短編ハイライトに編集。', scope: 'FILM / EDITING', mediaLabel: 'Award ceremony', mediaTone: 'neutral', mediaType: 'video' },
				],
			},
			{
				id: 'space',
				number: '02',
				label: 'Space / Property / Stay',
				title: '空間・不動産・宿泊施設',
				description: '設計、素材、光、利用シーンから、その場所で過ごす時間を伝えます。',
				impressionLabel: 'Space and hospitality mood',
				impressionTone: 'warm',
				cases: [
					{ title: 'Urban Boutique Hotel', description: '客室と共用部を、静かな滞在体験として構成。', scope: 'PHOTO / RETOUCHING', mediaLabel: 'Boutique hotel', mediaTone: 'warm', mediaType: 'gallery' },
					{ title: 'Restaurant After Dusk', description: '夕方から夜へ変化する光と料理、サービスを撮影。', scope: 'PHOTO / SHORT FILM', mediaLabel: 'Restaurant interior', mediaTone: 'rust', mediaType: 'video' },
					{ title: 'Modern Residence Tokyo', description: '建築の線、素材、生活動線を販売資料向けに整理。', scope: 'ARCHITECTURE / PHOTO', mediaLabel: 'Modern residence', mediaTone: 'neutral', mediaType: 'photo' },
				],
			},
			{
				id: 'interview',
				number: '03',
				label: 'Interview / Documentary',
				title: 'インタビュー・ブランドストーリー',
				description: '人の言葉と仕事の風景を組み合わせ、組織の背景と価値観を伝えます。',
				impressionLabel: 'Voice and documentary detail',
				impressionTone: 'cool',
				cases: [
					{ title: 'Founder Story', description: '創業の背景と現在のビジョンを、落ち着いた語りで構成。', scope: 'DIRECTION / INTERVIEW', mediaLabel: 'Founder interview', mediaTone: 'cool', mediaType: 'video' },
					{ title: 'Inside the Design Team', description: '採用候補者に向けてチームの仕事と文化を紹介。', scope: 'PHOTO / FILM / EDITING', mediaLabel: 'Design team story', mediaTone: 'neutral', mediaType: 'gallery' },
					{ title: 'Craft and Continuity', description: '職人の手仕事と継承される考え方を写真で記録。', scope: 'DOCUMENTARY / PHOTO', mediaLabel: 'Craft documentary', mediaTone: 'warm', mediaType: 'photo' },
				],
			},
			{
				id: 'portrait',
				number: '04',
				label: 'Portrait / Profile',
				title: 'ポートレート・プロフィール',
				description: '用途と人物像を理解し、自然さと信頼感を両立した表現を設計します。',
				impressionLabel: 'Portrait direction and presence',
				impressionTone: 'neutral',
				cases: [
					{ title: 'Creative Leaders', description: '複数のリーダーを統一感のあるシリーズとして撮影。', scope: 'PORTRAIT / RETOUCHING', mediaLabel: 'Creative leaders', mediaTone: 'neutral', mediaType: 'gallery' },
					{ title: 'Executive Profile', description: '企業サイトと広報資料に対応する経営者プロフィール。', scope: 'DIRECTION / PHOTO', mediaLabel: 'Executive profile', mediaTone: 'cool', mediaType: 'photo' },
					{ title: 'Artist in Studio', description: '制作環境と人物を組み合わせた短いプロフィール映像。', scope: 'PORTRAIT / FILM', mediaLabel: 'Artist profile', mediaTone: 'warm', mediaType: 'video' },
				],
			},
			{
				id: 'video',
				number: '05',
				label: 'Video Projects',
				title: '映像プロジェクト',
				description: '音、動き、時間の流れを生かし、短編映像や記録映像として構成します。',
				impressionLabel: 'Film sequence and movement',
				impressionTone: 'rust',
				cases: [
					{ title: 'A Day at the Workshop', description: '工房の一日を観察的に撮影し、制作精神を描写。', scope: 'FILM / SOUND / EDITING', mediaLabel: 'Workshop film', mediaTone: 'rust', mediaType: 'video' },
					{ title: 'Hospitality Brand Film', description: '到着から滞在までの時間を短編ブランド映像に。', scope: 'PLANNING / FILM', mediaLabel: 'Hospitality film', mediaTone: 'warm', mediaType: 'video' },
					{ title: 'Conference Highlight', description: 'イベントの要点と熱量を公開用ハイライトに編集。', scope: 'EVENT / FILM / EDITING', mediaLabel: 'Conference highlight', mediaTone: 'cool', mediaType: 'video' },
				],
			},
		],
		cta: { label: 'Start a Project', title: '日本で同様のプロジェクトを検討されていますか。', linkLabel: '制作チームに相談する' },
	},
	zh: {
		metaTitle: `制作案例 | ${site.name}`,
		metaDescription: '以横向项目案例浏览活动、空间、访谈、人像与视频制作方向。',
		hero: { eyebrow: 'Works / Case Study', title: '每个项目，都从目的与现场开始。', description: '案例以项目为单位呈现制作范围和内容方向。当前所有影像区域均为 CSS 占位，后续可直接替换真实项目素材。' },
		categories: [
			{
				id: 'featured',
				number: '00',
				label: 'Featured Projects',
				title: '精选项目',
				description: '结合多个制作领域的代表性项目。',
				impressionLabel: 'Selected production overview',
				impressionTone: 'rust',
				cases: [
					{ title: 'Annual Business Conference 2026', description: '从策划配合到摄影、视频与现场素材交付。', scope: 'EVENT / PHOTO / FILM', mediaLabel: 'Annual conference', mediaTone: 'rust', mediaType: 'gallery' },
					{ title: 'Quiet Stay in Setouchi', description: '通过光线与材质呈现住宿设施的品牌体验。', scope: 'SPACE / PHOTO / FILM', mediaLabel: 'Setouchi stay', mediaTone: 'warm', mediaType: 'photo' },
					{ title: 'People Behind the Brand', description: '从创始人与团队的表达中制作企业短片。', scope: 'INTERVIEW / FILM', mediaLabel: 'Brand documentary', mediaTone: 'cool', mediaType: 'video' },
				],
			},
			{
				id: 'event',
				number: '01',
				label: 'Event / Conference',
				title: '活动与会议',
				description: '以完整的一天为单位，记录场地氛围、演讲内容与参与者交流。',
				impressionLabel: 'Live event atmosphere',
				impressionTone: 'rust',
				cases: [
					{ title: 'International Leadership Forum', description: '围绕演讲与讨论环节记录国际会议全貌。', scope: 'PHOTO / DOCUMENTATION', mediaLabel: 'Leadership forum', mediaTone: 'cool', mediaType: 'gallery' },
					{ title: 'Product Launch Evening', description: '为品牌传播记录发布、展示和来宾反应。', scope: 'PHOTO / LIVE DELIVERY', mediaLabel: 'Product launch', mediaTone: 'rust', mediaType: 'photo' },
					{ title: 'Corporate Award Ceremony', description: '将典礼流程与获奖者表情剪辑为活动短片。', scope: 'FILM / EDITING', mediaLabel: 'Award ceremony', mediaTone: 'neutral', mediaType: 'video' },
				],
			},
			{
				id: 'space',
				number: '02',
				label: 'Space / Property / Stay',
				title: '空间、地产与住宿',
				description: '从设计、材质、光线与使用场景中传达空间体验。',
				impressionLabel: 'Space and hospitality mood',
				impressionTone: 'warm',
				cases: [
					{ title: 'Urban Boutique Hotel', description: '将客房与公共区域组织成安静的住宿体验。', scope: 'PHOTO / RETOUCHING', mediaLabel: 'Boutique hotel', mediaTone: 'warm', mediaType: 'gallery' },
					{ title: 'Restaurant After Dusk', description: '记录傍晚至夜间的光线、料理与服务。', scope: 'PHOTO / SHORT FILM', mediaLabel: 'Restaurant interior', mediaTone: 'rust', mediaType: 'video' },
					{ title: 'Modern Residence Tokyo', description: '为销售资料整理建筑线条、材质与生活动线。', scope: 'ARCHITECTURE / PHOTO', mediaLabel: 'Modern residence', mediaTone: 'neutral', mediaType: 'photo' },
				],
			},
			{
				id: 'interview',
				number: '03',
				label: 'Interview / Documentary',
				title: '访谈、纪录与品牌故事',
				description: '结合人物表达与工作现场，传达组织背景和价值观。',
				impressionLabel: 'Voice and documentary detail',
				impressionTone: 'cool',
				cases: [
					{ title: 'Founder Story', description: '以克制的访谈方式呈现创业背景与未来愿景。', scope: 'DIRECTION / INTERVIEW', mediaLabel: 'Founder interview', mediaTone: 'cool', mediaType: 'video' },
					{ title: 'Inside the Design Team', description: '面向招聘对象介绍团队工作方式与文化。', scope: 'PHOTO / FILM / EDITING', mediaLabel: 'Design team story', mediaTone: 'neutral', mediaType: 'gallery' },
					{ title: 'Craft and Continuity', description: '用摄影记录手工制作与持续传承的理念。', scope: 'DOCUMENTARY / PHOTO', mediaLabel: 'Craft documentary', mediaTone: 'warm', mediaType: 'photo' },
				],
			},
			{
				id: 'portrait',
				number: '04',
				label: 'Portrait / Profile',
				title: '人像与职业形象',
				description: '理解人物与用途，在自然状态和专业信任之间建立平衡。',
				impressionLabel: 'Portrait direction and presence',
				impressionTone: 'neutral',
				cases: [
					{ title: 'Creative Leaders', description: '为多位负责人建立统一且保留个性的形象系列。', scope: 'PORTRAIT / RETOUCHING', mediaLabel: 'Creative leaders', mediaTone: 'neutral', mediaType: 'gallery' },
					{ title: 'Executive Profile', description: '适用于企业网站与公关资料的管理者肖像。', scope: 'DIRECTION / PHOTO', mediaLabel: 'Executive profile', mediaTone: 'cool', mediaType: 'photo' },
					{ title: 'Artist in Studio', description: '结合创作环境与人物状态的短篇形象视频。', scope: 'PORTRAIT / FILM', mediaLabel: 'Artist profile', mediaTone: 'warm', mediaType: 'video' },
				],
			},
			{
				id: 'video',
				number: '05',
				label: 'Video Projects',
				title: '视频项目',
				description: '利用声音、动作与时间变化，制作品牌短片和记录内容。',
				impressionLabel: 'Film sequence and movement',
				impressionTone: 'rust',
				cases: [
					{ title: 'A Day at the Workshop', description: '以观察式拍摄呈现工坊的一天与制作精神。', scope: 'FILM / SOUND / EDITING', mediaLabel: 'Workshop film', mediaTone: 'rust', mediaType: 'video' },
					{ title: 'Hospitality Brand Film', description: '将抵达至入住的过程组织成住宿品牌短片。', scope: 'PLANNING / FILM', mediaLabel: 'Hospitality film', mediaTone: 'warm', mediaType: 'video' },
					{ title: 'Conference Highlight', description: '将活动重点与现场氛围剪辑为公开版精华。', scope: 'EVENT / FILM / EDITING', mediaLabel: 'Conference highlight', mediaTone: 'cool', mediaType: 'video' },
				],
			},
		],
		cta: { label: 'Start a Project', title: '需要在日本完成类似项目？', linkLabel: '联系制作团队' },
	},
};

export const aboutPageContent: Record<'ja' | 'zh', AboutPageContent> = {
	ja: {
		metaTitle: `会社について | ${site.name}`,
		metaDescription: '田豊株式会社の制作領域、姿勢、日本国内での実行体制、多言語対応。',
		hero: { eyebrow: 'About', title: '日本を拠点に、企画から納品まで支える。', description: '企業、組織、ブランドのための写真・映像制作会社として、映像がプロジェクトにどう機能するかを考え続けます。' },
		mediaLabel: 'Production team / studio',
		statementLabel: 'Company Statement',
		statementTitle: '画を記録するだけでなく、何を伝えるべきかを理解する。',
		statementParagraphs: [`${site.name}は、イベント、空間、インタビュー、ブランドストーリー、人物撮影を支援します。用途から写真、映像、ライブデリバリーを設計します。`, '日本国内での現場実行に加え、企画、方向設計、撮影、編集、レタッチ、最終納品まで一貫して対応します。'],
		attitudeHeading: { label: 'Production Attitude', title: '制作に対する姿勢' },
		attitudes: [
			{ number: '01', title: 'まず目的を理解する', text: 'ブランド発信、イベント記録、採用、販売など、用途が撮影の重点と形式を決めます。' },
			{ number: '02', title: '現場で判断する', text: '事前計画を共通の軸としながら、時間、人、空間の変化に応じて判断します。' },
			{ number: '03', title: '納品まで責任を持つ', text: 'ファイル仕様や公開時期まで含め、編集と納品を制作工程として扱います。' },
		],
		typesHeading: { label: 'Project Types', title: '対応するプロジェクト', description: '企業活動、商業空間、ブランドコンテンツ、人物表現に合わせた制作体制を提供します。' },
		projectTypes: ['Event / Conference', 'Space / Property / Stay', 'Interview / Documentary', 'Portrait / Profile'],
		languageLabel: 'Multilingual Support',
		languageTitle: '日本語・英語・中国語に対応',
		languageDescription: '関係者や資料の言語に合わせて、日本語・英語・中国語でのプロジェクトコミュニケーションを支援します。',
		companyInfo: [
			{ term: 'Company', detail: site.name },
			{ term: 'Location', detail: 'Japan / Details to be confirmed' },
			{ term: 'Business', detail: 'Photography, Film, Live Delivery, Editing' },
			{ term: 'Information', detail: 'Company profile placeholder' },
		],
		sampleRequest: {
			label: 'Sample Consultation',
			title: '撮影実績や参考サンプルのご相談',
			description: '過去の制作サンプルをご希望の方は、お問い合わせ時に撮影内容や用途をお知らせください。目的に近い実績を確認し、共有可能な範囲をご案内します。',
			linkLabel: '参考サンプルについて相談する',
		},
	},
	zh: {
		metaTitle: `关于公司 | ${site.name}`,
		metaDescription: `了解${site.name}的制作领域、工作态度、日本本地执行与多语言支持。`,
		hero: { eyebrow: 'About', title: '立足日本，为项目提供完整的影像制作支持。', description: '我们是一家面向企业、组织与品牌的摄影和视频制作公司。从前期理解到最终交付，持续关注影像如何真正服务项目。' },
		mediaLabel: 'Production team / studio',
		statementLabel: 'Company Statement',
		statementTitle: '不只是记录画面，而是理解项目需要传达什么。',
		statementParagraphs: [`${site.name}支持活动、空间、访谈、品牌故事与人物形象等多种项目。我们根据用途组织摄影、视频和现场快速交付。`, '团队在日本本地执行，并可从策划、方向整理、现场拍摄、编辑与精修一直支持到最终文件交付。'],
		attitudeHeading: { label: 'Production Attitude', title: '我们的制作态度' },
		attitudes: [
			{ number: '01', title: '先理解项目目的', text: '影像最终用于品牌传播、活动记录、招聘还是销售，会决定拍摄重点与制作方式。' },
			{ number: '02', title: '重视现场判断', text: '前期计划建立共同方向，现场则根据时间、人物与空间变化保持专业判断。' },
			{ number: '03', title: '对最终交付负责', text: '从文件规格到发布时间，将后期与交付作为制作的一部分，而不是拍摄后的附加工作。' },
		],
		typesHeading: { label: 'Project Types', title: '支持的项目类型', description: '围绕企业活动、商业空间、品牌内容与人物表达，提供适合项目规模的制作组合。' },
		projectTypes: ['Event / Conference', 'Space / Property / Stay', 'Interview / Documentary', 'Portrait / Profile'],
		languageLabel: 'Multilingual Support',
		languageTitle: '日本語・英語・中国語に対応',
		languageDescription: '根据项目参与方和资料语言，支持日语、英语与中文沟通。语言服务用于让制作协作更顺畅。',
		companyInfo: [
			{ term: 'Company', detail: site.name },
			{ term: 'Location', detail: 'Japan / Details to be confirmed' },
			{ term: 'Business', detail: 'Photography, Film, Live Delivery, Editing' },
			{ term: 'Information', detail: 'Company profile placeholder' },
		],
		sampleRequest: {
			label: 'Sample Consultation',
			title: '咨询拍摄案例与参考样片',
			description: '如需查看过往制作参考，请在咨询时说明拍摄内容、项目用途与期望方向。我们会确认接近的案例，并说明可提供的资料范围。',
			linkLabel: '咨询参考案例',
		},
	},
};

export const contactPageContent: Record<'ja' | 'zh', ContactPageContent> = {
	ja: {
		metaTitle: `お問い合わせ | ${site.name}`,
		metaDescription: '日本国内のイベント、空間、インタビュー、ポートレート、映像制作について相談する。',
		hero: { eyebrow: 'Contact / Project Inquiry', title: 'プロジェクトの背景、日程、用途からお聞かせください。', description: '企画段階でも、撮影日が決まっている案件でも、現在わかる範囲から制作内容をご相談いただけます。' },
		guideLabel: 'Before Inquiry',
		guideTitle: 'ご相談時にあると役立つ情報',
		guideItems: ['プロジェクトの背景と用途', '撮影希望日と所要時間', '都市、会場、おおよその地域', '写真、映像、ライブデリバリーの希望', '納品時期と使用媒体'],
		googleFormTitle: '外部フォームリンク予定',
		googleFormText: '正式なリンクは今後追加します。',
		formHeading: 'PROJECT INQUIRY FORM',
		formStatus: 'Static layout / No submission',
		form: {
			ariaLabel: 'プロジェクトお問い合わせフォーム',
			nameLabel: 'お名前 / 会社名', nameEnglish: 'Name / Company', namePlaceholder: 'お名前または会社名をご入力ください',
			emailLabel: 'メールアドレス', emailEnglish: 'Email',
			projectLabel: 'プロジェクト種別', projectEnglish: 'Project Type', projectPlaceholder: 'プロジェクト種別を選択',
			projectOptions: ['イベント / カンファレンス', '空間 / 不動産 / 宿泊施設', 'インタビュー / ブランドストーリー', 'ポートレート / プロフィール', 'その他'],
			dateLabel: '撮影希望日', dateEnglish: 'Shooting Date', datePlaceholder: 'YYYY / MM / DD または未定',
			locationLabel: '撮影場所', locationEnglish: 'Location', locationPlaceholder: '都市、会場、おおよその地域',
			messageLabel: 'ご相談内容', messageEnglish: 'Message', messagePlaceholder: '背景、用途、必要な制作内容、納期などをご記入ください',
			buttonLabel: 'プロジェクトを相談する',
			statusText: 'デモフォームのため送信されません。正式版では確認済みの連絡方法に接続します。',
		},
		facts: [
			{ label: 'Production Area', value: 'Japan-based' },
			{ label: 'Languages', value: '日本語・英語・中国語' },
			{ label: 'Response', value: '1–2 business days / Placeholder' },
		],
		sampleRequest: {
			label: 'Sample Consultation',
			title: '撮影実績や参考サンプルのご相談',
			description: '過去の制作サンプルをご希望の方は、フォームに撮影内容や用途をご記入ください。プロジェクトに近い参考実績を確認します。',
			linkLabel: 'お問い合わせフォームへ',
		},
	},
	zh: {
		metaTitle: `项目咨询 | ${site.name}`,
		metaDescription: '咨询在日本的活动、空间、访谈、人像摄影与视频制作项目。',
		hero: { eyebrow: 'Contact / Project Inquiry', title: '从项目背景、时间与用途开始。', description: '请提供现阶段已经确定的信息。即使项目仍在策划中，也可以先就制作范围和执行方式进行沟通。' },
		guideLabel: 'Before Inquiry',
		guideTitle: '有助于确认项目的信息',
		guideItems: ['项目背景与影像用途', '拍摄日期与预计时长', '城市、场地或大致区域', '摄影、视频或即时传图需求', '交付时间与使用平台'],
		googleFormTitle: '外部表单链接预留位置',
		googleFormText: '正式链接将在后续阶段加入',
		formHeading: 'PROJECT INQUIRY FORM',
		formStatus: 'Static layout / No submission',
		form: {
			ariaLabel: '项目咨询表单',
			nameLabel: '姓名 / 公司名称', nameEnglish: 'Name / Company', namePlaceholder: '请输入姓名或公司名称',
			emailLabel: '邮箱', emailEnglish: 'Email',
			projectLabel: '项目类型', projectEnglish: 'Project Type', projectPlaceholder: '请选择项目类型',
			projectOptions: ['活动 / 会议', '空间 / 地产 / 住宿', '访谈 / 纪录 / 品牌故事', '人像 / 职业形象', '其他'],
			dateLabel: '拍摄日期', dateEnglish: 'Shooting Date', datePlaceholder: 'YYYY / MM / DD 或待定',
			locationLabel: '拍摄地点', locationEnglish: 'Location', locationPlaceholder: '城市、场地或大致区域',
			messageLabel: '项目说明', messageEnglish: 'Message', messagePlaceholder: '请简单说明项目背景、用途、所需内容与交付时间',
			buttonLabel: '提交项目咨询',
			statusText: '演示表单暂不提交数据。正式版本将接入确认后的联系渠道。',
		},
		facts: [
			{ label: 'Production Area', value: 'Japan-based' },
			{ label: 'Languages', value: '日本語・英語・中国語' },
			{ label: 'Response', value: '1–2 business days / Placeholder' },
		],
		sampleRequest: {
			label: 'Sample Consultation',
			title: '咨询拍摄案例与参考样片',
			description: '如需过往制作参考，请在表单中填写拍摄内容与用途。我们会确认与项目方向接近的案例。',
			linkLabel: '前往咨询表单',
		},
	},
};
