export const heroStats = [
  { label: "平均分", value: "Band 7.5", hint: "基于 3,200 篇范文" },
  { label: "每周输出", value: "4.8 小时", hint: "深度写作时长" },
  { label: "批改吻合率", value: "92%", hint: "与人工评分对齐" },
];

export const featureCards = [
  {
    title: "AI 生成",
    description: "输入题目、语气与字数即可流式生成带结构的范文。",
    bullets: ["内置 IELTS/TOEFL 模板", "自动分段", "可一键插入编辑器"],
  },
  {
    title: "深度批改",
    description: "词汇、语法、逻辑与连贯性四维雷达，建议以气泡形式展示。",
    bullets: ["严格 JSON Schema", "Accept/Reject 工作流", "雷达评分"],
  },
  {
    title: "沉浸式编辑",
    description: "左右分栏 + 浮动菜单，选中文本即可召唤 Ask AI/翻译/同义词。",
    bullets: ["全屏专注模式", "选中即提示", "实时统计"],
  },
];

export const workflowSteps = [
  {
    title: "1. 设定题目",
    detail: "Topic / Tone / Word Count 统一管理，提供常用预设。",
    duration: "≈30 秒",
  },
  {
    title: "2. AI 生成草稿",
    detail: "Gemini JSON 输出带结构的初稿，可分段插入。",
    duration: "≈40 秒",
  },
  {
    title: "3. 深度批改",
    detail: "点击 Analyze 即返回评分、注释与 Diff 建议。",
    duration: "≈25 秒",
  },
  {
    title: "4. 发布与复盘",
    detail: "仪表盘记录 Band 分、热力图与生词本，便于复习。",
    duration: "实时",
  },
];

export const dashboardStats = [
  { label: "当前水平", value: "Band 7.3", trend: "+0.3 vs 上周" },
  { label: "累计字数", value: "38,240", trend: "近 30 天 +4,120" },
  { label: "持续天数", value: "18 天", trend: "保持连续写作" },
  { label: "AI 会话", value: "126 次", trend: "生成 + 批改" },
];

export const dashboardHeatmap = Array.from({ length: 28 }, (_, index) => {
  const week = Math.floor(index / 7);
  const day = index % 7;
  const levels = [0, 1, 2, 3, 4];
  const intensity = levels[(week * 3 + day) % levels.length];
  return {
    id: `cell-${index}`,
    day,
    week,
    intensity,
  };
});

export const recentDocuments = [
  {
    id: "doc-01",
    title: "Should cities still invest in public libraries?",
    updatedAt: "今天 · 08:40",
    band: "7.5",
    status: "已批改",
  },
  {
    id: "doc-02",
    title: "The ethics of replacing teachers with AI tutors",
    updatedAt: "昨天 · 21:10",
    band: "7.0",
    status: "待润色",
  },
  {
    id: "doc-03",
    title: "Graph — Time spent on remote work",
    updatedAt: "11月 18日",
    band: "6.5",
    status: "未批改",
  },
];

export const vocabularySet = [
  {
    word: "bibliophile",
    definition: "爱书之人；藏书家",
    context: "Curators host bibliophile meetups to keep libraries alive.",
  },
  {
    word: "tactile",
    definition: "触觉的；可感知的",
    context: "Readers still crave the tactile ritual of thumbing real pages.",
  },
  {
    word: "civic commons",
    definition: "公共市民空间",
    context: "Libraries evolve into civic commons where policy debates stay civil.",
  },
];

export const assistantPresets = [
  {
    title: "Argument · 城市规划",
    tone: "Academic",
    words: 280,
    excerpt: "Discuss how public art funding impacts community identity.",
  },
  {
    title: "General Training · 申请信",
    tone: "Polite",
    words: 220,
    excerpt: "Request flexible working hours after relocating.",
  },
  {
    title: "TOEFL Integrated",
    tone: "Neutral",
    words: 320,
    excerpt: "Summarise lecture vs reading on eco-tourism limits.",
  },
];

export const generationChunks = [
  "Introduction — Libraries are not just book depots; they behave like civic studios where ideas collide in real time.",
  "Body — The physical stack still matters because it offers friction, a place where mentors guide students through nuanced drafts.",
  "Conclusion — Cities that invest in human-led libraries create compassionate buffers against the cold efficiency of pure automation.",
];

export const initialEssayDraft = `Public libraries used to be the default gateway to knowledge, but tablets and subscription databases changed that expectation. There are more digital archives now so libraries feel redundant sometimes. Yet my neighbourhood branch is busiest when exams approach because human mentors still translate rubrics into plain language. They provides free internet for people who cannot pay for 5G plans. Community librarians also organise small events that keep neighbours connected even when they barely speak the same language. For cities, investing in libraries is cheaper than letting misinformation erode trust because these rooms attract volunteers, parents and policy makers into the same table.`;

export const correctionPayload = {
  score: 7.4,
  summary:
    "词汇和论证结构表现稳健，主要扣分点在语法细节以及段落之间的逻辑衔接。",
  breakdown: [
    { label: "词汇", value: 7.5 },
    { label: "语法", value: 6.5 },
    { label: "逻辑", value: 7.0 },
    { label: "连贯性", value: 7.5 },
  ],
  annotations: [
    {
      id: "ann-1",
      type: "logic",
      originalText:
        "There are more digital archives now so libraries feel redundant sometimes.",
      suggestion:
        "As digital archives proliferate, libraries can pivot from storing content to curating live guidance so they remain indispensable.",
      reason: "补足因果关系，说明“冗余”的反例与转型方向。",
    },
    {
      id: "ann-2",
      type: "grammar",
      originalText: "They provides free internet for people who cannot pay for 5G plans.",
      suggestion:
        "They provide free internet access for residents who cannot afford private 5G plans.",
      reason: "主谓一致错误，同时补足 internet access 的语义。",
    },
    {
      id: "ann-3",
      type: "logic",
      originalText:
        "Community librarians also organise small events that keep neighbours connected even when they barely speak the same language.",
      suggestion:
        "Community librarians curate multilingual salons so that neighbours with different first languages can still exchange ideas.",
      reason: "突出“多语场景”以支撑跨文化连结的论点。",
    },
  ],
};

