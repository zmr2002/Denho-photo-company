import type {
  Article,
  Locale,
  MockImage,
  Notice,
  ServiceDetail,
  SiteNotice,
  Work,
} from "@/lib/content/types";

const locales: Locale[] = ["ja", "zh", "en"];

const labels = {
  ja: {
    noticeTitle: "撮影スケジュール確認のお知らせ",
    noticeExcerpt: "夏季のイベント撮影に向けた仮のお知らせです。",
    noticeLead: "イベントや空間撮影の相談が増える時期に合わせ、確認事項を整理したサンプル記事です。",
    noticeSection: "ご相談前に確認したい内容",
    noticeImageCaption: "イベント撮影の相談前に整理しておくと進行しやすい項目の例。",
    noticeBody: [
      "撮影日、会場、必要な成果物、公開予定時期が分かると、制作範囲を整理しやすくなります。",
      "当日の進行が確定していない場合でも、現時点で分かる情報から撮影体制を仮設計できます。",
      "写真と映像を同時に扱う場合は、優先したい場面と納品形式を早めに共有いただくと判断が揃います。",
    ],
    noticeSections: [
      {
        heading: "事前共有で確認したいこと",
        paragraphs: [
          "会場図、進行表、登壇者情報、公開予定の媒体があると、撮影の優先順位を決めやすくなります。",
          "未確定の内容がある場合も、仮の情報をもとに必要な人数や機材を整理できます。",
        ],
      },
      {
        heading: "当日の納品を急ぐ場合",
        paragraphs: [
          "同日中の速報素材が必要な場合は、選定基準と受け渡し方法を事前に決めておくとスムーズです。",
        ],
        image: {
          label: "当日納品フロー",
          alt: "当日納品の確認フローを示すサンプル画像",
          tone: "warm",
          caption: "速報用素材と後日編集用素材を分けて考えると、現場判断がしやすくなります。",
        },
      },
    ],
    noticeClosing: "正式な運用では、実際のお知らせ本文に差し替えます。",
    siteNoticeLabel: "お知らせ",
    siteNoticeTitle: "夏季撮影相談の受付について",
    siteNoticeBody: "イベント・空間撮影の相談が増える時期のため、日程が決まっている案件は早めの共有をお願いします。",
    siteNoticeDismiss: "閉じる",
    close: "閉じる",
    categories: { notice: "お知らせ", planning: "制作メモ", media: "納品メモ" },
    articleOne: "制作前に整理したい項目",
    articleTwo: "素材納品の考え方",
    articleExcerptOne: "撮影目的、使用媒体、納期を整理するための仮記事です。",
    articleExcerptTwo: "写真と映像素材の受け渡しを確認するための仮記事です。",
    articleBodyOne: [
      "制作前に用途を確認すると、必要な撮影内容と納品形式が見えやすくなります。",
      "関係者の確認手順を早めに整理することで、撮影後の編集も進めやすくなります。",
      "この記事はローカル検証用のサンプルです。",
    ],
    articleBodyTwo: [
      "素材の使用先に合わせて、サイズ、形式、納品タイミングを確認します。",
      "イベント当日共有が必要な場合は、撮影体制と選定方法を事前に決めます。",
      "この記事はCMS移行前の仮コンテンツです。",
    ],
    works: {
      event: {
        title: "イベント記録サンプル",
        summary: "企業イベントの写真、映像、当日素材共有を想定した仮事例です。",
        client: "サンプル企業",
        challenge: "登壇、展示、交流を一日の流れとして記録する必要がありました。",
        approach: ["進行表をもとに撮影範囲を整理。", "写真と映像の担当範囲を分けて配置。", "公開向け素材を優先して選定。"],
        outcome: "イベント後の広報と社内共有に使える素材を整理しました。",
        deliverables: ["写真セレクト", "短編映像", "当日共有素材"],
        image: "イベント制作サンプル",
      },
      space: {
        title: "空間撮影サンプル",
        summary: "宿泊施設や店舗の雰囲気を伝える写真制作の仮事例です。",
        client: "サンプル施設",
        challenge: "空間の質感と利用シーンを自然に伝える必要がありました。",
        approach: ["時間帯ごとの光を確認。", "客室と共用部の役割を整理。", "写真の使用先に合わせて構図を調整。"],
        outcome: "Web掲載と案内資料に使える写真構成を作成しました。",
        deliverables: ["メイン写真", "ディテール写真", "短編映像"],
        image: "空間制作サンプル",
      },
      interview: {
        title: "インタビュー映像サンプル",
        summary: "企業の考え方を伝えるインタビュー映像の仮事例です。",
        client: "サンプルチーム",
        challenge: "話し手の言葉と現場の雰囲気を自然につなぐ必要がありました。",
        approach: ["質問項目を事前に整理。", "作業風景と表情を合わせて撮影。", "短い公開用映像に編集。"],
        outcome: "採用や企業紹介に使いやすい映像素材として整理しました。",
        deliverables: ["インタビュー写真", "編集済み映像", "Web用素材"],
        image: "インタビュー制作サンプル",
      },
    },
    service: {
      webTitle: ["Web制作", "ローカル確認用"],
      webDescription: "Web制作ページのローカル確認用サンプルです。",
      eventTitle: ["イベント設営", "ローカル確認用"],
      eventDescription: "イベント設営ページのローカル確認用サンプルです。",
      scope: "範囲",
      workflow: "進行",
      cta: "制作相談",
      contact: "問い合わせる",
    },
  },
  zh: {
    noticeTitle: "拍摄日程确认通知",
    noticeExcerpt: "面向夏季活动拍摄的临时通知样例。",
    noticeLead: "随着活动与空间拍摄咨询增加，这是一篇用于整理确认事项的样例文章。",
    noticeSection: "咨询前建议确认的内容",
    noticeImageCaption: "咨询活动拍摄前，建议先整理的项目示例。",
    noticeBody: [
      "如果能够提供拍摄日期、场地、所需成果物和公开时间，制作范围会更容易整理。",
      "即使现场流程尚未完全确定，也可以根据当前信息先规划拍摄体制。",
      "如果同时需要照片和视频，提前说明优先场景与交付格式，可以减少现场判断的不确定性。",
    ],
    noticeSections: [
      {
        heading: "事前共享的信息",
        paragraphs: [
          "场地图、流程表、嘉宾信息和计划发布的平台，有助于确认拍摄优先级。",
          "即使部分内容尚未确定，也可以先根据临时信息整理人员与设备需求。",
        ],
      },
      {
        heading: "需要当天交付时",
        paragraphs: [
          "如果需要当天提供宣传素材，建议提前确定筛选标准和交付方式。",
        ],
        image: {
          label: "当天交付流程",
          alt: "展示当天交付确认流程的样例图片",
          tone: "warm",
          caption: "将快速发布素材与后期编辑素材分开整理，可以让现场判断更清晰。",
        },
      },
    ],
    noticeClosing: "正式上线时，这里会替换为真实通知内容。",
    siteNoticeLabel: "通知",
    siteNoticeTitle: "夏季拍摄咨询受理说明",
    siteNoticeBody: "近期活动与空间拍摄咨询较多，如项目日期已经确定，建议尽早共享基本信息。",
    siteNoticeDismiss: "关闭",
    close: "关闭",
    categories: { notice: "通知", planning: "制作笔记", media: "交付笔记" },
    articleOne: "制作前需要整理的信息",
    articleTwo: "素材交付方式说明",
    articleExcerptOne: "用于确认拍摄目的、使用平台与交付时间的临时文章。",
    articleExcerptTwo: "用于确认照片与视频素材交付方式的临时文章。",
    articleBodyOne: [
      "制作前确认用途，可以更清楚地判断拍摄内容和交付格式。",
      "提前整理确认流程，有助于拍摄后的编辑与交付。",
      "这是一篇本地验证用样例文章。",
    ],
    articleBodyTwo: [
      "根据素材使用场景确认尺寸、格式和交付时间。",
      "如果需要活动当天交付，应提前确定拍摄体制和筛选方式。",
      "这是一篇CMS切换前的临时内容。",
    ],
    works: {
      event: {
        title: "活动记录样例",
        summary: "用于验证企业活动摄影、视频与现场素材交付的临时案例。",
        client: "样例企业",
        challenge: "需要将演讲、展示与交流整理成完整的一天记录。",
        approach: ["根据流程表整理拍摄范围。", "区分照片与视频的负责内容。", "优先筛选公开传播可用素材。"],
        outcome: "整理出可用于活动后宣传和内部共享的素材。",
        deliverables: ["照片精选", "短视频", "现场交付素材"],
        image: "活动制作样例",
      },
      space: {
        title: "空间拍摄样例",
        summary: "用于呈现住宿设施或店铺氛围的临时摄影案例。",
        client: "样例设施",
        challenge: "需要自然呈现空间质感和实际使用场景。",
        approach: ["确认不同时段的光线。", "整理客房与公共区域的功能。", "根据照片使用场景调整构图。"],
        outcome: "制作了适合网站和说明资料使用的照片结构。",
        deliverables: ["主视觉照片", "细节照片", "短视频"],
        image: "空间制作样例",
      },
      interview: {
        title: "访谈视频样例",
        summary: "用于传达企业想法的访谈视频临时案例。",
        client: "样例团队",
        challenge: "需要自然连接受访者表达与工作现场氛围。",
        approach: ["提前整理问题方向。", "同时拍摄工作场景与人物表情。", "剪辑为短篇公开版视频。"],
        outcome: "整理成适合招聘和企业介绍使用的视频素材。",
        deliverables: ["访谈照片", "已编辑视频", "网站素材"],
        image: "访谈制作样例",
      },
    },
    service: {
      webTitle: ["网站制作", "本地确认用"],
      webDescription: "网站制作页面的本地确认样例。",
      eventTitle: ["活动搭建", "本地确认用"],
      eventDescription: "活动搭建页面的本地确认样例。",
      scope: "范围",
      workflow: "流程",
      cta: "项目咨询",
      contact: "联系团队",
    },
  },
  en: {
    noticeTitle: "Production schedule notice",
    noticeExcerpt: "A temporary notice for reviewing summer event production requests.",
    noticeLead: "This sample article outlines the information that helps the team plan event and space shoots.",
    noticeSection: "Details to prepare before inquiry",
    noticeImageCaption: "A sample planning image for production details to confirm before an event shoot.",
    noticeBody: [
      "A shoot date, venue, deliverables, and publishing timeline make the production scope easier to estimate.",
      "Even when the event flow is not final, the current information can support an early production plan.",
      "When photo and film coverage are both needed, sharing priority scenes and delivery formats early keeps the production decision clear.",
    ],
    noticeSections: [
      {
        heading: "Information to share before planning",
        paragraphs: [
          "Venue maps, schedules, speaker details, and publishing channels help set the shoot priority.",
          "If some details are still tentative, the current draft can still guide staffing and equipment assumptions.",
        ],
      },
      {
        heading: "When same-day delivery matters",
        paragraphs: [
          "For same-day publicity assets, selection criteria and handoff method should be decided before the shoot.",
        ],
        image: {
          label: "Same-day delivery flow",
          alt: "Sample visual showing a same-day delivery confirmation flow",
          tone: "warm",
          caption: "Separating fast-turnaround assets from later edited material helps the team make quicker on-site decisions.",
        },
      },
    ],
    noticeClosing: "In production, this area will be replaced with real notice content.",
    siteNoticeLabel: "Notice",
    siteNoticeTitle: "Summer production inquiry availability",
    siteNoticeBody: "Event and space production inquiries are increasing. If your date is fixed, please share the basic project details early.",
    siteNoticeDismiss: "Dismiss",
    close: "Close",
    categories: { notice: "Notice", planning: "Production Note", media: "Delivery Note" },
    articleOne: "Items to prepare before production",
    articleTwo: "How media delivery is organized",
    articleExcerptOne: "A temporary article for checking purpose, channels, and delivery timing.",
    articleExcerptTwo: "A temporary article for checking photo and video delivery expectations.",
    articleBodyOne: [
      "Confirming the intended use helps clarify the shoot list and delivery format.",
      "Planning the review flow early also makes post-production easier.",
      "This article is sample content for local verification.",
    ],
    articleBodyTwo: [
      "Image size, file format, and delivery timing are set according to where the assets will be used.",
      "Same-day delivery requires a clear selection workflow before the shoot begins.",
      "This is temporary content before the CMS source is connected.",
    ],
    works: {
      event: {
        title: "Event coverage sample",
        summary: "Temporary work content for event photography, film, and same-day delivery checks.",
        client: "Sample Client",
        challenge: "The project needed a coherent record of talks, displays, and participant interaction.",
        approach: ["Mapped the shoot scope from the event schedule.", "Separated photo and video responsibilities.", "Prioritized assets for public communication."],
        outcome: "Prepared assets for post-event publicity and internal sharing.",
        deliverables: ["Photo selection", "Short film", "Same-day delivery set"],
        image: "Event production sample",
      },
      space: {
        title: "Space media sample",
        summary: "Temporary work content for hospitality and spatial photography checks.",
        client: "Sample Property",
        challenge: "The project needed to show texture, atmosphere, and real usage naturally.",
        approach: ["Checked light across the day.", "Organized rooms and shared areas by role.", "Adjusted framing for web and guide materials."],
        outcome: "Created a photo structure suited to web and sales materials.",
        deliverables: ["Hero photos", "Detail photos", "Short film"],
        image: "Space production sample",
      },
      interview: {
        title: "Interview story sample",
        summary: "Temporary work content for an interview-based brand story.",
        client: "Sample Team",
        challenge: "The story needed to connect spoken content with the atmosphere of the workplace.",
        approach: ["Prepared interview themes.", "Captured work scenes and expressions.", "Edited a short public-facing film."],
        outcome: "Prepared media that can support recruitment and company introduction use.",
        deliverables: ["Interview photos", "Edited story film", "Web-ready assets"],
        image: "Interview production sample",
      },
    },
    service: {
      webTitle: ["Web production", "local sample"],
      webDescription: "Temporary local sample content for the Web Production service page.",
      eventTitle: ["Event setup", "local sample"],
      eventDescription: "Temporary local sample content for the Event Setup service page.",
      scope: "Scope",
      workflow: "Workflow",
      cta: "Project Inquiry",
      contact: "Contact",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

function galleryFor(language: Locale, project: string): MockImage[] {
  const tones: MockImage["tone"][] = ["rust", "warm", "cool", "neutral"];
  return tones.map((tone, index) => ({
    label: `${project} ${String(index + 1).padStart(2, "0")}`,
    alt: `${project} ${String(index + 1).padStart(2, "0")}`,
    tone,
  }));
}

export const mockNotices: Notice[] = locales.map((language) => {
  const text = labels[language];
  return {
    id: `${language}-notice-availability`,
    language,
    title: text.noticeTitle,
    excerpt: text.noticeExcerpt,
    detailTitle: text.noticeTitle,
    detailBody: text.noticeBody.join("\n\n"),
    detailLead: text.noticeLead,
    detailSectionTitle: text.noticeSection,
    detailParagraphs: text.noticeBody,
    detailImage: {
      label: text.noticeTitle,
      alt: text.noticeImageCaption,
      tone: "cool",
      caption: text.noticeImageCaption,
    },
    detailSections: text.noticeSections as Notice["detailSections"],
    detailClosing: text.noticeClosing,
    closeLabel: text.close,
    category: text.categories.notice,
    publishedAt: "2026-07-01",
    status: "published",
    linkHref: `/${language}/contact/`,
  };
});

export const mockSiteNotices: SiteNotice[] = locales.map((language) => {
  const text = labels[language];
  return {
    id: `${language}-site-opening-notice`,
    language,
    enabled: true,
    label: text.siteNoticeLabel,
    title: text.siteNoticeTitle,
    body: text.siteNoticeBody,
    dismissLabel: text.siteNoticeDismiss,
    storageKey: `tianho-site-opening-notice-${language}-2026-07`,
    dismissalMode: "session",
    status: "published",
    startAt: "2026-07-01",
  };
});

export const mockArticles: Article[] = locales.flatMap((language) => {
  const text = labels[language];
  return [
    {
      id: `${language}-article-planning`,
      language,
      slug: "production-planning",
      title: text.articleOne,
      excerpt: text.articleExcerptOne,
      category: text.categories.planning,
      authorName: language === "ja" ? "編集チーム" : language === "zh" ? "编辑团队" : "Editorial Team",
      publishedAt: "2026-07-02",
      updatedAt: "2026-07-02",
      status: "published",
      featuredImage: { label: text.articleOne, alt: text.articleOne, tone: "cool" },
      body: text.articleBodyOne,
      contentBlocks: text.articleBodyOne.map((paragraph) => ({ type: "paragraph", text: paragraph })),
      relatedServices: language === "ja" ? ["イベント制作", "Web制作"] : language === "zh" ? ["活动制作", "网站制作"] : ["Event Production", "Web Production"],
      seoTitle: text.articleOne,
      seoDescription: text.articleExcerptOne,
    },
    {
      id: `${language}-article-media`,
      language,
      slug: "media-delivery",
      title: text.articleTwo,
      excerpt: text.articleExcerptTwo,
      category: text.categories.media,
      authorName: language === "ja" ? "編集チーム" : language === "zh" ? "编辑团队" : "Editorial Team",
      publishedAt: "2026-07-03",
      updatedAt: "2026-07-03",
      status: "published",
      featuredImage: { label: text.articleTwo, alt: text.articleTwo, tone: "warm" },
      body: text.articleBodyTwo,
      contentBlocks: text.articleBodyTwo.map((paragraph) => ({ type: "paragraph", text: paragraph })),
      relatedServices: language === "ja" ? ["制作実績", "イベント設営"] : language === "zh" ? ["制作案例", "活动搭建"] : ["Works", "Event Setup"],
      seoTitle: text.articleTwo,
      seoDescription: text.articleExcerptTwo,
    },
  ];
});

export const mockWorks: Work[] = locales.flatMap((language) => {
  const text = labels[language];
  const event = text.works.event;
  const space = text.works.space;
  const interview = text.works.interview;

  return [
    {
      id: `${language}-work-event`,
      language,
      slug: "event-coverage",
      title: event.title,
      summary: event.summary,
      clientName: event.client,
      projectDate: "2026",
      category: language === "ja" ? "イベント / 会議" : language === "zh" ? "活动 / 会议" : "Event / Conference",
      serviceCategory: "event",
      scope: language === "ja" ? "写真 / 映像 / 当日共有" : language === "zh" ? "摄影 / 视频 / 现场交付" : "Photo / Film / Same-day Delivery",
      challenge: event.challenge,
      approach: event.approach,
      outcome: event.outcome,
      deliverables: event.deliverables,
      status: "published",
      featuredOnHomepage: true,
      featuredOrder: 1,
      featuredImage: { label: event.image, alt: event.image, tone: "rust" },
      galleryImages: galleryFor(language, event.image),
      mediaType: "gallery",
      seoTitle: event.title,
      seoDescription: event.summary,
    },
    {
      id: `${language}-work-space`,
      language,
      slug: "space-media",
      title: space.title,
      summary: space.summary,
      clientName: space.client,
      projectDate: "2026",
      category: language === "ja" ? "空間 / 宿泊" : language === "zh" ? "空间 / 住宿" : "Space / Stay",
      serviceCategory: "space",
      scope: language === "ja" ? "企画 / 写真 / 短編映像" : language === "zh" ? "策划 / 摄影 / 短视频" : "Planning / Photo / Short Film",
      challenge: space.challenge,
      approach: space.approach,
      outcome: space.outcome,
      deliverables: space.deliverables,
      status: "published",
      featuredOnHomepage: true,
      featuredOrder: 2,
      featuredImage: { label: space.image, alt: space.image, tone: "warm" },
      galleryImages: galleryFor(language, space.image),
      mediaType: "photo",
      seoTitle: space.title,
      seoDescription: space.summary,
    },
    {
      id: `${language}-work-interview`,
      language,
      slug: "interview-story",
      title: interview.title,
      summary: interview.summary,
      clientName: interview.client,
      projectDate: "2026",
      category: language === "ja" ? "インタビュー / ブランド" : language === "zh" ? "访谈 / 品牌故事" : "Interview / Brand Story",
      serviceCategory: "interview",
      scope: language === "ja" ? "構成 / インタビュー / 編集" : language === "zh" ? "内容整理 / 访谈 / 编辑" : "Direction / Interview / Editing",
      challenge: interview.challenge,
      approach: interview.approach,
      outcome: interview.outcome,
      deliverables: interview.deliverables,
      status: "published",
      featuredOnHomepage: true,
      featuredOrder: 3,
      featuredImage: { label: interview.image, alt: interview.image, tone: "cool" },
      galleryImages: galleryFor(language, interview.image),
      mediaType: "video",
      seoTitle: interview.title,
      seoDescription: interview.summary,
    },
  ];
});

export const mockServiceDetails: ServiceDetail[] = locales.flatMap((language) => {
  const service = labels[language].service;

  return [
    {
      language,
      slug: "web-production",
      eyebrow: language === "ja" ? "Web制作" : language === "zh" ? "网站制作" : "Web Production",
      title: service.webTitle,
      description: service.webDescription,
      sections: [
        {
          label: service.scope,
          title: language === "ja" ? ["サイト構成", "と制作範囲"] : language === "zh" ? ["网站结构", "与制作范围"] : ["Website planning", "and production"],
          text: language === "ja" ? "掲載内容、ページ構成、必要な写真・映像素材を整理します。" : language === "zh" ? "整理页面内容、网站结构以及需要的照片和视频素材。" : "Organize content, page structure, and required photo or video assets.",
          bullets: language === "ja" ? ["構成整理", "ページ制作", "素材準備"] : language === "zh" ? ["结构整理", "页面制作", "素材准备"] : ["Site planning", "Page production", "Content handoff"],
        },
        {
          label: service.workflow,
          title: language === "ja" ? ["素材とページの", "進行管理"] : language === "zh" ? ["素材与页面", "进度管理"] : ["Content and media", "coordination"],
          text: language === "ja" ? "撮影素材とテキストを合わせ、公開準備までの流れを確認します。" : language === "zh" ? "结合拍摄素材与文本内容，确认发布前的准备流程。" : "Coordinate media and text through launch preparation.",
          bullets: language === "ja" ? ["要件確認", "仮構成", "公開準備"] : language === "zh" ? ["需求确认", "临时结构", "发布准备"] : ["Requirements", "Draft structure", "Launch preparation"],
        },
      ],
      ctaLabel: service.cta,
      ctaTitle: language === "ja" ? ["Web制作について", "相談する"] : language === "zh" ? ["咨询网站制作", "项目"] : ["Web production", "inquiry"],
      linkLabel: service.contact,
    },
    {
      language,
      slug: "event-setup",
      eyebrow: language === "ja" ? "イベント設営" : language === "zh" ? "活动搭建" : "Event Setup",
      title: service.eventTitle,
      description: service.eventDescription,
      sections: [
        {
          label: service.scope,
          title: language === "ja" ? ["イベント準備", "と現場支援"] : language === "zh" ? ["活动准备", "与现场支持"] : ["Event preparation", "support"],
          text: language === "ja" ? "会場、進行、撮影導線を確認し、現場の準備を支援します。" : language === "zh" ? "确认场地、流程和拍摄动线，支持现场准备。" : "Confirm venue flow, media paths, and on-site preparation.",
          bullets: language === "ja" ? ["会場確認", "導線整理", "制作支援"] : language === "zh" ? ["场地确认", "动线整理", "制作支持"] : ["Venue coordination", "Media flow", "Production support"],
        },
        {
          label: service.workflow,
          title: language === "ja" ? ["当日の進行", "確認"] : language === "zh" ? ["当天流程", "确认"] : ["On-site production", "readiness"],
          text: language === "ja" ? "撮影当日の進行、共有方法、納品までの流れを整理します。" : language === "zh" ? "整理拍摄当天流程、素材共享方式与交付步骤。" : "Prepare the on-site workflow, sharing method, and delivery steps.",
          bullets: language === "ja" ? ["設営計画", "当日確認", "納品連携"] : language === "zh" ? ["搭建计划", "现场确认", "交付协作"] : ["Setup plan", "On-site checks", "Delivery coordination"],
        },
      ],
      ctaLabel: service.cta,
      ctaTitle: language === "ja" ? ["イベント設営について", "相談する"] : language === "zh" ? ["咨询活动搭建", "项目"] : ["Event setup", "inquiry"],
      linkLabel: service.contact,
    },
  ];
});
