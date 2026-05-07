const STORAGE_KEY = "wechatpostgpt-user-templates-v1";
const AI_CONFIG_KEY = "wechatpostgpt-ai-config-v1";
const IMAGE_DB_NAME = "wechatpostgpt-image-assets";
const IMAGE_STORE_NAME = "images";
const IMAGE_ASSET_URI_PREFIX = "wechatpostgpt:image:";
const WECHAT_FONT =
  "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif";

const SAMPLE_ARTICLE = {
  title: "为什么好内容也需要一套可靠的版式",
  content: `开头有个朴素的事实：读者不是先理解内容，再决定要不要读下去。多数时候，他们先感受到秩序、节奏和可信度，然后才愿意把注意力交给文章。

# 排版不是装饰，而是阅读路径

一篇公众号文章通常发生在很小的手机屏幕里。标题、导语、分节、引用和列表，本质上是在帮读者判断：哪里是观点，哪里是证据，哪里可以快速扫读，哪里值得停下来。

> 真正有效的版式，不是让每一段都变花，而是让整篇文章拥有稳定的呼吸。

# 公众号排版的三个硬约束

- 样式最好写在每个元素的 inline style 里，复制到后台后更稳定。
- 不依赖脚本、外部样式表、复杂定位和交互。
- 模板要围绕内容结构设计，而不只是换几个标题颜色。

# 智能体应该做什么

第一步是理解内容。它需要判断文章更像深度分析、活动官宣、教程清单、品牌故事还是技术文章。

第二步是选择模板。如果已有模板能匹配，就套用完整的版式系统；如果没有，就根据文章气质生成一套新的视觉令牌、标题样式、引用样式和收束方式。

第三步是复制交付。结果必须是微信编辑器友好的富文本 HTML，创作者可以直接粘贴到公众号后台。`
};

const DEFAULT_TEMPLATES = [
  {
    id: "insight-blue",
    source: "default",
    name: "深度研究蓝墨",
    family: "insight",
    description: "适合调研、趋势、复盘和长文洞察，层级克制，阅读可信度高。",
    tags: ["research", "analysis", "data", "general"],
    colors: {
      page: "#ffffff",
      panel: "#f5f8fc",
      ink: "#172033",
      muted: "#65738a",
      accent: "#1d4ed8",
      accent2: "#0f766e",
      soft: "#eaf2ff",
      line: "#c9d8f2"
    },
    rhythm: { paragraph: 17, line: 1.92, gap: 18, radius: 10 }
  },
  {
    id: "business-amber",
    source: "default",
    name: "商业简报黑金",
    family: "business",
    description: "适合商业分析、产品策略、增长复盘，强调结论和执行感。",
    tags: ["business", "brand", "data", "analysis"],
    colors: {
      page: "#fffdf8",
      panel: "#1f2933",
      ink: "#243038",
      muted: "#6a7178",
      accent: "#b7791f",
      accent2: "#2563eb",
      soft: "#fff4d8",
      line: "#e8d7b9"
    },
    rhythm: { paragraph: 16, line: 1.82, gap: 16, radius: 8 }
  },
  {
    id: "tech-green",
    source: "default",
    name: "科技极简萤绿",
    family: "tech",
    description: "适合 AI、工程、工具、代码和产品技术文章，信息密度更高。",
    tags: ["tech", "education", "analysis"],
    colors: {
      page: "#f8fbfa",
      panel: "#10231f",
      ink: "#16201c",
      muted: "#5f6f68",
      accent: "#059669",
      accent2: "#7c3aed",
      soft: "#ddf7ed",
      line: "#bfe8d9"
    },
    rhythm: { paragraph: 16, line: 1.84, gap: 15, radius: 8 }
  },
  {
    id: "human-paper",
    source: "default",
    name: "人文纸本酒红",
    family: "human",
    description: "适合随笔、访谈、故事和观点散文，重视留白与段落气息。",
    tags: ["story", "brand", "general"],
    colors: {
      page: "#fffaf4",
      panel: "#f6eee5",
      ink: "#2d2421",
      muted: "#7c6f68",
      accent: "#9f1239",
      accent2: "#0f766e",
      soft: "#fde7ee",
      line: "#ead7cb"
    },
    rhythm: { paragraph: 17, line: 2.0, gap: 20, radius: 6 }
  },
  {
    id: "event-coral",
    source: "default",
    name: "活动官宣珊瑚",
    family: "event",
    description: "适合活动发布、招募、直播预约和新品公告，节奏明亮有行动感。",
    tags: ["event", "brand", "business"],
    colors: {
      page: "#ffffff",
      panel: "#fff0ed",
      ink: "#2b2f33",
      muted: "#6f767c",
      accent: "#e11d48",
      accent2: "#0891b2",
      soft: "#ffe4e0",
      line: "#ffc5bd"
    },
    rhythm: { paragraph: 16, line: 1.78, gap: 16, radius: 12 }
  },
  {
    id: "education-indigo",
    source: "default",
    name: "知识卡片靛蓝",
    family: "education",
    description: "适合教程、清单、课程笔记和方法论，模块感清楚。",
    tags: ["education", "tech", "general"],
    colors: {
      page: "#fcfdff",
      panel: "#eef2ff",
      ink: "#20263a",
      muted: "#64708a",
      accent: "#4f46e5",
      accent2: "#0f766e",
      soft: "#e0e7ff",
      line: "#cad5ff"
    },
    rhythm: { paragraph: 16, line: 1.86, gap: 17, radius: 10 }
  },
  {
    id: "brand-rose",
    source: "default",
    name: "品牌故事蔷薇",
    family: "brand",
    description: "适合品牌故事、用户案例、人物访谈，柔和但有识别度。",
    tags: ["brand", "story", "business"],
    colors: {
      page: "#fffafb",
      panel: "#f9ecef",
      ink: "#30272d",
      muted: "#756b72",
      accent: "#be185d",
      accent2: "#4d7c0f",
      soft: "#fce7f0",
      line: "#f3c9d8"
    },
    rhythm: { paragraph: 17, line: 1.95, gap: 19, radius: 10 }
  },
  {
    id: "data-cyan",
    source: "default",
    name: "数据报告青紫",
    family: "data",
    description: "适合行业报告、数据解读、指标复盘，重点突出数字与结论。",
    tags: ["data", "research", "business", "analysis"],
    colors: {
      page: "#f8fcff",
      panel: "#e8f7fb",
      ink: "#1d2730",
      muted: "#607180",
      accent: "#0e7490",
      accent2: "#a21caf",
      soft: "#dff6fb",
      line: "#b9e5ef"
    },
    rhythm: { paragraph: 16, line: 1.82, gap: 16, radius: 8 }
  }
].map((template) => upgradeTemplateSchema(template));

let userTemplates = loadUserTemplates();
let runtimeTemplates = [];
let templates = [...DEFAULT_TEMPLATES, ...userTemplates];
let selectedTemplateId = "auto";
let lastHtml = "";
let lastPlainText = "";
let aiStatus = { checked: false, aiEnabled: false, model: "", endpoint: "" };
let aiConfig = loadAiConfig();
let renderSeq = 0;
let templateFilters = { query: "", family: "all", source: "all" };
let imageAssets = new Map();
let imageDbPromise = null;

const els = {
  title: document.querySelector("#titleInput"),
  content: document.querySelector("#contentInput"),
  articleImage: document.querySelector("#articleImageInput"),
  imageCaption: document.querySelector("#imageCaptionInput"),
  imageWidth: document.querySelector("#imageWidthSelect"),
  imageStyle: document.querySelector("#imageStyleSelect"),
  insertImageUrl: document.querySelector("#insertImageUrlBtn"),
  compactImages: document.querySelector("#compactImagesBtn"),
  imageLibrary: document.querySelector("#imageLibrary"),
  imageSummary: document.querySelector("#imageSummary"),
  engine: document.querySelector("#engineSelect"),
  mode: document.querySelector("#modeSelect"),
  density: document.querySelector("#densitySelect"),
  smartStructure: document.querySelector("#smartStructureToggle"),
  render: document.querySelector("#renderBtn"),
  clear: document.querySelector("#clearBtn"),
  loadSample: document.querySelector("#loadSampleBtn"),
  generateTemplate: document.querySelector("#generateTemplateBtn"),
  analysisCards: document.querySelector("#analysisCards"),
  templateGallery: document.querySelector("#templateGallery"),
  templateCountBadge: document.querySelector("#templateCountBadge"),
  templateSearch: document.querySelector("#templateSearchInput"),
  templateFamilyFilter: document.querySelector("#templateFamilyFilter"),
  templateSourceFilter: document.querySelector("#templateSourceFilter"),
  aiStatusBadge: document.querySelector("#aiStatusBadge"),
  aiBaseUrl: document.querySelector("#aiBaseUrlInput"),
  aiApiKey: document.querySelector("#aiApiKeyInput"),
  aiModel: document.querySelector("#aiModelSelect"),
  testAiConfig: document.querySelector("#testAiConfigBtn"),
  saveAiConfig: document.querySelector("#saveAiConfigBtn"),
  clearAiConfig: document.querySelector("#clearAiConfigBtn"),
  aiConfigStatus: document.querySelector("#aiConfigStatus"),
  canvas: document.querySelector("#wechatCanvas"),
  htmlOutput: document.querySelector("#htmlOutput"),
  compatReport: document.querySelector("#compatReport"),
  statusLine: document.querySelector("#statusLine"),
  copyRich: document.querySelector("#copyRichBtn"),
  copyHtml: document.querySelector("#copyHtmlBtn"),
  reference: document.querySelector("#referenceInput"),
  referencePasteBox: document.querySelector("#referencePasteBox"),
  referenceName: document.querySelector("#learnNameInput"),
  referenceUrl: document.querySelector("#referenceUrlInput"),
  referenceFile: document.querySelector("#referenceFileInput"),
  fetchReference: document.querySelector("#fetchReferenceBtn"),
  learnTemplate: document.querySelector("#learnTemplateBtn"),
  learnSummary: document.querySelector("#learnSummary")
};

init();

function init() {
  renderTemplateGallery();
  renderAnalysisPlaceholder();
  renderImageLibrary();
  hydrateAiConfigForm();
  checkAiStatus();
  loadImageAssets().then(() => {
    renderImageLibrary();
    renderFromInput({ useAi: false, passive: true });
  });

  els.render.addEventListener("click", () => renderFromInput({ useAi: true }));
  els.title.addEventListener("input", debounce(() => renderFromInput({ useAi: false, passive: true }), 420));
  els.content.addEventListener("input", debounce(() => renderFromInput({ useAi: false, passive: true }), 420));
  els.engine.addEventListener("change", () => renderFromInput({ useAi: false }));
  els.mode.addEventListener("change", () => renderFromInput({ useAi: false }));
  els.density.addEventListener("change", () => renderFromInput({ useAi: false }));
  els.smartStructure.addEventListener("change", () => renderFromInput({ useAi: false }));
  els.loadSample.addEventListener("click", () => {
    els.title.value = SAMPLE_ARTICLE.title;
    els.content.value = SAMPLE_ARTICLE.content;
    renderFromInput({ useAi: false });
  });
  els.clear.addEventListener("click", () => {
    els.title.value = "";
    els.content.value = "";
    lastHtml = "";
    lastPlainText = "";
    els.canvas.innerHTML = "";
    els.htmlOutput.value = "";
    els.statusLine.textContent = "等待输入文章内容。";
    renderAnalysisPlaceholder();
    renderCompatReport("");
  });
  els.generateTemplate.addEventListener("click", async () => {
    const analysis = analyzeArticle(els.title.value, els.content.value);
    const generated = await generatePersistentTemplate(analysis);
    userTemplates = [generated, ...userTemplates];
    saveUserTemplates(userTemplates);
    rebuildTemplates();
    selectedTemplateId = generated.id;
    els.mode.value = "manual";
    renderTemplateGallery();
    renderFromInput({ useAi: false });
    els.learnSummary.textContent = `已生成模板「${generated.name}」，它会保存在本机浏览器里。`;
  });
  els.copyRich.addEventListener("click", copyRichText);
  els.copyHtml.addEventListener("click", copyHtml);
  els.testAiConfig.addEventListener("click", testAiConfig);
  els.saveAiConfig.addEventListener("click", saveAiConfigFromForm);
  els.clearAiConfig.addEventListener("click", clearAiConfig);
  els.learnTemplate.addEventListener("click", learnTemplateFromReference);
  els.fetchReference.addEventListener("click", fetchReferenceFromUrl);
  els.referencePasteBox.addEventListener("paste", handleReferenceRichPaste);
  els.referencePasteBox.addEventListener("input", syncReferencePasteBox);
  els.referenceFile.addEventListener("change", handleReferenceFile);
  els.articleImage.addEventListener("change", handleArticleImages);
  els.insertImageUrl.addEventListener("click", insertImageUrlBlock);
  els.compactImages.addEventListener("click", compactInlineBase64Images);
  els.templateSearch.addEventListener(
    "input",
    debounce(() => {
      templateFilters.query = els.templateSearch.value.trim().toLowerCase();
      renderTemplateGallery(selectedTemplateId);
    }, 180)
  );
  els.templateFamilyFilter.addEventListener("change", () => {
    templateFilters.family = els.templateFamilyFilter.value;
    renderTemplateGallery(selectedTemplateId);
  });
  els.templateSourceFilter.addEventListener("change", () => {
    templateFilters.source = els.templateSourceFilter.value;
    renderTemplateGallery(selectedTemplateId);
  });
}

async function renderFromInput(options = {}) {
  const seq = ++renderSeq;
  const title = els.title.value.trim();
  const content = els.content.value.trim();

  if (!title && !content) {
    return;
  }

  const analysis = analyzeArticle(title, content);
  const doc = parseArticle(title || inferTitle(content), content, {
    smartStructure: els.smartStructure.checked
  });
  let template = pickTemplate(analysis);
  let displayAnalysis = analysis;
  let density = els.density.value;
  let aiPlan = null;
  let statusOverride = "";

  if (options.useAi && els.engine.value === "native") {
    if (!aiStatus.aiEnabled) {
      statusOverride = "AI 原生创意排版需要可用的 AI 配置，已使用本地规则预览";
    } else {
      els.statusLine.textContent = `AI 正在进行原生创意排版，使用模型 ${aiStatus.model}。`;
      els.render.disabled = true;
      try {
        const nativeLayout = await requestAiNativeLayout(title, content, analysis);
        if (seq !== renderSeq) return;
        const html = hydrateNativeImageSources(nativeLayout.html);
        lastHtml = html;
        lastPlainText = nativeLayout.plainText || docToPlainText(doc);
        els.canvas.innerHTML = html;
        els.htmlOutput.value = html;
        els.statusLine.textContent = `${nativeLayout.designSummary?.styleName || "AI 原生创意排版"}｜AI 已直接生成富媒体 HTML｜${analysis.typeLabel}｜约 ${analysis.readingMinutes} 分钟读完`;
        els.learnSummary.textContent =
          "AI 原生创意排版已生成。若要把这次效果沉淀为结构化模板，可复制右侧 HTML 到参考文章学习区再学习为模板。";
        renderNativeAnalysis(analysis, nativeLayout);
        renderTemplateGallery(selectedTemplateId);
        renderCompatReport(html);
        return;
      } catch (error) {
        if (seq !== renderSeq) return;
        statusOverride = `AI 原生创意排版失败，已退回本地规则：${error.message}`;
      } finally {
        els.render.disabled = false;
      }
    }
  }

  if (options.useAi && els.engine.value === "ai") {
    if (!aiStatus.aiEnabled) {
      els.statusLine.textContent = "AI 后端未启用，已使用本地规则排版。运行 npm start 并配置 OPENAI_API_KEY 后可启用 AI 决策。";
    } else {
      els.statusLine.textContent = `AI 正在分析文章与模板库，使用模型 ${aiStatus.model}。`;
      els.render.disabled = true;
      try {
        aiPlan = await requestAiLayout(title, content, analysis);
        if (seq !== renderSeq) return;
        const applied = applyAiPlan(aiPlan, analysis);
        template = applied.template;
        displayAnalysis = applied.analysis;
        density = applied.density || density;
      } catch (error) {
        if (seq !== renderSeq) return;
        els.statusLine.textContent = `AI 决策失败，已退回本地规则：${error.message}`;
      } finally {
        els.render.disabled = false;
      }
    }
  }

  const html = renderArticle(template, doc, displayAnalysis, {
    density
  });

  lastHtml = html;
  lastPlainText = docToPlainText(doc);
  els.canvas.innerHTML = html;
  els.htmlOutput.value = html;
  const persistedAiTemplate = persistGeneratedAiTemplate({
    template,
    plan: aiPlan,
    analysis: displayAnalysis,
    title,
    content,
    useAi: options.useAi
  });
  if (persistedAiTemplate) {
    template = persistedAiTemplate.template;
  }
  if (!aiPlan || !options.useAi || els.statusLine.textContent.startsWith("AI 决策失败")) {
    const prefix = statusOverride ? `${statusOverride}｜` : "";
    els.statusLine.textContent = `${prefix}${template.name}｜${analysis.typeLabel}｜约 ${analysis.readingMinutes} 分钟读完｜${doc.stats.blockCount} 个内容块`;
  } else {
    const persistNote = persistedAiTemplate
      ? persistedAiTemplate.created
        ? "｜已学习为新模板"
        : "｜已复用已学习模板"
      : "";
    els.statusLine.textContent = `${template.name}｜AI 已决策${persistNote}｜${displayAnalysis.typeLabel}｜约 ${analysis.readingMinutes} 分钟读完｜${doc.stats.blockCount} 个内容块`;
  }
  renderAnalysis(displayAnalysis, template, aiPlan);
  renderTemplateGallery(template.id);
  renderCompatReport(html);
}

function pickTemplate(analysis) {
  if (els.mode.value === "generate") {
    return createGeneratedTemplate(analysis, false);
  }

  if (els.mode.value === "manual" && selectedTemplateId !== "auto") {
    return templates.find((item) => item.id === selectedTemplateId) || templates[0];
  }

  const ranked = templates
    .map((template) => ({
      template,
      score: scoreTemplate(template, analysis)
    }))
    .sort((a, b) => b.score - a.score);

  if (!ranked.length || ranked[0].score < 18) {
    return createGeneratedTemplate(analysis, false);
  }

  return ranked[0].template;
}

function scoreTemplate(template, analysis) {
  let score = 0;
  for (const tag of template.tags || []) {
    if (tag === analysis.type) score += 30;
    if (analysis.secondaryTypes.includes(tag)) score += 13;
  }
  if (template.family === analysis.type) score += 8;
  if (analysis.hasCode && template.tags.includes("tech")) score += 12;
  if (analysis.hasManyNumbers && template.tags.includes("data")) score += 10;
  if (analysis.isLong && ["insight", "human", "data"].includes(template.family)) score += 6;
  if (analysis.isShort && ["event", "education", "business"].includes(template.family)) score += 5;
  return score;
}

async function checkAiStatus() {
  setAiBadge("AI 状态检测中", "checking");
  if (hasClientAiConfig()) {
    aiStatus = {
      checked: true,
      aiEnabled: true,
      model: aiConfig.model,
      endpoint: normalizeBaseUrl(aiConfig.baseUrl)
    };
    setAiBadge(`AI 已配置：${aiConfig.model}`, "ok");
    return;
  }

  try {
    const status = await requestJson("/api/status");
    aiStatus = {
      checked: true,
      aiEnabled: Boolean(status.aiEnabled),
      model: status.model || "",
      endpoint: status.endpoint || ""
    };
    if (aiStatus.aiEnabled) {
      setAiBadge(`AI 已启用：${aiStatus.model}`, "ok");
    } else {
      setAiBadge("请配置 AI", "warn");
    }
  } catch (_error) {
    aiStatus = { checked: true, aiEnabled: false, model: "", endpoint: "" };
    setAiBadge("请配置 AI", "warn");
  }
}

function setAiBadge(text, state) {
  if (!els.aiStatusBadge) return;
  els.aiStatusBadge.textContent = text;
  els.aiStatusBadge.dataset.state = state;
}

function hydrateAiConfigForm() {
  els.aiBaseUrl.value = aiConfig.baseUrl || "https://api.openai.com/v1";
  els.aiApiKey.value = aiConfig.apiKey || "";
  const models = aiConfig.models?.length ? aiConfig.models : aiConfig.model ? [aiConfig.model] : [];
  setModelOptions(models, aiConfig.model || "");
  if (hasClientAiConfig()) {
    els.aiConfigStatus.textContent = `已保存配置：${aiConfig.model}`;
  }
}

async function testAiConfig() {
  const draft = readAiConfigForm();
  if (!draft.baseUrl || !draft.apiKey) {
    els.aiConfigStatus.textContent = "请先填写 BaseUrl 和 API Key。";
    return;
  }

  els.testAiConfig.disabled = true;
  els.aiConfigStatus.textContent = "正在测试连接并获取模型列表。";
  try {
    const result = await requestJson("/api/test-ai-config", {
      method: "POST",
      body: JSON.stringify({
        baseUrl: draft.baseUrl,
        apiKey: draft.apiKey
      })
    });
    const models = result.models || [];
    const selected = models.includes(draft.model) ? draft.model : models[0] || "";
    setModelOptions(models, selected);
    aiConfig = {
      baseUrl: result.baseUrl || draft.baseUrl,
      apiKey: draft.apiKey,
      model: selected,
      models
    };
    saveAiConfig(aiConfig);
    els.aiConfigStatus.textContent = result.message || "测试链接成功！";
    checkAiStatus();
  } catch (error) {
    els.aiConfigStatus.textContent = `测试连接失败：${error.message}`;
  } finally {
    els.testAiConfig.disabled = false;
  }
}

function saveAiConfigFromForm() {
  const draft = readAiConfigForm();
  if (!draft.baseUrl || !draft.apiKey || !draft.model) {
    els.aiConfigStatus.textContent = "请填写 BaseUrl、API Key，并测试后选择模型。";
    return;
  }

  aiConfig = {
    ...aiConfig,
    ...draft,
    models: getCurrentModelOptions()
  };
  saveAiConfig(aiConfig);
  els.aiConfigStatus.textContent = "AI 配置已保存。";
  checkAiStatus();
}

function clearAiConfig() {
  aiConfig = {};
  localStorage.removeItem(AI_CONFIG_KEY);
  els.aiApiKey.value = "";
  els.aiBaseUrl.value = "https://api.openai.com/v1";
  setModelOptions([], "");
  els.aiConfigStatus.textContent = "AI 配置已清除。";
  checkAiStatus();
}

function readAiConfigForm() {
  return {
    baseUrl: normalizeBaseUrl(els.aiBaseUrl.value || ""),
    apiKey: els.aiApiKey.value.trim(),
    model: els.aiModel.value
  };
}

function getAiClientConfig() {
  if (!hasClientAiConfig()) return null;
  return {
    baseUrl: normalizeBaseUrl(aiConfig.baseUrl),
    apiKey: aiConfig.apiKey,
    model: aiConfig.model
  };
}

function hasClientAiConfig() {
  return Boolean(aiConfig.baseUrl && aiConfig.apiKey && aiConfig.model);
}

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function setModelOptions(models, selected) {
  const uniqueModels = [...new Set((models || []).filter(Boolean).map(String))].sort((a, b) =>
    a.localeCompare(b)
  );
  els.aiModel.innerHTML = uniqueModels.length
    ? uniqueModels
        .map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
        .join("")
    : `<option value="">请先测试连接</option>`;
  if (selected && uniqueModels.includes(selected)) {
    els.aiModel.value = selected;
  }
}

function getCurrentModelOptions() {
  return [...els.aiModel.options].map((option) => option.value).filter(Boolean);
}

async function requestAiLayout(title, content, analysis, overrides = {}) {
  const payload = {
    title,
    content: stripInlineImageData(content),
    localAnalysis: analysis,
    modePreference: overrides.modePreference || els.mode.value,
    densityPreference: overrides.densityPreference || els.density.value,
    templates: templates.map(toTemplateBrief),
    aiConfig: getAiClientConfig()
  };
  const data = await requestJson("/api/ai-layout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.plan;
}

async function requestAiNativeLayout(title, content, analysis) {
  const payload = {
    title,
    content: stripNativeAiContent(content),
    localAnalysis: analysis,
    densityPreference: els.density.value,
    aiConfig: getAiClientConfig()
  };
  const data = await requestJson("/api/ai-native-layout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return {
    ...(data.native || {}),
    model: data.model || aiStatus.model,
    endpoint: data.endpoint || ""
  };
}

async function requestAiLearnTemplate(source, name) {
  const data = await requestJson("/api/ai-learn-template", {
    method: "POST",
    body: JSON.stringify({ source, name, aiConfig: getAiClientConfig() })
  });
  return data;
}

async function requestReferenceUrl(url) {
  return requestJson("/api/fetch-reference-url", {
    method: "POST",
    body: JSON.stringify({ url })
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      (typeof data.detail === "string" && data.detail.trim()) ||
      (typeof data.error === "string" && data.error.trim()) ||
      response.statusText ||
      `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return data;
}

function applyAiPlan(plan, localAnalysis) {
  const forceGenerate = els.engine.value === "ai" && els.mode.value === "generate";
  const existing =
    !forceGenerate && plan?.decision?.mode === "use_existing"
      ? templates.find((template) => template.id === plan.decision.selectedTemplateId)
      : null;
  const template = existing || normalizeAiTemplate(plan?.template, localAnalysis);

  if (!existing && template) {
    installRuntimeTemplate(template);
  }

  return {
    template,
    density: plan?.decision?.density || els.density.value,
    analysis: mergeAiAnalysis(localAnalysis, plan)
  };
}

function persistGeneratedAiTemplate({ template, plan, analysis, title, content, useAi }) {
  if (!useAi || els.engine.value !== "ai" || els.mode.value !== "generate") return null;
  if (!template || plan?.decision?.mode === "use_existing") return null;

  const fingerprint = templateFingerprint(template, title, content);
  const existing = userTemplates.find((item) => item.aiFingerprint === fingerprint);
  if (existing) {
    selectedTemplateId = existing.id;
    return { template: existing, created: false };
  }

  const saved = upgradeTemplateSchema({
    ...template,
    id: `ai-generated-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    source: "ai-generated",
    name: uniqueTemplateName(template.name || `${analysis.typeLabel}AI 模板`),
    description: String(template.description || `AI 根据「${analysis.typeLabel}」文章生成的整套排版模板。`).slice(0, 120),
    aiFingerprint: fingerprint,
    aiModel: aiStatus.model || "",
    aiEndpoint: aiStatus.endpoint || "",
    aiSummary: {
      styleName: template.name || "AI 内容驱动模板",
      visualDNA: plan?.analysis?.rationale || template.description || "AI 根据当前文章生成的整体版式系统。",
      layoutRules: describeTemplateDesign(template),
      suitableFor: [analysis.typeLabel, analysis.type, ...(template.tags || [])].filter(Boolean).slice(0, 6)
    }
  });

  runtimeTemplates = runtimeTemplates.filter((item) => item.id !== template.id);
  userTemplates = [saved, ...userTemplates].slice(0, 200);
  saveUserTemplates(userTemplates);
  rebuildTemplates();
  selectedTemplateId = saved.id;
  els.learnSummary.textContent = `AI 已将本次排版学习为新模板「${saved.name}」，后续可在模板库中搜索、复用或删除。`;
  return { template: saved, created: true };
}

function templateFingerprint(template, title, content) {
  return hashString(
    JSON.stringify({
      title: String(title || "").slice(0, 80),
      contentSignal: `${String(content || "").length}:${String(content || "").slice(0, 120)}`,
      family: template.family,
      colors: template.colors,
      rhythm: template.rhythm,
      design: template.design
    })
  );
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function uniqueTemplateName(name) {
  const base = String(name || "AI 生成模板").slice(0, 22);
  if (!templates.some((template) => template.name === base)) return base;
  const suffix = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }).replace(":", "");
  return `${base.slice(0, 18)} ${suffix}`.trim();
}

function describeTemplateDesign(template) {
  const design = template.design || defaultDesignForFamily(template.family);
  return [
    `文头：${design.hero.layout} / ${design.hero.ornament} / ${design.hero.align}`,
    `标题：${design.heading.style} / ${design.heading.numbering}`,
    `引用：${design.quote.style} / ${design.quote.emphasis}`,
    `列表：${design.list.style} / ${design.list.marker}`,
    `图片：${design.image.style} / ${design.image.defaultWidth}%`,
    `分隔：${design.divider.style}`
  ];
}

function mergeAiAnalysis(localAnalysis, plan) {
  const ai = plan?.analysis || {};
  return {
    ...localAnalysis,
    type: ai.type || localAnalysis.type,
    typeLabel: ai.typeLabel || localAnalysis.typeLabel,
    tone: ai.tone || localAnalysis.tone,
    aiAudience: ai.audience || "",
    aiReadingPath: ai.readingPath || "",
    aiRationale: ai.rationale || "",
    aiDecisionReason: plan?.decision?.reason || "",
    aiSuggestions: Array.isArray(plan?.suggestions) ? plan.suggestions : []
  };
}

function normalizeAiTemplate(template, analysis) {
  if (!template) return createGeneratedTemplate(analysis, false);
  const fallback = createGeneratedTemplate(analysis, false);
  const family = isKnownFamily(template.family) ? template.family : fallback.family;
  return {
    schemaVersion: 2,
    id: template.id && !templates.some((item) => item.id === template.id) ? template.id : `ai-${Date.now()}`,
    source: template.source || "ai",
    name: String(template.name || fallback.name).slice(0, 28),
    family,
    description: String(template.description || fallback.description).slice(0, 120),
    tags: Array.isArray(template.tags) && template.tags.length ? template.tags.slice(0, 8).map(String) : fallback.tags,
    colors: {
      ...fallback.colors,
      ...sanitizeColors(template.colors)
    },
    rhythm: {
      paragraph: clamp(Math.round(Number(template.rhythm?.paragraph) || fallback.rhythm.paragraph), 14, 18),
      line: clamp(Number(Number(template.rhythm?.line || fallback.rhythm.line).toFixed(2)), 1.65, 2.08),
      gap: clamp(Math.round(Number(template.rhythm?.gap) || fallback.rhythm.gap), 12, 24),
      radius: clamp(Math.round(Number(template.rhythm?.radius) || fallback.rhythm.radius), 0, 16)
    },
    design: normalizeTemplateDesign(template.design, family)
  };
}

function normalizeTemplateDesign(design, family) {
  const fallback = defaultDesignForFamily(family);
  return {
    hero: {
      layout: enumValue(design?.hero?.layout, ["panel", "banner", "minimal", "centered", "poster"], fallback.hero.layout),
      ornament: enumValue(design?.hero?.ornament, ["bar", "pill", "corner", "number", "none"], fallback.hero.ornament),
      align: enumValue(design?.hero?.align, ["left", "center"], fallback.hero.align)
    },
    heading: {
      style: enumValue(design?.heading?.style, ["bar", "badge", "numbered", "centered", "underline", "boxed"], fallback.heading.style),
      numbering: enumValue(design?.heading?.numbering, ["decimal", "hash", "none"], fallback.heading.numbering)
    },
    quote: {
      style: enumValue(design?.quote?.style, ["left-border", "card", "centered", "speech", "highlight"], fallback.quote.style),
      emphasis: enumValue(design?.quote?.emphasis, ["soft", "strong"], fallback.quote.emphasis)
    },
    list: {
      style: enumValue(design?.list?.style, ["card", "checklist", "timeline", "plain"], fallback.list.style),
      marker: enumValue(design?.list?.marker, ["dot", "number", "check", "dash"], fallback.list.marker)
    },
    image: {
      style: enumValue(design?.image?.style, ["clean", "framed", "card", "poster"], fallback.image.style),
      defaultWidth: clamp(Math.round(Number(design?.image?.defaultWidth) || fallback.image.defaultWidth), 60, 100)
    },
    divider: {
      style: enumValue(design?.divider?.style, ["line", "dots", "bar", "none"], fallback.divider.style)
    }
  };
}

function defaultDesignForFamily(family) {
  const map = {
    insight: {
      hero: { layout: "panel", ornament: "bar", align: "left" },
      heading: { style: "bar", numbering: "decimal" },
      quote: { style: "left-border", emphasis: "soft" },
      list: { style: "card", marker: "dot" },
      image: { style: "framed", defaultWidth: 90 },
      divider: { style: "line" }
    },
    business: {
      hero: { layout: "banner", ornament: "bar", align: "left" },
      heading: { style: "underline", numbering: "decimal" },
      quote: { style: "card", emphasis: "strong" },
      list: { style: "card", marker: "number" },
      image: { style: "framed", defaultWidth: 90 },
      divider: { style: "bar" }
    },
    tech: {
      hero: { layout: "panel", ornament: "corner", align: "left" },
      heading: { style: "bar", numbering: "hash" },
      quote: { style: "left-border", emphasis: "soft" },
      list: { style: "plain", marker: "dash" },
      image: { style: "framed", defaultWidth: 100 },
      divider: { style: "line" }
    },
    human: {
      hero: { layout: "centered", ornament: "bar", align: "center" },
      heading: { style: "centered", numbering: "none" },
      quote: { style: "centered", emphasis: "soft" },
      list: { style: "plain", marker: "dot" },
      image: { style: "clean", defaultWidth: 90 },
      divider: { style: "dots" }
    },
    brand: {
      hero: { layout: "centered", ornament: "pill", align: "center" },
      heading: { style: "centered", numbering: "decimal" },
      quote: { style: "card", emphasis: "soft" },
      list: { style: "card", marker: "dot" },
      image: { style: "card", defaultWidth: 90 },
      divider: { style: "dots" }
    },
    event: {
      hero: { layout: "poster", ornament: "pill", align: "left" },
      heading: { style: "badge", numbering: "decimal" },
      quote: { style: "highlight", emphasis: "strong" },
      list: { style: "checklist", marker: "check" },
      image: { style: "poster", defaultWidth: 100 },
      divider: { style: "bar" }
    },
    education: {
      hero: { layout: "panel", ornament: "pill", align: "left" },
      heading: { style: "boxed", numbering: "decimal" },
      quote: { style: "card", emphasis: "soft" },
      list: { style: "checklist", marker: "check" },
      image: { style: "framed", defaultWidth: 90 },
      divider: { style: "line" }
    },
    data: {
      hero: { layout: "panel", ornament: "bar", align: "left" },
      heading: { style: "boxed", numbering: "hash" },
      quote: { style: "left-border", emphasis: "strong" },
      list: { style: "timeline", marker: "number" },
      image: { style: "framed", defaultWidth: 100 },
      divider: { style: "line" }
    }
  };
  return map[family] || {
    hero: { layout: "panel", ornament: "bar", align: "left" },
    heading: { style: "bar", numbering: "decimal" },
    quote: { style: "left-border", emphasis: "soft" },
    list: { style: "card", marker: "dot" },
    image: { style: "framed", defaultWidth: 90 },
    divider: { style: "line" }
  };
}

function enumValue(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function sanitizeColors(colors = {}) {
  return Object.fromEntries(
    Object.entries(colors).filter(([, value]) => /^#[0-9a-fA-F]{6}$/.test(String(value || "")))
  );
}

function isKnownFamily(family) {
  return ["insight", "business", "tech", "human", "event", "education", "brand", "data"].includes(family);
}

function toTemplateBrief(template) {
  return {
    schemaVersion: 2,
    id: template.id,
    name: template.name,
    family: template.family,
    description: template.description,
    tags: template.tags,
    colors: template.colors,
    rhythm: template.rhythm,
    design: template.design || defaultDesignForFamily(template.family)
  };
}

function installRuntimeTemplate(template) {
  const upgraded = upgradeTemplateSchema(template);
  runtimeTemplates = [upgraded, ...runtimeTemplates.filter((item) => item.id !== upgraded.id)].slice(0, 8);
  rebuildTemplates();
}

function rebuildTemplates() {
  templates = [...runtimeTemplates, ...DEFAULT_TEMPLATES, ...userTemplates];
}

async function generatePersistentTemplate(analysis) {
  if (els.engine.value === "ai" && aiStatus.aiEnabled && (els.title.value.trim() || els.content.value.trim())) {
    els.learnSummary.textContent = `AI 正在生成整套模板，使用模型 ${aiStatus.model}。`;
    try {
      const plan = await requestAiLayout(els.title.value.trim(), els.content.value.trim(), analysis, {
        modePreference: "generate"
      });
      return {
        ...normalizeAiTemplate(plan.template, analysis),
        id: `ai-saved-${Date.now()}`,
        source: "ai-generated"
      };
    } catch (error) {
      els.learnSummary.textContent = `AI 模板生成失败，已使用本地生成：${error.message}`;
    }
  }
  return createGeneratedTemplate(analysis, true);
}

function analyzeArticle(title, content) {
  const text = `${title}\n${content}`.trim();
  const cleanText = text.replace(/\s+/g, "");
  const paragraphCount = content.split(/\n\s*\n/).filter(Boolean).length;
  const headingCount = (content.match(/^#{1,4}\s+/gm) || []).length;
  const hasCode = /```|`[^`]+`|API|SDK|模型|算法|代码|工程|系统|GitHub/i.test(text);
  const hasManyNumbers = (text.match(/\d+(\.\d+)?%?|\d+\s*(万|亿|k|K|M|G)?/g) || []).length >= 5;

  const keywordMap = {
    research: ["调研", "研究", "趋势", "洞察", "复盘", "报告", "拆解", "本质", "为什么", "观察"],
    business: ["增长", "商业", "市场", "战略", "转化", "营收", "产品", "用户", "客户", "品牌", "运营"],
    tech: ["AI", "API", "模型", "算法", "代码", "开源", "系统", "工程", "数据结构", "工具", "自动化"],
    education: ["方法", "步骤", "指南", "教程", "清单", "学习", "课程", "如何", "实践", "技巧"],
    event: ["活动", "报名", "直播", "发布会", "邀请", "福利", "招募", "开营", "名额", "预约"],
    story: ["故事", "访谈", "人物", "经历", "我", "我们", "她", "他", "那天", "后来"],
    brand: ["品牌", "案例", "客户", "体验", "口碑", "服务", "价值主张", "定位", "故事"],
    data: ["数据", "指标", "同比", "环比", "样本", "占比", "统计", "增长率", "表格", "结论"]
  };

  const scores = {};
  for (const [type, words] of Object.entries(keywordMap)) {
    scores[type] = words.reduce((sum, word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return sum + (text.match(new RegExp(escaped, "gi")) || []).length;
    }, 0);
  }
  if (hasCode) scores.tech += 3;
  if (hasManyNumbers) scores.data += 3;
  if (/报名|时间|地点|嘉宾|日程|席位/.test(text)) scores.event += 3;
  if (/第一|第二|第三|步骤|清单|要点/.test(text)) scores.education += 2;

  const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const type = sortedTypes[0]?.[1] > 0 ? sortedTypes[0][0] : "general";
  const secondaryTypes = sortedTypes
    .slice(1, 4)
    .filter((entry) => entry[1] > 0)
    .map((entry) => entry[0]);

  const typeLabels = {
    research: "深度分析",
    business: "商业策略",
    tech: "科技工具",
    education: "教程方法",
    event: "活动官宣",
    story: "故事随笔",
    brand: "品牌案例",
    data: "数据报告",
    general: "通用长文"
  };

  const tone = detectTone(text, type);
  const chars = cleanText.length;
  const readingMinutes = Math.max(1, Math.ceil(chars / 520));
  const isLong = chars > 1800 || paragraphCount > 10;
  const isShort = chars < 900;
  const structureNeed = headingCount ? "保留原有层级" : paragraphCount > 5 ? "自动切分章节" : "轻量增强";

  return {
    type,
    typeLabel: typeLabels[type],
    secondaryTypes,
    tone,
    chars,
    paragraphCount,
    headingCount,
    hasCode,
    hasManyNumbers,
    readingMinutes,
    isLong,
    isShort,
    structureNeed,
    scores
  };
}

function detectTone(text, type) {
  if (type === "event") return "明亮、有行动号召";
  if (type === "tech") return "清晰、理性、效率感";
  if (type === "story" || /我|我们|后来|那天/.test(text)) return "叙事、有温度";
  if (type === "data") return "克制、结论先行";
  if (/必须|关键|核心|真正|本质/.test(text)) return "判断明确";
  return "稳重、易读";
}

function parseArticle(title, content, options) {
  const blocks = parseBlocks(content, options);
  const enhanced = enhanceStructure(blocks, options);
  const leadIndex = enhanced.findIndex((block) => block.type === "paragraph" && block.text.length > 0);
  if (leadIndex >= 0) {
    enhanced[leadIndex] = { ...enhanced[leadIndex], isLead: true };
  }
  return {
    title,
    blocks: enhanced,
    lead: leadIndex >= 0 ? enhanced[leadIndex].text : "",
    stats: {
      blockCount: enhanced.length,
      headings: enhanced.filter((block) => block.type === "heading").length,
      quotes: enhanced.filter((block) => block.type === "quote").length
    }
  };
}

function parseBlocks(content, options) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    let line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: imageMatch[1],
        src: imageMatch[2],
        options: parseImageOptions(imageMatch[3] || "")
      });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: Math.min(headingMatch[1].length, 3),
        text: headingMatch[2].trim()
      });
      index += 1;
      continue;
    }

    if (isSmartHeading(line, options)) {
      blocks.push({ type: "heading", level: 2, text: cleanHeadingText(line) });
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\s*\d+[.)、]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+[.)、]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)、]\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    if (looksLikeTable(lines, index)) {
      const rows = [];
      while (index < lines.length && /\|/.test(lines[index])) {
        const row = lines[index]
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);
        if (!row.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(row);
        index += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    const para = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)、]\s+/.test(lines[index]) &&
      !/^```/.test(lines[index].trim()) &&
      !looksLikeTable(lines, index)
    ) {
      para.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: para.join(" ") });
  }

  return blocks;
}

function isSmartHeading(line, options) {
  if (!options.smartStructure) return false;
  const text = line.trim();
  if (text.length > 28 || text.length < 3) return false;
  if (/[。？！；,.，:：]$/.test(text)) return false;
  if (/^[-*+\d]/.test(text)) return false;
  return /^(一|二|三|四|五|六|七|八|九|十)[、. ]|^\d+[、. ]|^[^。！？]{2,12}(是什么|怎么做|为什么|关键|方法|结论|复盘)$/.test(
    text
  );
}

function cleanHeadingText(text) {
  return text.trim().replace(/^(一|二|三|四|五|六|七|八|九|十|\d+)[、. ]\s*/, "");
}

function looksLikeTable(lines, index) {
  return /\|/.test(lines[index] || "") && /\|/.test(lines[index + 1] || "");
}

function enhanceStructure(blocks, options) {
  if (!options.smartStructure) return blocks;
  const headingCount = blocks.filter((block) => block.type === "heading").length;
  const paragraphs = blocks.filter((block) => block.type === "paragraph");
  if (headingCount > 0 || paragraphs.length < 6) return blocks;

  const autoHeadings = ["核心观察", "关键展开", "方法与判断", "下一步建议"];
  const enhanced = [];
  let paraSeen = 0;
  blocks.forEach((block) => {
    if (block.type === "paragraph" && paraSeen % 3 === 0) {
      enhanced.push({
        type: "heading",
        level: 2,
        text: autoHeadings[Math.min(Math.floor(paraSeen / 3), autoHeadings.length - 1)],
        auto: true
      });
    }
    enhanced.push(block);
    if (block.type === "paragraph") paraSeen += 1;
  });
  return enhanced;
}

function inferTitle(content) {
  const firstLine = content.split(/\n/).find((line) => line.trim());
  if (!firstLine) return "未命名文章";
  return firstLine.replace(/^#{1,4}\s+/, "").slice(0, 42);
}

function renderArticle(template, doc, analysis, options) {
  const density = getDensity(options.density, template.rhythm);
  const palette = template.colors;
  const rootStyle = toStyle({
    "max-width": "677px",
    margin: "0 auto",
    padding: density.rootPadding,
    background: palette.page,
    color: palette.ink,
    "font-family": WECHAT_FONT,
    "box-sizing": "border-box"
  });

  const html = [
    `<section data-wechatpostgpt="article" style="${rootStyle}">`,
    renderHero(template, doc, analysis, density),
    renderBody(template, doc, density),
    renderFooter(template, analysis, density),
    `</section>`
  ].join("");

  return html.replace(/\sdata-wechatpostgpt="[^"]+"/g, "");
}

function getDensity(density, rhythm) {
  const base = rhythm || { paragraph: 16, line: 1.86, gap: 17, radius: 8 };
  const map = {
    compact: { scale: 0.92, rootPadding: "22px 16px 28px" },
    balanced: { scale: 1, rootPadding: "28px 18px 36px" },
    relaxed: { scale: 1.08, rootPadding: "34px 20px 44px" }
  };
  const selected = map[density] || map.balanced;
  return {
    paragraph: Math.round(base.paragraph * selected.scale),
    line: Math.max(1.72, Number((base.line * selected.scale).toFixed(2))),
    gap: Math.round(base.gap * selected.scale),
    radius: base.radius,
    rootPadding: selected.rootPadding
  };
}

function renderHero(template, doc, analysis, density) {
  if (template.design) return renderDesignedHero(template, doc, analysis, density);

  const c = template.colors;
  const title = escapeHtml(doc.title || "未命名文章");
  const label = escapeHtml(analysis.typeLabel);
  const lead = doc.lead ? inlineMarkdown(doc.lead, template) : "";

  if (template.family === "business") {
    return `<section style="${toStyle({
      margin: "0 0 28px",
      padding: "24px 20px",
      background: c.panel,
      color: "#ffffff",
      "border-radius": `${density.radius}px`
    })}"><section style="${toStyle({
      "font-size": "12px",
      color: c.soft,
      "font-weight": "700",
      "letter-spacing": "0.08em",
      "margin-bottom": "16px"
    })}">BRIEF / ${label}</section><section style="${toStyle({
      "font-size": "27px",
      "line-height": "1.28",
      "font-weight": "800",
      "margin-bottom": "18px"
    })}">${title}</section><section style="${toStyle({
      width: "58px",
      height: "4px",
      background: c.accent,
      "border-radius": "10px",
      "margin-bottom": lead ? "18px" : "0"
    })}"></section>${lead ? `<p style="${toStyle({
      margin: "0",
      color: "#edf2f7",
      "font-size": `${density.paragraph}px`,
      "line-height": density.line
    })}">${lead}</p>` : ""}</section>`;
  }

  if (template.family === "tech") {
    return `<section style="${toStyle({
      margin: "0 0 26px",
      padding: "22px 18px",
      background: c.panel,
      "border-radius": `${density.radius}px`,
      border: `1px solid ${mix(c.accent, "#ffffff", 0.18)}`
    })}"><section style="${toStyle({
      color: c.accent,
      "font-size": "13px",
      "font-weight": "800",
      "font-family": "Consolas, 'SFMono-Regular', monospace",
      "margin-bottom": "14px"
    })}">[${label}]</section><section style="${toStyle({
      color: "#f7fff9",
      "font-size": "26px",
      "line-height": "1.28",
      "font-weight": "800"
    })}">${title}</section>${lead ? `<section style="${toStyle({
      margin: "18px 0 0",
      padding: "14px 0 0",
      borderTop: `1px solid ${mix(c.accent, "#ffffff", 0.25)}`,
      color: "#d6eee5",
      "font-size": `${density.paragraph}px`,
      "line-height": density.line
    })}">${lead}</section>` : ""}</section>`;
  }

  if (template.family === "event") {
    return `<section style="${toStyle({
      margin: "0 0 28px",
      padding: "22px 18px",
      background: c.panel,
      border: `2px solid ${c.accent}`,
      "border-radius": `${density.radius}px`
    })}"><section style="${toStyle({
      display: "inline-block",
      padding: "6px 12px",
      background: c.accent,
      color: "#ffffff",
      "border-radius": "999px",
      "font-size": "12px",
      "font-weight": "800",
      "margin-bottom": "16px"
    })}">${label}</section><section style="${toStyle({
      "font-size": "27px",
      "line-height": "1.24",
      color: c.ink,
      "font-weight": "900"
    })}">${title}</section>${lead ? `<p style="${toStyle({
      margin: "16px 0 0",
      color: c.muted,
      "font-size": `${density.paragraph}px`,
      "line-height": density.line
    })}">${lead}</p>` : ""}</section>`;
  }

  if (template.family === "human" || template.family === "brand") {
    return `<section style="${toStyle({
      margin: "0 0 30px",
      padding: "10px 4px 24px",
      "text-align": "center",
      borderBottom: `1px solid ${c.line}`
    })}"><section style="${toStyle({
      color: c.accent,
      "font-size": "13px",
      "font-weight": "800",
      "margin-bottom": "14px"
    })}">${template.family === "brand" ? "BRAND STORY" : "ESSAY"} / ${label}</section><section style="${toStyle({
      color: c.ink,
      "font-size": "28px",
      "line-height": "1.32",
      "font-weight": "800"
    })}">${title}</section>${lead ? `<p style="${toStyle({
      margin: "18px auto 0",
      "max-width": "92%",
      color: c.muted,
      "font-size": `${density.paragraph}px`,
      "line-height": density.line,
      "text-align": "left"
    })}">${lead}</p>` : ""}</section>`;
  }

  if (template.family === "data") {
    return `<section style="${toStyle({
      margin: "0 0 28px",
      padding: "22px 18px",
      background: c.panel,
      borderLeft: `6px solid ${c.accent}`,
      borderBottom: `1px solid ${c.line}`,
      "border-radius": `${density.radius}px`
    })}"><section style="${toStyle({
      color: c.accent2,
      "font-size": "12px",
      "font-weight": "900",
      "letter-spacing": "0.08em",
      "margin-bottom": "12px"
    })}">DATA VIEW / ${label}</section><section style="${toStyle({
      "font-size": "27px",
      "line-height": "1.28",
      color: c.ink,
      "font-weight": "800"
    })}">${title}</section>${lead ? `<p style="${toStyle({
      margin: "16px 0 0",
      color: c.muted,
      "font-size": `${density.paragraph}px`,
      "line-height": density.line
    })}">${lead}</p>` : ""}</section>`;
  }

  return `<section style="${toStyle({
    margin: "0 0 28px",
    padding: "24px 18px 22px",
    background: c.panel,
    border: `1px solid ${c.line}`,
    "border-radius": `${density.radius}px`
  })}"><section style="${toStyle({
    color: c.accent,
    "font-size": "13px",
    "font-weight": "800",
    "margin-bottom": "14px"
  })}">${label}</section><section style="${toStyle({
    "font-size": "28px",
    "line-height": "1.28",
    color: c.ink,
    "font-weight": "800"
  })}">${title}</section><section style="${toStyle({
    width: "46px",
    height: "3px",
    background: c.accent,
    "border-radius": "20px",
    margin: "16px 0"
  })}"></section>${lead ? `<p style="${toStyle({
    margin: "0",
    color: c.muted,
    "font-size": `${density.paragraph}px`,
    "line-height": density.line
  })}">${lead}</p>` : ""}</section>`;
}

function renderDesignedHero(template, doc, analysis, density) {
  const c = template.colors;
  const design = template.design.hero;
  const title = escapeHtml(doc.title || "未命名文章");
  const label = escapeHtml(analysis.typeLabel);
  const lead = doc.lead ? inlineMarkdown(doc.lead, template) : "";
  const centered = design.align === "center";
  const isPoster = design.layout === "poster";
  const isBanner = design.layout === "banner";
  const background =
    design.layout === "minimal" ? "transparent" : isPoster ? c.accent : isBanner ? c.ink : c.panel;
  const foreground = isPoster || isBanner ? c.page : c.ink;
  const muted = isPoster || isBanner ? mix(c.page, background === "transparent" ? c.ink : background, 0.28) : c.muted;
  const frameStyle = {
    margin: "0 0 28px",
    padding: design.layout === "minimal" ? "8px 2px 24px" : isPoster ? "26px 20px 24px" : "22px 18px",
    background,
    color: foreground,
    "border-radius": design.layout === "minimal" ? "0" : `${density.radius + (isPoster ? 6 : 2)}px`,
    border: design.layout === "minimal" ? "0" : `1px solid ${isPoster ? c.accent : c.line}`,
    "border-left": design.ornament === "corner" ? `7px solid ${c.accent}` : undefined,
    "text-align": centered ? "center" : "left"
  };

  const ornament = renderDesignedHeroOrnament(design.ornament, label, c, isPoster || isBanner);
  return `<section style="${toStyle(frameStyle)}">${ornament}<section style="${toStyle({
    color: foreground,
    "font-size": isPoster ? "30px" : "28px",
    "line-height": "1.28",
    "font-weight": "900",
    margin: design.ornament === "none" ? "0 0 14px" : "0 0 16px"
  })}">${title}</section>${renderDesignDivider(template, centered ? "center" : "left")}${lead ? `<p style="${toStyle({
    margin: "16px 0 0",
    color: muted,
    "font-size": `${density.paragraph}px`,
    "line-height": density.line,
    "text-align": "left"
  })}">${lead}</p>` : ""}</section>`;
}

function renderDesignedHeroOrnament(ornament, label, colors, inverted) {
  if (ornament === "none") return "";
  if (ornament === "pill") {
    return `<section style="${toStyle({
      display: "inline-block",
      padding: "6px 12px",
      background: inverted ? colors.page : colors.accent,
      color: inverted ? colors.accent : colors.page,
      "border-radius": "999px",
      "font-size": "12px",
      "font-weight": "900",
      "margin-bottom": "16px"
    })}">${label}</section>`;
  }
  if (ornament === "number") {
    return `<section style="${toStyle({
      color: inverted ? colors.page : colors.accent,
      "font-size": "42px",
      "font-weight": "900",
      "line-height": "1",
      opacity: "0.35",
      "margin-bottom": "8px"
    })}">01</section>`;
  }
  if (ornament === "corner") {
    return `<section style="${toStyle({
      color: inverted ? colors.page : colors.accent,
      "font-size": "12px",
      "font-weight": "900",
      "letter-spacing": "0.08em",
      "margin-bottom": "14px"
    })}">${label}</section>`;
  }
  return `<section style="${toStyle({
    width: "54px",
    height: "4px",
    background: inverted ? colors.page : colors.accent,
    "border-radius": "20px",
    "margin-bottom": "16px"
  })}"></section>`;
}

function renderBody(template, doc, density) {
  let sectionIndex = 0;
  return doc.blocks
    .map((block) => {
      if (block.isLead) return "";
      if (block.type === "heading") {
        sectionIndex += 1;
        return renderHeading(block, template, density, sectionIndex);
      }
      if (block.type === "paragraph") return renderParagraph(block.text, template, density);
      if (block.type === "quote") return renderQuote(block.text, template, density);
      if (block.type === "list") return renderList(block, template, density);
      if (block.type === "image") return renderImage(block, template, density);
      if (block.type === "code") return renderCode(block.text, template, density);
      if (block.type === "table") return renderTable(block.rows, template, density);
      return "";
    })
    .join("");
}

function renderHeading(block, template, density, index) {
  if (template.design) return renderDesignedHeading(block, template, density, index);

  const c = template.colors;
  const text = inlineMarkdown(block.text, template);
  const num = String(index).padStart(2, "0");

  if (template.family === "business") {
    return `<section style="${toStyle({
      margin: `${density.gap + 10}px 0 ${density.gap}px`,
      padding: "0 0 10px",
      borderBottom: `2px solid ${c.accent}`
    })}"><span style="${toStyle({
      display: "inline-block",
      color: c.accent,
      "font-size": "12px",
      "font-weight": "900",
      "margin-right": "10px"
    })}">POINT ${num}</span><span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  if (template.family === "tech") {
    return `<section style="${toStyle({
      margin: `${density.gap + 8}px 0 ${density.gap}px`,
      padding: "10px 12px",
      background: c.soft,
      borderLeft: `4px solid ${c.accent}`,
      "border-radius": `${density.radius}px`
    })}"><span style="${toStyle({
      color: c.accent,
      "font-family": "Consolas, 'SFMono-Regular', monospace",
      "font-size": "13px",
      "font-weight": "900",
      "margin-right": "8px"
    })}">[${num}]</span><span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  if (template.family === "human" || template.family === "brand") {
    return `<section style="${toStyle({
      margin: `${density.gap + 14}px 0 ${density.gap}px`,
      "text-align": "center"
    })}"><section style="${toStyle({
      color: c.accent,
      "font-size": "12px",
      "font-weight": "800",
      "margin-bottom": "8px"
    })}">${num}</section><section style="${headingTextStyle(template, density)}">${text}</section><section style="${toStyle({
      width: "36px",
      height: "2px",
      background: c.accent2,
      margin: "10px auto 0",
      "border-radius": "4px"
    })}"></section></section>`;
  }

  if (template.family === "event") {
    return `<section style="${toStyle({
      margin: `${density.gap + 8}px 0 ${density.gap}px`
    })}"><span style="${toStyle({
      display: "inline-block",
      minWidth: "34px",
      padding: "5px 8px",
      background: c.accent,
      color: "#ffffff",
      "border-radius": "999px",
      "font-size": "12px",
      "font-weight": "900",
      "text-align": "center",
      "margin-right": "8px"
    })}">${num}</span><span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  if (template.family === "data") {
    return `<section style="${toStyle({
      margin: `${density.gap + 8}px 0 ${density.gap}px`,
      padding: "12px 0 8px",
      borderTop: `1px solid ${c.line}`
    })}"><span style="${toStyle({
      display: "inline-block",
      color: c.accent2,
      "font-size": "12px",
      "font-weight": "900",
      "margin-right": "8px"
    })}">#${num}</span><span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  return `<section style="${toStyle({
    margin: `${density.gap + 10}px 0 ${density.gap}px`,
    padding: "10px 12px",
    background: c.soft,
    borderLeft: `4px solid ${c.accent}`,
    "border-radius": `${density.radius}px`
  })}"><span style="${toStyle({
    display: "inline-block",
    color: c.accent,
    "font-size": "12px",
    "font-weight": "900",
    "margin-right": "8px"
  })}">${num}</span><span style="${headingTextStyle(template, density)}">${text}</span></section>`;
}

function renderDesignedHeading(block, template, density, index) {
  const c = template.colors;
  const design = template.design.heading;
  const text = inlineMarkdown(block.text, template);
  const marker = design.numbering === "none" ? "" : design.numbering === "hash" ? `#${index}` : String(index).padStart(2, "0");
  const markerHtml = marker
    ? `<span style="${toStyle({
        display: "inline-block",
        padding: design.style === "badge" ? "5px 9px" : "0",
        margin: design.style === "centered" ? "0 0 8px" : "0 9px 0 0",
        background: design.style === "badge" ? c.accent : "transparent",
        color: design.style === "badge" ? c.page : c.accent,
        "border-radius": "999px",
        "font-size": "12px",
        "font-weight": "900",
        "line-height": "1.4"
      })}">${marker}</span>`
    : "";

  if (design.style === "centered") {
    return `<section style="${toStyle({
      margin: `${density.gap + 14}px 0 ${density.gap}px`,
      "text-align": "center"
    })}">${markerHtml}<section style="${headingTextStyle(template, density)}">${text}</section>${renderDesignDivider(template, "center")}</section>`;
  }

  if (design.style === "underline") {
    return `<section style="${toStyle({
      margin: `${density.gap + 10}px 0 ${density.gap}px`,
      padding: "0 0 9px",
      borderBottom: `2px solid ${c.accent}`
    })}">${markerHtml}<span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  if (design.style === "boxed") {
    return `<section style="${toStyle({
      margin: `${density.gap + 8}px 0 ${density.gap}px`,
      padding: "12px 14px",
      background: c.panel,
      border: `1px solid ${c.line}`,
      "border-radius": `${density.radius}px`
    })}">${markerHtml}<span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  if (design.style === "badge") {
    return `<section style="${toStyle({
      margin: `${density.gap + 8}px 0 ${density.gap}px`
    })}">${markerHtml}<span style="${headingTextStyle(template, density)}">${text}</span></section>`;
  }

  return `<section style="${toStyle({
    margin: `${density.gap + 10}px 0 ${density.gap}px`,
    padding: "10px 12px",
    background: design.style === "bar" ? c.soft : "transparent",
    borderLeft: `5px solid ${c.accent}`,
    "border-radius": design.style === "bar" ? `${density.radius}px` : "0"
  })}">${markerHtml}<span style="${headingTextStyle(template, density)}">${text}</span></section>`;
}

function headingTextStyle(template, density) {
  return toStyle({
    color: template.colors.ink,
    "font-size": `${Math.round(density.paragraph + 3)}px`,
    "line-height": "1.42",
    "font-weight": "800"
  });
}

function renderDesignDivider(template, align = "left") {
  const style = template.design?.divider?.style || "line";
  const c = template.colors;
  if (style === "none") return "";
  if (style === "dots") {
    return `<section style="${toStyle({
      margin: "12px 0 0",
      color: c.accent,
      "font-size": "16px",
      "letter-spacing": "0",
      "text-align": align
    })}">•••</section>`;
  }
  if (style === "bar") {
    return `<section style="${toStyle({
      width: "46px",
      height: "5px",
      background: c.accent,
      "border-radius": "20px",
      margin: align === "center" ? "12px auto 0" : "12px 0 0"
    })}"></section>`;
  }
  return `<section style="${toStyle({
    height: "1px",
    background: c.line,
    margin: align === "center" ? "12px auto 0" : "12px 0 0",
    width: align === "center" ? "72px" : "100%"
  })}"></section>`;
}

function renderParagraph(text, template, density) {
  return `<p style="${toStyle({
    margin: `0 0 ${density.gap}px`,
    color: template.colors.ink,
    "font-size": `${density.paragraph}px`,
    "line-height": density.line,
    "text-align": "justify"
  })}">${inlineMarkdown(text, template)}</p>`;
}

function renderQuote(text, template, density) {
  if (template.design) return renderDesignedQuote(text, template, density);

  const c = template.colors;
  if (template.family === "human" || template.family === "brand") {
    return `<section style="${toStyle({
      margin: `${density.gap + 4}px 0 ${density.gap + 8}px`,
      padding: "18px 16px",
      background: c.soft,
      borderTop: `1px solid ${c.line}`,
      borderBottom: `1px solid ${c.line}`,
      "text-align": "center"
    })}"><p style="${toStyle({
      margin: "0",
      color: c.accent,
      "font-size": `${density.paragraph + 1}px`,
      "line-height": density.line,
      "font-weight": "700"
    })}">${inlineMarkdown(text, template)}</p></section>`;
  }
  return `<blockquote style="${toStyle({
    margin: `${density.gap}px 0 ${density.gap + 4}px`,
    padding: "14px 14px 14px 16px",
    background: c.soft,
    borderLeft: `4px solid ${c.accent}`,
    "border-radius": `${density.radius}px`
  })}"><p style="${toStyle({
    margin: "0",
    color: c.ink,
    "font-size": `${density.paragraph}px`,
    "line-height": density.line,
    "font-weight": "700"
  })}">${inlineMarkdown(text, template)}</p></blockquote>`;
}

function renderDesignedQuote(text, template, density) {
  const c = template.colors;
  const design = template.design.quote;
  const strong = design.emphasis === "strong";
  const baseText = {
    margin: "0",
    color: strong ? c.accent : c.ink,
    "font-size": `${density.paragraph + (strong ? 1 : 0)}px`,
    "line-height": density.line,
    "font-weight": strong ? "800" : "700"
  };

  if (design.style === "centered") {
    return `<section style="${toStyle({
      margin: `${density.gap + 4}px 0 ${density.gap + 8}px`,
      padding: "18px 16px",
      background: c.soft,
      borderTop: `1px solid ${c.line}`,
      borderBottom: `1px solid ${c.line}`,
      "text-align": "center"
    })}"><p style="${toStyle(baseText)}">${inlineMarkdown(text, template)}</p></section>`;
  }

  if (design.style === "speech") {
    return `<section style="${toStyle({
      margin: `${density.gap}px 0 ${density.gap + 6}px`,
      padding: "16px",
      background: c.panel,
      border: `1px solid ${c.line}`,
      "border-radius": `${density.radius + 8}px ${density.radius + 8}px ${density.radius + 8}px 2px`
    })}"><p style="${toStyle(baseText)}">${inlineMarkdown(text, template)}</p></section>`;
  }

  if (design.style === "highlight") {
    return `<section style="${toStyle({
      margin: `${density.gap}px 0 ${density.gap + 6}px`,
      padding: "15px 16px",
      background: c.accent,
      color: c.page,
      "border-radius": `${density.radius}px`
    })}"><p style="${toStyle({
      ...baseText,
      color: c.page
    })}">${inlineMarkdown(text, template)}</p></section>`;
  }

  if (design.style === "card") {
    return `<section style="${toStyle({
      margin: `${density.gap}px 0 ${density.gap + 6}px`,
      padding: "16px",
      background: c.panel,
      border: `1px solid ${c.line}`,
      "border-radius": `${density.radius}px`
    })}"><p style="${toStyle(baseText)}">${inlineMarkdown(text, template)}</p></section>`;
  }

  return `<blockquote style="${toStyle({
    margin: `${density.gap}px 0 ${density.gap + 6}px`,
    padding: "14px 14px 14px 16px",
    background: c.soft,
    borderLeft: `5px solid ${c.accent}`,
    "border-radius": `${density.radius}px`
  })}"><p style="${toStyle(baseText)}">${inlineMarkdown(text, template)}</p></blockquote>`;
}

function renderList(block, template, density) {
  if (template.design) return renderDesignedList(block, template, density);

  const c = template.colors;
  const tag = block.ordered ? "ol" : "ul";
  const items = block.items
    .map(
      (item) =>
        `<li style="${toStyle({
          margin: `0 0 ${Math.max(8, density.gap - 5)}px`,
          paddingLeft: "2px",
          color: c.ink,
          "font-size": `${density.paragraph}px`,
          "line-height": density.line
        })}">${inlineMarkdown(item, template)}</li>`
    )
    .join("");
  return `<section style="${toStyle({
    margin: `0 0 ${density.gap + 4}px`,
    padding: "14px 16px",
    background: c.panel,
    border: `1px solid ${c.line}`,
    "border-radius": `${density.radius}px`
  })}"><${tag} style="${toStyle({
    margin: "0",
    paddingLeft: "20px"
  })}">${items}</${tag}></section>`;
}

function renderDesignedList(block, template, density) {
  const c = template.colors;
  const design = template.design.list;
  const items = block.items
    .map((item, index) => {
      const marker = getDesignedListMarker(design.marker, index);
      return `<section style="${toStyle({
        display: "block",
        margin: `0 0 ${Math.max(8, density.gap - 6)}px`,
        padding: design.style === "plain" ? "0" : "10px 11px",
        background: design.style === "plain" ? "transparent" : c.page,
        border: design.style === "plain" ? "0" : `1px solid ${c.line}`,
        "border-left": design.style === "timeline" ? `4px solid ${c.accent}` : undefined,
        "border-radius": design.style === "plain" ? "0" : `${density.radius}px`
      })}"><span style="${toStyle({
        display: "inline-block",
        width: "24px",
        color: c.accent,
        "font-weight": "900",
        "font-size": "13px"
      })}">${marker}</span><span style="${toStyle({
        color: c.ink,
        "font-size": `${density.paragraph}px`,
        "line-height": density.line
      })}">${inlineMarkdown(item, template)}</span></section>`;
    })
    .join("");
  return `<section style="${toStyle({
    margin: `0 0 ${density.gap + 4}px`,
    padding: design.style === "plain" ? "0" : "12px",
    background: design.style === "card" || design.style === "checklist" ? c.panel : "transparent",
    border: design.style === "card" || design.style === "checklist" ? `1px solid ${c.line}` : "0",
    "border-radius": `${density.radius}px`
  })}">${items}</section>`;
}

function getDesignedListMarker(marker, index) {
  if (marker === "number") return String(index + 1).padStart(2, "0");
  if (marker === "check") return "✓";
  if (marker === "dash") return "—";
  return "•";
}

function parseImageOptions(raw) {
  return String(raw || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((result, part) => {
      const [key, ...rest] = part.split("=");
      if (!key || !rest.length) return result;
      result[key.trim()] = rest.join("=").trim();
      return result;
    }, {});
}

function sanitizeImageOptions(options) {
  const width = clamp(Math.round(Number(options.width) || 100), 40, 100);
  const style = ["clean", "framed", "card", "poster"].includes(options.style) ? options.style : "clean";
  const caption = String(options.caption || "").slice(0, 80);
  return { width, style, caption };
}

function renderImage(block, template, density) {
  const src = safeUrl(block.src);
  const alt = escapeHtml(block.alt || "图片");
  const imageOptions = sanitizeImageOptions(block.options || {});
  const designImage = template.design?.image;
  const effectiveStyle = block.options?.style ? imageOptions.style : designImage?.style || imageOptions.style;
  const effectiveWidth = block.options?.width ? imageOptions.width : designImage?.defaultWidth || imageOptions.width;
  const width = `${effectiveWidth}%`;
  const caption = escapeHtml(imageOptions.caption || block.options?.caption || "");
  const c = template.colors;
  if (!src) {
    return `<p style="${toStyle({
      margin: `0 0 ${density.gap}px`,
      color: template.colors.muted,
      "font-size": "13px"
    })}">图片地址无效：${alt}</p>`;
  }

  const frameStyle = {
    display: "inline-block",
    width,
    "max-width": "100%",
    "box-sizing": "border-box",
    "text-align": "center"
  };

  if (effectiveStyle === "framed") {
    Object.assign(frameStyle, {
      padding: "4px",
      background: c.page,
      border: `1px solid ${c.line}`,
      "border-radius": `${density.radius + 2}px`
    });
  }

  if (effectiveStyle === "card") {
    Object.assign(frameStyle, {
      padding: "10px",
      background: c.panel,
      border: `1px solid ${c.line}`,
      "border-radius": `${density.radius + 4}px`
    });
  }

  if (effectiveStyle === "poster") {
    Object.assign(frameStyle, {
      padding: "8px 0 10px",
      borderTop: `4px solid ${c.accent}`,
      borderBottom: `1px solid ${c.line}`
    });
  }

  return `<section style="${toStyle({
    margin: `${density.gap}px 0 ${density.gap + 6}px`
  })}"><section style="${toStyle(frameStyle)}"><img src="${src}" alt="${alt}" style="${toStyle({
    display: "block",
    width: "100%",
    "max-width": "100%",
    height: "auto",
    margin: "0 auto",
    "border-radius": `${density.radius}px`
  })}" />${caption ? `<p style="${toStyle({
    margin: "8px 0 0",
    color: c.muted,
    "font-size": "12px",
    "line-height": "1.55"
  })}">${caption}</p>` : ""}</section></section>`;
}

function renderCode(text, template, density) {
  const c = template.colors;
  return `<pre style="${toStyle({
    margin: `${density.gap}px 0 ${density.gap + 4}px`,
    padding: "14px",
    overflowX: "auto",
    background: template.family === "tech" ? c.panel : "#1f2937",
    color: "#f8fafc",
    "border-radius": `${density.radius}px`,
    "font-size": "13px",
    "line-height": "1.65",
    "font-family": "Consolas, 'SFMono-Regular', monospace"
  })}"><code>${escapeHtml(text)}</code></pre>`;
}

function renderTable(rows, template, density) {
  if (!rows.length) return "";
  const c = template.colors;
  const body = rows
    .map((row, rowIndex) => {
      const cells = row
        .map(
          (cell) =>
            `<td style="${toStyle({
              padding: "10px 8px",
              border: `1px solid ${c.line}`,
              background: rowIndex === 0 ? c.soft : c.page,
              color: c.ink,
              "font-size": `${Math.max(13, density.paragraph - 1)}px`,
              "line-height": "1.5",
              "font-weight": rowIndex === 0 ? "800" : "400"
            })}">${inlineMarkdown(cell, template)}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<section style="${toStyle({
    margin: `${density.gap}px 0 ${density.gap + 4}px`,
    overflowX: "auto"
  })}"><table style="${toStyle({
    width: "100%",
    borderCollapse: "collapse"
  })}">${body}</table></section>`;
}

function renderFooter(template, analysis, density) {
  const c = template.colors;
  const notes = [
    `模板：${template.name}`,
    `类型：${analysis.typeLabel}`,
    `阅读：约 ${analysis.readingMinutes} 分钟`
  ];
  return `<section style="${toStyle({
    margin: `${density.gap + 18}px 0 0`,
    padding: "16px 0 0",
    borderTop: `1px solid ${c.line}`,
    color: c.muted,
    "font-size": "12px",
    "line-height": "1.7",
    "text-align": "center"
  })}">${notes.map((item) => `<span>${escapeHtml(item)}</span>`).join(`<span style="${toStyle({
    color: c.line,
    margin: "0 8px"
  })}">|</span>`)}</section>`;
}

function inlineMarkdown(text, template) {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const safe = safeUrl(url);
    return safe ? `<img src="${safe}" alt="${escapeHtml(alt)}" style="max-width:100%;height:auto;" />` : "";
  });
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_match, label, url) => {
    const safe = safeUrl(url);
    return `<a href="${safe}" style="${toStyle({
      color: template.colors.accent,
      "text-decoration": "none",
      "border-bottom": `1px solid ${template.colors.accent}`
    })}">${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong style="${toStyle({
    color: template.colors.accent,
    "font-weight": "800"
  })}">$1</strong>`);
  html = html.replace(/`([^`]+)`/g, `<code style="${toStyle({
    padding: "2px 5px",
    background: template.colors.soft,
    color: template.colors.accent,
    "border-radius": "4px",
    "font-family": "Consolas, 'SFMono-Regular', monospace",
    "font-size": "0.92em"
  })}">$1</code>`);
  html = html.replace(/\*([^*\n]+)\*/g, `<em style="font-style:normal;color:${template.colors.accent2};">$1</em>`);
  return html;
}

function createGeneratedTemplate(analysis, persistent) {
  const paletteByType = {
    research: ["#ffffff", "#eef6ff", "#172033", "#637083", "#2563eb", "#0f766e", "#dbeafe", "#bfdbfe"],
    business: ["#fffdf7", "#f4f0e7", "#252a2e", "#6b7280", "#a16207", "#1d4ed8", "#fef3c7", "#e7d7b2"],
    tech: ["#f8fffc", "#10231f", "#17211c", "#64756d", "#059669", "#7c3aed", "#dff8ec", "#bae6d2"],
    education: ["#fcfdff", "#eef2ff", "#20263a", "#64708a", "#4f46e5", "#0f766e", "#e0e7ff", "#c7d2fe"],
    event: ["#ffffff", "#fff0ed", "#2b2f33", "#6f767c", "#e11d48", "#0891b2", "#ffe4e0", "#ffc5bd"],
    story: ["#fffaf4", "#f6eee5", "#2d2421", "#7c6f68", "#9f1239", "#0f766e", "#fde7ee", "#ead7cb"],
    brand: ["#fffafb", "#f9ecef", "#30272d", "#756b72", "#be185d", "#4d7c0f", "#fce7f0", "#f3c9d8"],
    data: ["#f8fcff", "#e8f7fb", "#1d2730", "#607180", "#0e7490", "#a21caf", "#dff6fb", "#b9e5ef"],
    general: ["#ffffff", "#f3f7f5", "#1f2a25", "#68756f", "#0f766e", "#7c3aed", "#d8f1eb", "#c7ded8"]
  };
  const selected = paletteByType[analysis.type] || paletteByType.general;
  const family =
    analysis.type === "research" || analysis.type === "analysis"
      ? "insight"
      : analysis.type === "general"
        ? "insight"
        : analysis.type;
  const id = `${persistent ? "custom" : "generated"}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  return {
    schemaVersion: 2,
    id,
    source: persistent ? "generated" : "transient",
    name: `${analysis.typeLabel}自生成模板`,
    family: DEFAULT_TEMPLATES.some((item) => item.family === family) ? family : "insight",
    description: `根据当前文章的「${analysis.typeLabel}」气质自动生成。`,
    tags: [analysis.type, ...analysis.secondaryTypes, "general"],
    colors: {
      page: selected[0],
      panel: selected[1],
      ink: selected[2],
      muted: selected[3],
      accent: selected[4],
      accent2: selected[5],
      soft: selected[6],
      line: selected[7]
    },
    rhythm: {
      paragraph: analysis.isLong ? 17 : 16,
      line: analysis.isLong ? 1.94 : 1.84,
      gap: analysis.isLong ? 18 : 16,
      radius: analysis.type === "event" ? 12 : 9
    },
    design: defaultDesignForFamily(
      DEFAULT_TEMPLATES.some((item) => item.family === family) ? family : "insight"
    )
  };
}

async function learnTemplateFromReference() {
  const source = els.reference.value.trim();
  if (!source) {
    els.learnSummary.textContent = "请先粘贴富文本、输入 URL、上传文件或手动粘贴 HTML。";
    return;
  }

  if (!aiStatus.aiEnabled) {
    els.learnSummary.textContent = "访问AI大模型失败，请检查配置或网络。模板学习需要 AI，已停止本地伪学习。";
    return;
  }

  let template;
  els.learnSummary.textContent = `AI 正在学习参考文章模板，使用模型 ${aiStatus.model}。`;
  els.learnTemplate.disabled = true;
  try {
    const learned = await requestAiLearnTemplate(source, els.referenceName.value.trim());
    template = normalizeAiTemplate(learned.template, analyzeArticle(els.referenceName.value, source));
    template = {
      ...template,
      id: learned.template.id,
      source: "ai-learned",
      name: learned.template.name || template.name,
      description: learned.summary?.visualDNA || template.description,
      aiSummary: learned.summary || null,
      aiEndpoint: learned.endpoint || "",
      aiModel: learned.model || aiStatus.model
    };
    const rules = learned.summary?.layoutRules?.slice(0, 2).join("；") || "已总结参考文章视觉系统。";
    els.learnSummary.textContent = `AI 已学习「${template.name}」：${rules}｜模型 ${template.aiModel || "未知"}｜接口 ${template.aiEndpoint || "未知"}`;
  } catch (error) {
    els.learnSummary.textContent = `访问AI大模型失败，请检查配置或网络。错误：${error.message}`;
    return;
  } finally {
    els.learnTemplate.disabled = false;
  }

  userTemplates = [template, ...userTemplates];
  saveUserTemplates(userTemplates);
  rebuildTemplates();
  selectedTemplateId = template.id;
  els.mode.value = "manual";
  renderTemplateGallery();
  renderFromInput({ useAi: false });
}

function handleReferenceFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.reference.value = String(reader.result || "");
    els.referencePasteBox.innerHTML = "";
    if (!els.referenceName.value.trim()) {
      els.referenceName.value = file.name.replace(/\.[^.]+$/, "");
    }
    els.learnSummary.textContent = `已读取 ${file.name}，可以点击「学习为模板」。`;
  };
  reader.readAsText(file, "utf-8");
}

function handleReferenceRichPaste(event) {
  event.preventDefault();
  const html = event.clipboardData?.getData("text/html") || "";
  const plain = event.clipboardData?.getData("text/plain") || "";
  const content = html || plainToHtml(plain);

  if (!content.trim()) return;

  document.execCommand("insertHTML", false, sanitizeReferenceHtml(content));
  window.setTimeout(syncReferencePasteBox, 0);
}

function syncReferencePasteBox() {
  const html = sanitizeReferenceHtml(els.referencePasteBox.innerHTML || "");
  els.reference.value = html;
  if (!els.referenceName.value.trim()) {
    const heading = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    const text = stripTags(heading?.[1] || els.referencePasteBox.textContent || "").trim();
    if (text) els.referenceName.value = text.slice(0, 24);
  }
  els.learnSummary.textContent = html
    ? "已接收富文本并转换为 HTML，点击「学习为模板」会调用 AI 学习。"
    : "";
}

function sanitizeReferenceHtml(html) {
  return String(html || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form>/gi, "")
    .replace(/\s(on[a-z]+)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();
}

function plainToHtml(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function stripTags(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

async function fetchReferenceFromUrl() {
  const url = els.referenceUrl.value.trim();
  if (!url) {
    els.learnSummary.textContent = "请先输入参考文章 URL。";
    return;
  }

  if (!aiStatus.aiEnabled) {
    els.learnSummary.textContent = "访问AI大模型失败，请检查配置或网络。URL 只能负责抓取页面，模板学习需要 AI。";
    return;
  }

  els.fetchReference.disabled = true;
  els.learnSummary.textContent = "正在抓取参考文章 URL。";
  try {
    const fetched = await requestReferenceUrl(url);
    els.reference.value = fetched.source || "";
    els.referencePasteBox.innerHTML = sanitizeReferenceHtml(fetched.source || "");
    if (!els.referenceName.value.trim()) {
      els.referenceName.value = fetched.title || new URL(fetched.url || url).hostname;
    }
    const distilledNote = fetched.distilled
      ? `，已压缩为 ${formatBytes(fetched.distilledBytes)} 的排版片段`
      : "";
    const diagnostics = fetched.diagnostics || {};
    const modeNote = diagnostics.extractionMode
      ? `｜提取区域 ${diagnostics.extractionMode}｜正文约 ${diagnostics.textChars || 0} 字｜样式 ${diagnostics.styleAttrCount || 0} 处`
      : "";
    els.learnSummary.textContent = `已抓取 ${formatBytes(fetched.bytes)}${distilledNote}${modeNote}，开始学习模板。`;
    await learnTemplateFromReference();
  } catch (error) {
    els.learnSummary.textContent = `URL 抓取失败：${error.message}`;
  } finally {
    els.fetchReference.disabled = false;
  }
}

async function handleArticleImages(event) {
  const files = [...(event.target.files || [])].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  els.imageSummary.textContent = `正在处理 ${files.length} 张图片。`;
  const snippets = [];

  for (const file of files) {
    const dataUrl = await imageFileToDataUrl(file);
    const baseCaption = els.imageCaption.value.trim() || file.name.replace(/\.[^.]+$/, "");
    const asset = await saveImageAsset({
      name: baseCaption,
      dataUrl,
      type: file.type,
      size: file.size
    });
    snippets.push(buildImageMarkdown(assetUri(asset.id), baseCaption));
  }

  insertTextAtCursor(els.content, `\n\n${snippets.join("\n\n")}\n\n`);
  els.articleImage.value = "";
  renderImageLibrary();
  els.imageSummary.textContent = `已插入 ${files.length} 张图片短引用。图片已保存在本地素材库，正式发布前建议替换为微信素材库图片地址。`;
  renderFromInput({ useAi: false });
}

function insertImageUrlBlock() {
  const url = window.prompt("输入图片 URL（建议使用微信素材库图片地址）");
  if (!url) return;
  const caption = els.imageCaption.value.trim() || "图片";
  insertTextAtCursor(els.content, `\n\n${buildImageMarkdown(url.trim(), caption)}\n\n`);
  els.imageSummary.textContent = "已插入图片 URL。";
  renderFromInput({ useAi: false });
}

function buildImageMarkdown(src, caption) {
  const safeCaption = sanitizeImageText(caption);
  const meta = [
    `width=${els.imageWidth.value}`,
    `style=${els.imageStyle.value}`,
    safeCaption ? `caption=${safeCaption}` : ""
  ]
    .filter(Boolean)
    .join(";");
  return `![${safeCaption || "图片"}](${src}){${meta}}`;
}

async function compactInlineBase64Images() {
  const content = els.content.value;
  const regex = /!\[([^\]]*)\]\((data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)(\{[^}]*\})?/gi;
  const matches = [...content.matchAll(regex)];

  if (!matches.length) {
    els.imageSummary.textContent = "正文里没有发现 Markdown base64 图片。";
    return;
  }

  els.compactImages.disabled = true;
  els.imageSummary.textContent = `正在收纳 ${matches.length} 张 base64 图片。`;

  try {
    let rebuilt = "";
    let cursor = 0;
    let count = 0;

    for (const match of matches) {
      const [full, alt, dataUrl, meta = ""] = match;
      const index = match.index ?? 0;
      rebuilt += content.slice(cursor, index);
      const name = sanitizeImageText(alt) || `图片 ${count + 1}`;
      const asset = await saveImageAsset({
        name,
        dataUrl,
        type: inferImageType(dataUrl),
        size: Math.round(dataUrl.length * 0.75)
      });
      rebuilt += `![${name}](${assetUri(asset.id)})${meta}`;
      cursor = index + full.length;
      count += 1;
    }

    rebuilt += content.slice(cursor);
    els.content.value = rebuilt;
    renderImageLibrary();
    els.imageSummary.textContent = `已收纳 ${count} 张图片，正文里的 base64 已替换为短引用。`;
    renderFromInput({ useAi: false });
  } finally {
    els.compactImages.disabled = false;
  }
}

function sanitizeImageText(value) {
  return String(value || "")
    .replace(/[\]\{\};\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

function imageFileToDataUrl(file) {
  if (file.type === "image/gif") {
    return readFileAsDataUrl(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.88));
      };
      img.onerror = () => resolve(String(reader.result || ""));
      img.src = String(reader.result || "");
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function assetUri(id) {
  return `${IMAGE_ASSET_URI_PREFIX}${id}`;
}

function imageAssetIdFromUri(value) {
  const raw = String(value || "").trim();
  return raw.startsWith(IMAGE_ASSET_URI_PREFIX) ? raw.slice(IMAGE_ASSET_URI_PREFIX.length) : "";
}

function resolveImageAssetUrl(value) {
  const id = imageAssetIdFromUri(value);
  if (!id) return "";
  return imageAssets.get(id)?.dataUrl || "";
}

function inferImageType(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-z0-9.+-]+);base64,/i);
  return match ? match[1] : "image/png";
}

async function saveImageAsset(input) {
  const asset = {
    id: `img_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    name: sanitizeImageText(input.name) || "图片",
    dataUrl: input.dataUrl,
    type: input.type || inferImageType(input.dataUrl),
    size: Number(input.size || 0),
    createdAt: Date.now()
  };
  imageAssets.set(asset.id, asset);
  await putImageAsset(asset);
  return asset;
}

async function loadImageAssets() {
  try {
    const db = await openImageDb();
    const assets = await new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readonly");
      const request = tx.objectStore(IMAGE_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    imageAssets = new Map(assets.filter((asset) => asset?.id && asset?.dataUrl).map((asset) => [asset.id, asset]));
  } catch (_error) {
    imageAssets = new Map();
  }
}

function openImageDb() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is not available."));
  if (imageDbPromise) return imageDbPromise;

  imageDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return imageDbPromise;
}

async function putImageAsset(asset) {
  try {
    const db = await openImageDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
      tx.objectStore(IMAGE_STORE_NAME).put(asset);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (_error) {
    // Keep the image in memory for the current session when IndexedDB is unavailable.
  }
}

async function removeImageAsset(id) {
  imageAssets.delete(id);
  try {
    const db = await openImageDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
      tx.objectStore(IMAGE_STORE_NAME).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (_error) {
    // In-memory deletion already happened.
  }
}

function renderImageLibrary() {
  if (!els.imageLibrary) return;
  const assets = [...imageAssets.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);

  if (!assets.length) {
    els.imageLibrary.innerHTML = "";
    return;
  }

  els.imageLibrary.innerHTML = assets
    .map(
      (asset) => `<div class="image-asset" data-image-id="${asset.id}">
        <img src="${asset.dataUrl}" alt="${escapeHtml(asset.name)}" />
        <span>${escapeHtml(asset.name)}</span>
        <button class="ghost-btn insert-asset-btn" type="button" data-image-id="${asset.id}">插入</button>
        <button class="ghost-btn delete-asset-btn" type="button" data-image-id="${asset.id}">删除</button>
      </div>`
    )
    .join("");

  els.imageLibrary.querySelectorAll(".insert-asset-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const asset = imageAssets.get(button.dataset.imageId);
      if (!asset) return;
      insertTextAtCursor(els.content, `\n\n${buildImageMarkdown(assetUri(asset.id), asset.name)}\n\n`);
      renderFromInput({ useAi: false });
    });
  });

  els.imageLibrary.querySelectorAll(".delete-asset-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.imageId;
      await removeImageAsset(id);
      renderImageLibrary();
      renderFromInput({ useAi: false });
    });
  });
}

function renderTemplateGallery(activeId) {
  const visibleTemplates = getVisibleTemplates();
  els.templateCountBadge.textContent = `${visibleTemplates.length}/${templates.length} 套模板`;
  els.templateGallery.innerHTML = visibleTemplates.length
    ? visibleTemplates
    .map((template) => {
      const active = template.id === (activeId || selectedTemplateId);
      const deletable = isTemplateDeletable(template);
      const swatches = [template.colors.accent, template.colors.accent2, template.colors.soft, template.colors.ink]
        .map((color) => `<span class="swatch" style="background:${color}"></span>`)
        .join("");
      const summary = template.aiSummary?.layoutRules?.slice(0, 2).join(" / ");
      return `<article class="template-card ${active ? "active" : ""}" data-template-id="${template.id}">
        <span class="swatches">${swatches}</span>
        <strong>${escapeHtml(template.name)}</strong>
        <p>${escapeHtml(template.description)}</p>
        ${summary ? `<p class="template-ai-summary">${escapeHtml(summary)}</p>` : ""}
        <div class="template-card-actions">
          <button class="ghost-btn select-template-btn" type="button" data-template-id="${template.id}">使用</button>
          ${deletable ? `<button class="ghost-btn delete-template-btn" type="button" data-template-id="${template.id}">删除</button>` : `<span class="template-lock">内置</span>`}
        </div>
      </article>`;
    })
    .join("")
    : `<div class="empty-state">没有匹配的模板。</div>`;

  els.templateGallery.querySelectorAll(".select-template-btn").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTemplateId = button.dataset.templateId;
      els.mode.value = "manual";
      renderTemplateGallery(selectedTemplateId);
      renderFromInput({ useAi: false });
    });
  });
  els.templateGallery.querySelectorAll(".delete-template-btn").forEach((button) => {
    button.addEventListener("click", () => deleteTemplate(button.dataset.templateId));
  });
}

function getVisibleTemplates() {
  return templates.filter((template) => {
    const query = templateFilters.query;
    const familyOk = templateFilters.family === "all" || template.family === templateFilters.family;
    const sourceOk =
      templateFilters.source === "all" ||
      (templateFilters.source === "default" && template.source === "default") ||
      (templateFilters.source === "ai" && ["ai", "transient"].includes(template.source)) ||
      (templateFilters.source === "custom" && template.source !== "default" && !["ai", "transient"].includes(template.source));
    const haystack = [
      template.name,
      template.description,
      template.family,
      template.source,
      ...(template.tags || [])
    ]
      .join(" ")
      .toLowerCase();
    return familyOk && sourceOk && (!query || haystack.includes(query));
  });
}

function isTemplateDeletable(template) {
  return template && template.source !== "default";
}

function deleteTemplate(templateId) {
  const template = templates.find((item) => item.id === templateId);
  if (!template || !isTemplateDeletable(template)) return;
  const ok = window.confirm(`删除模板「${template.name}」？`);
  if (!ok) return;

  userTemplates = userTemplates.filter((item) => item.id !== templateId);
  runtimeTemplates = runtimeTemplates.filter((item) => item.id !== templateId);
  saveUserTemplates(userTemplates);
  rebuildTemplates();

  if (selectedTemplateId === templateId) {
    selectedTemplateId = "auto";
    els.mode.value = "auto";
  }

  renderTemplateGallery();
  renderFromInput({ useAi: false });
}

function renderAnalysis(analysis, template, aiPlan) {
  const scoreText = Object.entries(analysis.scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, score]) => `${type}:${score}`)
    .join(" / ");

  const cards = [
    [
      "内容类型",
      analysis.typeLabel,
      aiPlan ? analysis.aiRationale || "AI 已完成内容定位。" : `次级信号：${analysis.secondaryTypes.join("、") || "不明显"}`
    ],
    ["语气判断", analysis.tone, aiPlan ? analysis.aiReadingPath || analysis.structureNeed : analysis.structureNeed],
    ["模板选择", template.name, aiPlan ? analysis.aiDecisionReason || template.description : template.description],
    [
      aiPlan ? "AI 建议" : "结构指标",
      aiPlan ? (analysis.aiAudience || "面向公众号移动端读者") : `${analysis.paragraphCount} 段 / ${analysis.headingCount} 标题`,
      aiPlan ? (analysis.aiSuggestions || []).slice(0, 2).join("；") || "模板已转交本地渲染器输出。" : scoreText || "关键词较少，采用通用判断"
    ]
  ];
  els.analysisCards.innerHTML = cards
    .map(
      ([label, value, desc]) =>
        `<div class="analysis-card"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span><p>${escapeHtml(desc)}</p></div>`
    )
    .join("");
}

function renderNativeAnalysis(analysis, nativeLayout) {
  const summary = nativeLayout.designSummary || {};
  const rules = Array.isArray(summary.layoutRules) ? summary.layoutRules.slice(0, 2).join("；") : "";
  const cards = [
    ["内容类型", analysis.typeLabel, analysis.tone || "AI 已完成内容定位。"],
    ["原生设计", summary.styleName || "AI 原生创意排版", summary.visualDNA || "模型直接生成完整富媒体 HTML。"],
    ["配色判断", summary.colorRationale || "由 AI 根据正文气质自由选择配色。", rules || "版式不受本地模板枚举限制。"],
    [
      "交付方式",
      "可复制富文本",
      (nativeLayout.warnings || []).slice(0, 2).join("；") || "已通过本地清洗与微信兼容检查。"
    ]
  ];
  els.analysisCards.innerHTML = cards
    .map(
      ([label, value, desc]) =>
        `<div class="analysis-card"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span><p>${escapeHtml(desc)}</p></div>`
    )
    .join("");
}

function renderAnalysisPlaceholder() {
  els.analysisCards.innerHTML = [
    ["内容类型", "等待分析", "输入标题和正文后自动判断文章气质。"],
    ["模板选择", "自动匹配", "从模板库或新生成模板中选择完整版式。"],
    ["复制方式", "富文本 HTML", "复制后粘贴到公众号后台图文编辑器。"],
    ["学习能力", "可上传参考", "抽取颜色、间距、标题和强调风格。"]
  ]
    .map(
      ([label, value, desc]) =>
        `<div class="analysis-card"><strong>${label}</strong><span>${value}</span><p>${desc}</p></div>`
    )
    .join("");
}

function renderCompatReport(html) {
  if (!html) {
    els.compatReport.innerHTML = "";
    return;
  }
  const checks = [];
  checks.push({
    ok: !/<style|<script|<iframe|<form|<input/i.test(html),
    text: "未使用 style/script/iframe/form/input 等公众号高风险标签。"
  });
  checks.push({
    ok: !/position\s*:|@media|@keyframes|onclick\s*=|onerror\s*=/i.test(html),
    text: "未使用定位、媒体查询、动画或事件脚本。"
  });
  checks.push({
    ok: /style="/i.test(html) && !/<link/i.test(html),
    text: "样式已内联到元素，适合复制到微信编辑器。"
  });
  checks.push({
    ok: html.length < 20000,
    text: `HTML 长度 ${html.length.toLocaleString()} 字符，接口草稿场景建议少于 20,000 字符。`
  });
  checks.push({
    ok: !/<img[^>]+src=["']data:/i.test(html),
    text: "未使用 base64 图片；外链图片建议先上传到公众号素材库。"
  });

  els.compatReport.innerHTML = checks
    .map(
      (check) =>
        `<div class="compat-item ${check.ok ? "ok" : "warn"}">${check.ok ? "通过" : "注意"}：${escapeHtml(check.text)}</div>`
    )
    .join("");
}

async function copyRichText() {
  if (!lastHtml) await renderFromInput({ useAi: false });
  if (!lastHtml) return;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([lastHtml], { type: "text/html" }),
          "text/plain": new Blob([lastPlainText], { type: "text/plain" })
        })
      ]);
      els.statusLine.textContent = "已复制富文本。打开公众号后台图文编辑器，直接粘贴即可。";
      return;
    }
  } catch (_error) {
    // Fall through to selection copy. Some browsers block ClipboardItem on file URLs.
  }

  const range = document.createRange();
  range.selectNodeContents(els.canvas);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  const ok = document.execCommand("copy");
  selection.removeAllRanges();
  els.statusLine.textContent = ok
    ? "已复制预览区富文本。打开公众号后台图文编辑器，直接粘贴即可。"
    : "浏览器拦截了复制，请手动选中预览区复制。";
}

async function copyHtml() {
  if (!lastHtml) await renderFromInput({ useAi: false });
  if (!lastHtml) return;
  try {
    await navigator.clipboard.writeText(lastHtml);
    els.statusLine.textContent = "已复制 HTML 源码。";
  } catch (_error) {
    els.htmlOutput.focus();
    els.htmlOutput.select();
    document.execCommand("copy");
    els.statusLine.textContent = "已复制 HTML 源码。";
  }
}

function docToPlainText(doc) {
  const lines = [doc.title, ""];
  doc.blocks.forEach((block) => {
    if (block.type === "heading") lines.push(block.text);
    if (block.type === "paragraph" || block.type === "quote" || block.type === "code") lines.push(block.text);
    if (block.type === "list") block.items.forEach((item) => lines.push(`- ${item}`));
    if (block.type === "image") lines.push(block.alt || block.src);
    if (block.type === "table") block.rows.forEach((row) => lines.push(row.join("\t")));
    lines.push("");
  });
  return lines.join("\n").trim();
}

function stripInlineImageData(content) {
  return String(content || "")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, "[本地上传图片 data URL 已省略]")
    .replace(/wechatpostgpt:image:[a-zA-Z0-9_-]+/g, "[本地图片素材引用]");
}

function stripNativeAiContent(content) {
  return String(content || "").replace(
    /data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi,
    "[图片 data URL 已省略，请保留图片位置]"
  );
}

function hydrateNativeImageSources(html) {
  return String(html || "").replace(/\ssrc=(["'])(wechatpostgpt:image:[a-zA-Z0-9_-]+)\1/gi, (_match, quote, src) => {
    const resolved = resolveImageAssetUrl(src);
    return ` src=${quote}${resolved || src}${quote}`;
  });
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function loadUserTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTemplateLike).map(upgradeTemplateSchema) : [];
  } catch (_error) {
    return [];
  }
}

function loadAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      baseUrl: normalizeBaseUrl(parsed.baseUrl || ""),
      apiKey: String(parsed.apiKey || ""),
      model: String(parsed.model || ""),
      models: Array.isArray(parsed.models) ? parsed.models.map(String) : []
    };
  } catch (_error) {
    return {};
  }
}

function saveAiConfig(config) {
  localStorage.setItem(
    AI_CONFIG_KEY,
    JSON.stringify({
      baseUrl: normalizeBaseUrl(config.baseUrl || ""),
      apiKey: config.apiKey || "",
      model: config.model || "",
      models: Array.isArray(config.models) ? config.models : []
    })
  );
}

function saveUserTemplates(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter(isTemplateLike).map(upgradeTemplateSchema).slice(0, 200)));
}

function isTemplateLike(template) {
  return Boolean(template && template.id && template.name && template.colors && template.rhythm);
}

function upgradeTemplateSchema(template) {
  const family = isKnownFamily(template?.family) ? template.family : "insight";
  return {
    ...template,
    schemaVersion: 2,
    family,
    design: normalizeTemplateDesign(template?.design, family)
  };
}

function toStyle(styles) {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${toKebab(key)}:${String(value).replace(/"/g, "'")}`)
    .join(";");
}

function toKebab(key) {
  return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(value) {
  const url = String(value || "").trim().replace(/"/g, "%22");
  if (url.startsWith(IMAGE_ASSET_URI_PREFIX)) return resolveImageAssetUrl(url);
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(url)) return url;
  return "";
}

function normalizeHex(value) {
  let hex = value.toLowerCase();
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (hex.length === 9) hex = hex.slice(0, 7);
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : "";
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) return [0, 0, 0];
  return [1, 3, 5].map((start) => parseInt(normalized.slice(start, start + 2), 16));
}

function mix(color, target, amount) {
  const a = hexToRgb(color);
  const b = hexToRgb(target);
  const mixed = a.map((channel, index) => Math.round(channel * (1 - amount) + b[index] * amount));
  return `#${mixed.map((num) => num.toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
