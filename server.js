const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 5173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const OPENAI_BASE_URL = normalizeBaseUrl(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1");
const MAX_BODY_BYTES = 2_100_000;
const MAX_RAW_FETCH_BYTES = 12_000_000;
const MAX_DISTILLED_REFERENCE_BYTES = 420_000;
const MAX_AI_REFERENCE_BYTES = 55_000;
const FETCH_TIMEOUT_MS = 12_000;
const AI_REQUEST_TIMEOUT_MS = 180_000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const LAYOUT_SCHEMA = {
  type: "object",
  properties: {
    analysis: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["research", "business", "tech", "education", "event", "story", "brand", "data", "general"]
        },
        typeLabel: { type: "string" },
        tone: { type: "string" },
        audience: { type: "string" },
        readingPath: { type: "string" },
        rationale: { type: "string" }
      },
      required: ["type", "typeLabel", "tone", "audience", "readingPath", "rationale"],
      additionalProperties: false
    },
    decision: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["use_existing", "generate_new"] },
        selectedTemplateId: { type: "string" },
        density: { type: "string", enum: ["compact", "balanced", "relaxed"] },
        reason: { type: "string" }
      },
      required: ["mode", "selectedTemplateId", "density", "reason"],
      additionalProperties: false
    },
    template: {
      type: "object",
      properties: {
        schemaVersion: { type: "integer", enum: [2] },
        id: { type: "string" },
        name: { type: "string" },
        family: {
          type: "string",
          enum: ["insight", "business", "tech", "human", "event", "education", "brand", "data"]
        },
        description: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        },
        colors: {
          type: "object",
          properties: {
            page: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            panel: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            ink: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            muted: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            accent: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            accent2: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            soft: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            line: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" }
          },
          required: ["page", "panel", "ink", "muted", "accent", "accent2", "soft", "line"],
          additionalProperties: false
        },
        rhythm: {
          type: "object",
          properties: {
            paragraph: { type: "integer" },
            line: { type: "number" },
            gap: { type: "integer" },
            radius: { type: "integer" }
          },
          required: ["paragraph", "line", "gap", "radius"],
          additionalProperties: false
        },
        design: {
          type: "object",
          properties: {
            hero: {
              type: "object",
              properties: {
                layout: { type: "string", enum: ["panel", "banner", "minimal", "centered", "poster"] },
                ornament: { type: "string", enum: ["bar", "pill", "corner", "number", "none"] },
                align: { type: "string", enum: ["left", "center"] }
              },
              required: ["layout", "ornament", "align"],
              additionalProperties: false
            },
            heading: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["bar", "badge", "numbered", "centered", "underline", "boxed"] },
                numbering: { type: "string", enum: ["decimal", "hash", "none"] }
              },
              required: ["style", "numbering"],
              additionalProperties: false
            },
            quote: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["left-border", "card", "centered", "speech", "highlight"] },
                emphasis: { type: "string", enum: ["soft", "strong"] }
              },
              required: ["style", "emphasis"],
              additionalProperties: false
            },
            list: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["card", "checklist", "timeline", "plain"] },
                marker: { type: "string", enum: ["dot", "number", "check", "dash"] }
              },
              required: ["style", "marker"],
              additionalProperties: false
            },
            image: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["clean", "framed", "card", "poster"] },
                defaultWidth: { type: "integer" }
              },
              required: ["style", "defaultWidth"],
              additionalProperties: false
            },
            divider: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["line", "dots", "bar", "none"] }
              },
              required: ["style"],
              additionalProperties: false
            }
          },
          required: ["hero", "heading", "quote", "list", "image", "divider"],
          additionalProperties: false
        }
      },
      required: ["schemaVersion", "id", "name", "family", "description", "tags", "colors", "rhythm", "design"],
      additionalProperties: false
    },
    suggestions: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["analysis", "decision", "template", "suggestions"],
  additionalProperties: false
};

const TEMPLATE_LEARNING_SCHEMA = {
  type: "object",
  properties: {
    template: LAYOUT_SCHEMA.properties.template,
    summary: {
      type: "object",
      properties: {
        styleName: { type: "string" },
        visualDNA: { type: "string" },
        layoutRules: {
          type: "array",
          items: { type: "string" }
        },
        suitableFor: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["styleName", "visualDNA", "layoutRules", "suitableFor"],
      additionalProperties: false
    }
  },
  required: ["template", "summary"],
  additionalProperties: false
};

const NATIVE_LAYOUT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    html: { type: "string" },
    plainText: { type: "string" },
    designSummary: {
      type: "object",
      properties: {
        styleName: { type: "string" },
        visualDNA: { type: "string" },
        layoutRules: {
          type: "array",
          items: { type: "string" }
        },
        colorRationale: { type: "string" }
      },
      required: ["styleName", "visualDNA", "layoutRules", "colorRationale"],
      additionalProperties: false
    },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["title", "html", "plainText", "designSummary", "warnings"],
  additionalProperties: false
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/status") {
      sendJson(res, 200, {
        aiEnabled: Boolean(OPENAI_API_KEY),
        model: OPENAI_MODEL,
        baseUrl: OPENAI_BASE_URL,
        endpoint: "Responses API",
        keySource: OPENAI_API_KEY ? "OPENAI_API_KEY" : ""
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/test-ai-config") {
      await handleTestAiConfig(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ai-layout") {
      await handleAiLayout(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ai-native-layout") {
      await handleAiNativeLayout(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ai-learn-template") {
      await handleAiLearnTemplate(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/fetch-reference-url") {
      await handleFetchReferenceUrl(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    serveStatic(url.pathname, res, req.method === "HEAD");
  } catch (error) {
    sendJson(res, 500, { error: "Server error", detail: error.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WeChatPostGPT is running at http://0.0.0.0:${PORT}`);
  console.log(
    OPENAI_API_KEY
      ? `Server fallback AI config enabled with ${OPENAI_MODEL}`
      : "AI can be configured in the page menu; .env fallback is optional."
  );
});

async function handleAiLayout(req, res) {
  const payload = await readJsonBody(req);
  const config = getAiConfig(payload);
  if (!config.apiKey) {
    sendJson(res, 503, {
      error: "AI not configured",
      detail: "请在右上角 AI 配置中填写 BaseUrl、API Key，测试连接后选择模型。"
    });
    return;
  }

  const cleanPayload = sanitizePayload(payload);
  let response;
  try {
    response = await callOpenAI(cleanPayload, config);
  } catch (aiError) {
    console.warn(`[ai-layout] AI call failed: ${aiError.message}`);
    sendJson(res, 502, {
      error: "AI 调用失败",
      detail: aiError.message || "AI 模型未返回有效内容，请检查模型配置或稍后重试。"
    });
    return;
  }

  let plan;
  try {
    plan = parsePlan(response.output_text);
  } catch (parseError) {
    const snippet = String(response.output_text || "").slice(0, 500);
    console.warn(`[ai-layout] parse failed: ${parseError.message} | output_text snippet: ${snippet}`);
    sendJson(res, 422, {
      error: "AI 输出解析失败",
      detail: `${parseError.message}（模型：${config.model}，端点：${response.endpoint || "?"}）`
    });
    return;
  }

  sendJson(res, 200, {
    plan,
    model: config.model,
    endpoint: response.endpoint || "",
    usage: response.usage || null
  });
}

async function handleAiNativeLayout(req, res) {
  const payload = await readJsonBody(req);
  const config = getAiConfig(payload);
  if (!config.apiKey) {
    sendJson(res, 503, {
      error: "AI not configured",
      detail: "请在右上角 AI 配置中填写 BaseUrl、API Key，测试连接后选择模型。"
    });
    return;
  }

  const cleanPayload = sanitizeNativePayload(payload);
  let response;
  try {
    response = await callOpenAIForNativeLayout(cleanPayload, config);
  } catch (aiError) {
    console.warn(`[native-layout] AI call failed: ${aiError.message}`);
    sendJson(res, 502, {
      error: "AI 调用失败",
      detail: aiError.message || "AI 模型未返回有效内容，请检查模型配置或稍后重试。"
    });
    return;
  }

  let native;
  try {
    native = parseNativeLayout(response.output_text);
  } catch (parseError) {
    const snippet = String(response.output_text || "").slice(0, 500);
    console.warn(`[native-layout] parse failed: ${parseError.message} | output_text snippet: ${snippet}`);
    sendJson(res, 422, {
      error: "AI 输出解析失败",
      detail: `${parseError.message}（模型：${config.model}，端点：${response.endpoint || "?"}）`
    });
    return;
  }

  sendJson(res, 200, {
    native,
    model: config.model,
    endpoint: response.endpoint || "",
    usage: response.usage || null
  });
}

async function handleTestAiConfig(req, res) {
  const payload = await readJsonBody(req);
  const baseUrl = normalizeBaseUrl(payload?.baseUrl || "");
  const apiKey = String(payload?.apiKey || "").trim();

  if (!baseUrl || !apiKey) {
    sendJson(res, 400, { error: "BaseUrl and API Key are required." });
    return;
  }

  try {
    assertHttpBaseUrl(baseUrl);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  let data;
  try {
    data = await postOrGetModels(baseUrl, apiKey);
  } catch (error) {
    sendJson(res, 502, { error: error.message });
    return;
  }
  const models = extractModels(data);
  if (!models.length) {
    sendJson(res, 502, { error: "连接成功，但没有返回可用模型列表。" });
    return;
  }

  sendJson(res, 200, {
    message: "测试链接成功！",
    baseUrl,
    models
  });
}

async function handleFetchReferenceUrl(req, res) {
  const payload = await readJsonBody(req);
  const rawUrl = String(payload?.url || "").trim();
  let target;

  try {
    target = new URL(rawUrl);
  } catch (_error) {
    sendJson(res, 400, { error: "Invalid URL." });
    return;
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    sendJson(res, 400, { error: "Only http and https URLs are supported." });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(target.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 WeChatPostGPT/0.2",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.6"
      },
      redirect: "follow",
      signal: controller.signal
    });

    if (!upstream.ok) {
      sendJson(res, 502, { error: `Fetch failed with HTTP ${upstream.status}.` });
      return;
    }

    const contentLength = Number(upstream.headers.get("content-length") || 0);
    if (contentLength > MAX_RAW_FETCH_BYTES) {
      sendJson(res, 413, {
        error: `Reference page is too large to fetch safely. Limit is ${formatBytes(MAX_RAW_FETCH_BYTES)}.`
      });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "";
    const arrayBuffer = await upstream.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_RAW_FETCH_BYTES) {
      sendJson(res, 413, {
        error: `Reference page is too large to fetch safely. Limit is ${formatBytes(MAX_RAW_FETCH_BYTES)}.`
      });
      return;
    }

    const rawSource = Buffer.from(arrayBuffer).toString("utf8");
    const distilled = distillReferenceSource(rawSource, { url: upstream.url || target.href });
    const validation = validateReferenceSource(distilled, { requireWechatArticle: isWeChatArticleUrl(target) });
    if (!validation.ok) {
      sendJson(res, 422, {
        error: validation.message,
        url: upstream.url || target.href,
        contentType,
        bytes: arrayBuffer.byteLength,
        diagnostics: validation.diagnostics
      });
      return;
    }
    sendJson(res, 200, {
      url: upstream.url || target.href,
      contentType,
      bytes: arrayBuffer.byteLength,
      distilledBytes: Buffer.byteLength(distilled.source, "utf8"),
      distilled: distilled.changed,
      title: distilled.title,
      diagnostics: distilled.diagnostics,
      source: distilled.source
    });
  } catch (error) {
    const message = error.name === "AbortError" ? "Fetch timed out." : error.message;
    sendJson(res, 502, { error: message });
  } finally {
    clearTimeout(timer);
  }
}

async function handleAiLearnTemplate(req, res) {
  const payload = await readJsonBody(req);
  const config = getAiConfig(payload);
  if (!config.apiKey) {
    sendJson(res, 503, {
      error: "AI not configured",
      detail: "请在右上角 AI 配置中填写 BaseUrl、API Key，测试连接后选择模型。"
    });
    return;
  }

  const referenceName = String(payload?.name || "").trim().slice(0, 40);
  const rawSource = String(payload?.source || "");
  if (!rawSource.trim()) {
    sendJson(res, 400, { error: "Reference source is empty." });
    return;
  }

  const prepared = prepareReferenceForAi(rawSource);
  const validation = validateReferenceSource(prepared.distilled, { requireWechatArticle: false });
  if (!validation.ok) {
    sendJson(res, 422, {
      error: validation.message,
      diagnostics: validation.diagnostics
    });
    return;
  }

  const response = await callOpenAIForTemplateLearning(referenceName, prepared.source, config);
  const learned = parseJsonPayload(response.output_text, "AI template learning result");
  const template = normalizePlan({
    analysis: {
      type: "general",
      typeLabel: "参考模板",
      tone: "",
      audience: "",
      readingPath: "",
      rationale: ""
    },
    decision: {
      mode: "generate_new",
      selectedTemplateId: "",
      density: "balanced",
      reason: "从参考文章学习"
    },
    template: learned.template,
    suggestions: []
  }).template;

  sendJson(res, 200, {
    template: {
      ...template,
      id: `ai-learned-${Date.now()}`,
      source: "ai-learned",
      name: referenceName || template.name || "AI 学习模板"
    },
    summary: learned.summary,
    model: config.model,
    endpoint: response.endpoint || "",
    diagnostics: prepared.distilled.diagnostics,
    usage: response.usage || null
  });
}

async function callOpenAI(payload, config) {
  const systemContent = [
    "你是一个微信公众号文章排版总监。你只输出符合 JSON Schema 的排版决策。",
          "重要边界：不要直接生成 HTML；不要改写正文；不要建议外部脚本、CSS 文件、定位动画或复杂交互。",
          "你的任务是基于文章内容和可用模板，选择最合适的整套模板；如果没有合适模板，生成新的模板令牌。",
          "当用户的 modePreference 是 generate 时，必须让 decision.mode = generate_new，并基于文章气质原创一套模板，不要复用已有模板。",
          "内容驱动生成模式要最大化发挥设计判断：在 hero、heading、quote、list、image、divider 之间形成有辨识度的组合，但仍保持微信富文本兼容和移动端可读。",
          "模板必须适合复制到微信公众号后台：静态、克制、移动端优先、inline style 友好。",
          "template.schemaVersion 必须是 2；template.design 必须体现整体版式：文头布局、标题系统、引用样式、列表样式、图片样式、分隔方式都要和文章气质一致。",
          "如果 decision.mode 是 use_existing，template 仍需返回所选模板的完整对象；如果是 generate_new，selectedTemplateId 置为空字符串。"
  ].join("\n");
  const userContent = JSON.stringify(payload);
  const body = {
    model: config.model,
    input: [
      {
        role: "system",
        content: systemContent
      },
      {
        role: "user",
        content: userContent
      }
    ],
    reasoning: { effort: "low" },
    text: {
      format: {
        type: "json_schema",
        name: "wechat_layout_plan",
        schema: LAYOUT_SCHEMA,
        strict: true
      }
    }
  };

  return callAiWithFallback({
    config,
    responseBody: body,
    systemContent,
    userContent,
    schemaName: "wechat_layout_plan",
    schema: LAYOUT_SCHEMA
  });
}

async function callOpenAIForNativeLayout(payload, config) {
  const systemContent = [
    "你是顶级微信公众号富媒体排版设计师。你要直接生成可复制到公众号后台的完整 inline HTML，而不是模板令牌。",
    "这是 AI 原生创意排版模式：不受本项目模板 schema 限制，可以自由设计文头、导语、信息块、强调块、分隔、图片框、结尾和整体节奏。",
    "目标只有一个：输出高质量、有美感、贴合文章内容、配色吸引人、移动端阅读舒服的公众号富文本成果。",
    "硬性兼容边界：不要使用 script、style 标签、link、iframe、form、input、button、svg、canvas、video、audio；不要使用外部 CSS、事件属性、position、动画、媒体查询或复杂交互。",
    "所有样式必须写在元素 inline style 中。优先使用 section、p、span、strong、em、blockquote、img、a、table、ul、ol、li、hr、br 等静态标签。",
    "不要编造事实，不要大幅改写正文；可以增加少量导读标签、栏目名、强调容器和过渡句，但必须服务原文。",
    "如果正文里有 Markdown 图片，请在 HTML 中保留同一个图片 src；本地图片引用 wechatpostgpt:image:* 也要原样放入 img src。",
    "只输出符合 JSON Schema 的对象，其中 html 字段是最终可复制的富媒体 HTML。"
  ].join("\n");
  const userContent = JSON.stringify(payload);
  const body = {
    model: config.model,
    input: [
      {
        role: "system",
        content: systemContent
      },
      {
        role: "user",
        content: userContent
      }
    ],
    reasoning: { effort: "low" },
    text: {
      format: {
        type: "json_schema",
        name: "wechat_native_layout",
        schema: NATIVE_LAYOUT_SCHEMA,
        strict: true
      }
    }
  };

  return callAiWithFallback({
    config,
    responseBody: body,
    systemContent,
    userContent,
    schemaName: "wechat_native_layout",
    schema: NATIVE_LAYOUT_SCHEMA
  });
}

async function callOpenAIForTemplateLearning(referenceName, source, config) {
  const systemContent = [
          "你是微信公众号文章模板研究员。你会从参考 HTML / 富文本源码中总结可复用模板。",
          "不要复制原文内容，不要输出 HTML。只抽象版式风格、颜色、节奏、标题系统、强调系统。",
          "template.schemaVersion 必须是 2；template.design 必须从参考版式中提炼：hero、heading、quote、list、image、divider 的选择要能让本地渲染器复现整体气质。",
          "模板必须能被本地渲染器转换为公众号兼容 inline HTML。"
  ].join("\n");
  const userContent = JSON.stringify({
    requestedName: referenceName,
    referenceSource: source,
    instruction: "请学习这篇参考文章的视觉 DNA，并返回 JSON 模板。"
  });
  const body = {
    model: config.model,
    input: [
      {
        role: "system",
        content: systemContent
      },
      {
        role: "user",
        content: userContent
      }
    ],
    reasoning: { effort: "low" },
    text: {
      format: {
        type: "json_schema",
        name: "wechat_template_learning",
        schema: TEMPLATE_LEARNING_SCHEMA,
        strict: true
      }
    }
  };

  return callAiWithFallback({
    config,
    responseBody: body,
    systemContent,
    userContent,
    schemaName: "wechat_template_learning",
    schema: TEMPLATE_LEARNING_SCHEMA
  });
}

async function callAiWithFallback({ config, responseBody, systemContent, userContent, schemaName, schema }) {
  const responsesResult = await postJsonToAi(`${config.baseUrl}/responses`, config.apiKey, responseBody);
  if (responsesResult.ok) {
    try {
      return normalizeAiJsonResponse(responsesResult.data, "Responses API");
    } catch (error) {
      if (!isMissingOutputTextError(error)) throw error;
    }
  }

  // Hard-stop only on auth-style failures. Many OpenAI-compatible gateways
  // (Anthropic Claude, DeepSeek, local proxies, etc.) don't support /responses
  // at all and return 400/404/500 with bodies that aren't worth surfacing
  // before we've tried the more compatible Chat Completions endpoint.
  if (!responsesResult.ok && isAuthLikeStatus(responsesResult.status)) {
    throw new Error(buildAiErrorMessage("Responses API", responsesResult));
  }

  try {
    return await callChatCompletionsWithFallback({ config, systemContent, userContent, schemaName, schema });
  } catch (chatError) {
    const responsesTimedOut = isGatewayTimeoutStatus(responsesResult.status);
    const chatTimedOut = /timed out|gateway timeout|request timeout|\b504\b|\b502\b|\b503\b|\b408\b/i.test(
      chatError.message || ""
    );
    if (responsesTimedOut && chatTimedOut) {
      throw new Error(
        "AI 网关超时（Gateway Timeout）：上游模型服务在限定时间内没有返回结果。可尝试：1) 缩短正文或拆成多段；2) 在「AI 配置」中切换到响应更快的模型；3) 稍后再试。"
      );
    }
    throw chatError;
  }
}

function isGatewayTimeoutStatus(status) {
  return [408, 502, 503, 504].includes(Number(status));
}

function isAuthLikeStatus(status) {
  return [401, 403, 429].includes(Number(status));
}

function buildAiErrorMessage(endpoint, result) {
  const status = result?.status || 0;
  const detail = String(result?.error || "").trim();
  const parts = [`${endpoint} 调用失败`];
  if (status) parts.push(`HTTP ${status}`);
  if (detail) parts.push(detail);
  return parts.join("：");
}

async function callChatCompletionsWithFallback({ config, systemContent, userContent, schemaName, schema }) {
  const schemaHint = `请严格按这个 JSON Schema 的字段输出：${JSON.stringify(schema)}`;
  const jsonSchemaBody = {
    model: config.model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schemaName,
        schema,
        strict: true
      }
    }
  };

  const jsonObjectBody = {
    model: config.model,
    messages: [
      { role: "system", content: `${systemContent}\n${schemaHint}\n你必须只输出合法 JSON，不要输出 Markdown。` },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" }
  };

  const plainJsonBody = {
    model: config.model,
    messages: [
      { role: "system", content: `${systemContent}\n${schemaHint}\n你必须只输出合法 JSON，不要输出 Markdown 代码块。` },
      { role: "user", content: userContent }
    ]
  };

  const attempts = [jsonSchemaBody, jsonObjectBody, plainJsonBody];
  let lastResult = null;
  let lastError = "";
  let lastStatus = 0;

  for (const body of attempts) {
    const chatResult = await postJsonToAi(`${config.baseUrl}/chat/completions`, config.apiKey, body);
    lastResult = chatResult;
    if (!chatResult.ok) {
      lastError = chatResult.error;
      lastStatus = chatResult.status;
      // Auth/quota errors won't be fixed by trying another body shape.
      if (isAuthLikeStatus(chatResult.status)) break;
      continue;
    }

    const outputText = extractOutputText(chatResult.data);
    if (outputText.trim()) {
      return { ...chatResult.data, output_text: outputText, endpoint: "Chat Completions API" };
    }

    lastStatus = chatResult.status;
    lastError = "模型返回了空响应或无法解析的内容";
    console.warn(
      `[ai] chat/completions returned no usable text. shape=${JSON.stringify(Object.keys(chatResult.data || {}))}`
    );
  }

  const detail = buildAiErrorMessage("Chat Completions API", { status: lastStatus, error: lastError });
  throw new Error(detail || "Chat Completions API 调用失败");
}

async function postJsonToAi(url, apiKey, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  try {
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const rawText = await apiResponse.text();
    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (_error) {
      data = {};
    }

    if (!apiResponse.ok) {
      const snippet = rawText ? String(rawText).slice(0, 400).trim() : "";
      const error =
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : "") ||
        data?.message ||
        apiResponse.statusText ||
        snippet ||
        `HTTP ${apiResponse.status}`;
      console.warn(
        `[ai] ${url} -> HTTP ${apiResponse.status} ${apiResponse.statusText || ""} body=${snippet || "<empty>"}`
      );
      return { ok: false, status: apiResponse.status, data, error };
    }
    return { ok: true, status: apiResponse.status, data };
  } catch (error) {
    const isAbort = error.name === "AbortError";
    console.warn(`[ai] ${url} -> network error: ${error.message}`);
    return {
      ok: false,
      status: isAbort ? 408 : 0,
      data: null,
      error: isAbort ? "AI request timed out." : error.message || "Network error"
    };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAiJsonResponse(data, endpoint) {
  if (data.status && data.status !== "completed") {
    throw new Error(`OpenAI response incomplete: ${data.status}`);
  }
  const outputText = extractOutputText(data);
  if (!outputText) {
    throw new Error("OpenAI response did not include output_text.");
  }
  return { ...data, output_text: outputText, endpoint };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  if (typeof data.text === "string" && data.text.trim()) {
    return data.text;
  }

  if (typeof data.content === "string" && data.content.trim()) {
    return data.content;
  }

  if (Array.isArray(data.content)) {
    const contentText = extractContentParts(data.content);
    if (contentText) return contentText;
  }

  const parts = [];
  for (const item of data.output || []) {
    if (typeof item.text === "string") parts.push(item.text);
    if (typeof item.content === "string") parts.push(item.content);
    if (Array.isArray(item.content)) parts.push(extractContentParts(item.content));
  }

  const outputText = parts.join("").trim();
  if (outputText) return outputText;

  const choice = data.choices?.[0];
  if (typeof choice?.text === "string" && choice.text.trim()) {
    return choice.text;
  }
  const message = choice?.message || choice?.delta;
  if (typeof message?.content === "string" && message.content.trim()) {
    return message.content;
  }
  if (Array.isArray(message?.content)) {
    return extractContentParts(message.content);
  }

  return "";
}

function extractContentParts(contentParts) {
  return contentParts
    .map((content) => {
      if (typeof content === "string") return content;
      if (typeof content?.text === "string") return content.text;
      if (typeof content?.content === "string") return content.content;
      if (typeof content?.value === "string") return content.value;
      if (content?.type === "json" && content?.json) return JSON.stringify(content.json);
      return "";
    })
    .join("")
    .trim();
}

function isMissingOutputTextError(error) {
  return /output_text|JSON content/i.test(error?.message || "");
}

function isFallbackWorthyStatus(status) {
  return [400, 404, 405, 408, 422, 502, 503, 504].includes(Number(status));
}

async function postOrGetModels(baseUrl, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || response.statusText);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function extractModels(data) {
  const raw = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.models)
      ? data.models
      : Array.isArray(data)
        ? data
        : [];
  return [...new Set(raw.map((item) => (typeof item === "string" ? item : item?.id)).filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b));
}

function getAiConfig(payload) {
  const clientConfig = payload?.aiConfig || {};
  const baseUrl = normalizeBaseUrl(clientConfig.baseUrl || OPENAI_BASE_URL);
  const apiKey = String(clientConfig.apiKey || OPENAI_API_KEY || "").trim();
  const model = String(clientConfig.model || OPENAI_MODEL || "").trim();
  if (baseUrl) assertHttpBaseUrl(baseUrl);
  return { baseUrl, apiKey, model };
}

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function assertHttpBaseUrl(baseUrl) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch (_error) {
    throw new Error("BaseUrl is invalid.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("BaseUrl must start with http:// or https://.");
  }
}

function parsePlan(outputText) {
  try {
    return normalizePlan(parseJsonPayload(outputText, "AI layout plan"));
  } catch (error) {
    throw new Error(`Failed to parse AI layout plan: ${error.message}`);
  }
}

function parseNativeLayout(outputText) {
  try {
    const parsed = parseJsonPayload(outputText, "AI native layout");
    const html = sanitizeNativeHtml(parsed.html);
    const plainText = String(parsed.plainText || stripHtmlText(html)).replace(/\s+/g, " ").trim();
    if (plainText.length < 10 || !/<[a-z][\s\S]*>/i.test(html)) {
      throw new Error("AI native layout did not include usable HTML.");
    }
    return {
      title: String(parsed.title || "").slice(0, 120),
      html,
      plainText,
      designSummary: {
        styleName: String(parsed.designSummary?.styleName || "AI 原生创意排版").slice(0, 60),
        visualDNA: String(parsed.designSummary?.visualDNA || "AI 直接生成的公众号富媒体版式。").slice(0, 240),
        layoutRules: Array.isArray(parsed.designSummary?.layoutRules)
          ? parsed.designSummary.layoutRules.slice(0, 8).map((item) => String(item).slice(0, 120))
          : [],
        colorRationale: String(parsed.designSummary?.colorRationale || "").slice(0, 180)
      },
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 6).map((item) => String(item).slice(0, 120)) : []
    };
  } catch (error) {
    throw new Error(`Failed to parse AI native layout: ${error.message}`);
  }
}

function parseJsonPayload(outputText, label) {
  const text = String(outputText || "").trim();
  const candidates = [
    text,
    text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim(),
    extractJsonObjectText(text)
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      // Try the next candidate.
    }
  }

  throw new Error(`${label} is not valid JSON.`);
}

function extractJsonObjectText(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return "";
  return text.slice(start, end + 1);
}

function normalizePlan(plan) {
  const fallbackColors = {
    page: "#ffffff",
    panel: "#f5f8fc",
    ink: "#172033",
    muted: "#65738a",
    accent: "#1d4ed8",
    accent2: "#0f766e",
    soft: "#eaf2ff",
    line: "#c9d8f2"
  };
  const template = plan.template || {};
  const colors = { ...fallbackColors, ...(template.colors || {}) };
  const rhythm = {
    paragraph: clampInt(template.rhythm?.paragraph, 14, 18, 16),
    line: clampNumber(template.rhythm?.line, 1.65, 2.08, 1.86),
    gap: clampInt(template.rhythm?.gap, 12, 24, 16),
    radius: clampInt(template.rhythm?.radius, 0, 16, 8)
  };
  const design = normalizeDesign(template.design, template.family || "insight");

  return {
    ...plan,
    template: {
      schemaVersion: 2,
      id: String(template.id || `ai-${Date.now()}`),
      source: "ai",
      name: String(template.name || "AI 生成模板").slice(0, 28),
      family: template.family || "insight",
      description: String(template.description || "由 AI 根据当前文章生成。").slice(0, 120),
      tags: Array.isArray(template.tags) ? template.tags.slice(0, 8).map(String) : ["general"],
      colors,
      rhythm,
      design
    }
  };
}

function normalizeDesign(design, family) {
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
      defaultWidth: clampInt(design?.image?.defaultWidth, 60, 100, fallback.image.defaultWidth)
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

function sanitizePayload(payload) {
  const title = String(payload?.title || "").slice(0, 160);
  const content = String(payload?.content || "").slice(0, 60_000);
  const localAnalysis = payload?.localAnalysis || {};
  const templates = Array.isArray(payload?.templates) ? payload.templates : [];
  const modePreference = String(payload?.modePreference || "auto");

  return {
    title,
    content,
    densityPreference: String(payload?.densityPreference || "balanced"),
    modePreference,
    localAnalysis: {
      type: String(localAnalysis.type || "general"),
      typeLabel: String(localAnalysis.typeLabel || "通用长文"),
      tone: String(localAnalysis.tone || ""),
      paragraphCount: Number(localAnalysis.paragraphCount || 0),
      headingCount: Number(localAnalysis.headingCount || 0),
      hasCode: Boolean(localAnalysis.hasCode),
      hasManyNumbers: Boolean(localAnalysis.hasManyNumbers),
      readingMinutes: Number(localAnalysis.readingMinutes || 1)
    },
    templates: templates.slice(0, 24).map((template) => ({
      id: String(template.id || ""),
      name: String(template.name || ""),
      family: String(template.family || ""),
      description: String(template.description || ""),
      tags: Array.isArray(template.tags) ? template.tags.map(String).slice(0, 8) : [],
      colors: template.colors || {},
      rhythm: template.rhythm || {},
      design: template.design || {}
    })),
    instruction:
      modePreference === "generate"
        ? "请返回一个 JSON 排版计划。当前是内容驱动生成模式：必须生成新模板，decision.mode 必须是 generate_new，selectedTemplateId 必须为空字符串。请让模板在整体结构、视觉节奏和组件组合上明显服务于这篇文章。"
        : "请返回一个 JSON 排版计划。优先选择已有模板；只有在现有模板明显无法承载文章气质时才生成新模板。"
  };
}

function sanitizeNativePayload(payload) {
  const title = String(payload?.title || "").slice(0, 160);
  const content = String(payload?.content || "")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, "[图片 data URL 已省略，请保留图片位置]")
    .slice(0, 48_000);
  const localAnalysis = payload?.localAnalysis || {};
  return {
    title,
    content,
    densityPreference: String(payload?.densityPreference || "balanced"),
    localAnalysis: {
      type: String(localAnalysis.type || "general"),
      typeLabel: String(localAnalysis.typeLabel || "通用长文"),
      tone: String(localAnalysis.tone || ""),
      paragraphCount: Number(localAnalysis.paragraphCount || 0),
      headingCount: Number(localAnalysis.headingCount || 0),
      hasCode: Boolean(localAnalysis.hasCode),
      hasManyNumbers: Boolean(localAnalysis.hasManyNumbers),
      readingMinutes: Number(localAnalysis.readingMinutes || 1)
    },
    instruction:
      "请以内容原生设计方式直接排版这篇文章，输出公众号兼容 inline HTML。尽可能发挥审美和创意，但不要牺牲移动端可读性与微信粘贴兼容性。"
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });

    req.on("error", reject);
  });
}

function serveStatic(urlPath, res, headOnly) {
  const requestedPath = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);
  const resolved = path.resolve(filePath);
  const relative = path.relative(__dirname, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.stat(resolved, (statError, stat) => {
    if (statError || !stat.isFile()) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store"
    });

    if (headOnly) {
      res.end();
      return;
    }

    fs.createReadStream(resolved).pipe(res);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function distillReferenceSource(source, options = {}) {
  const raw = String(source || "");
  const title = extractHtmlTitle(raw);
  const styleText = collectStyleText(raw, 90_000);
  const body = extractBody(raw);
  const picked = pickReferenceCandidate(body);
  const candidate = picked.candidate;
  let distilledBody = candidate
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<canvas\b[\s\S]*?<\/canvas>/gi, "")
    .replace(/<video\b[\s\S]*?<\/video>/gi, "")
    .replace(/<audio\b[\s\S]*?<\/audio>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(on[a-z]+)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(data-[a-z0-9_-]+)=("[^"]*"|'[^']*')/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  distilledBody = truncateMiddle(distilledBody, MAX_DISTILLED_REFERENCE_BYTES - Buffer.byteLength(styleText, "utf8") - 1200);

  const parts = [
    "<!-- WeChatPostGPT distilled reference: scripts and large non-layout blocks removed. -->",
    title ? `<title>${escapeText(title)}</title>` : "",
    styleText ? `<style>${styleText}</style>` : "",
    `<main>${distilledBody}</main>`
  ].filter(Boolean);
  const distilled = truncateMiddle(parts.join("\n"), MAX_DISTILLED_REFERENCE_BYTES);

  return {
    title,
    source: distilled,
    changed: distilled.length < raw.length,
    diagnostics: analyzeReferenceSource({
      raw,
      body: distilledBody,
      title,
      mode: picked.mode,
      selector: picked.selector,
      url: options.url || ""
    })
  };
}

function prepareReferenceForAi(source) {
  const distilled = distillReferenceSource(source);
  return {
    distilled,
    source: compactReferenceForAi(distilled.source)
  };
}

function compactReferenceForAi(source) {
  let compact = String(source || "")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, "data:image/removed;base64,REMOVED")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>([^<]{90,})</g, (_match, text) => `>${summarizeTextNode(text)}<`)
    .replace(/\s+/g, " ")
    .trim();

  compact = compact.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (match) => truncateMiddle(match, 14_000));
  return truncateMiddle(compact, MAX_AI_REFERENCE_BYTES);
}

function summarizeTextNode(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= 90) return clean;
  return `${clean.slice(0, 42)} ... ${clean.slice(-24)}`;
}

function collectStyleText(source, limit) {
  const chunks = [];
  const regex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = regex.exec(source))) {
    const cleaned = match[1]
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) continue;
    chunks.push(cleaned);
    if (chunks.join("\n").length > limit) break;
  }
  return truncateMiddle(chunks.join("\n"), limit);
}

function extractBody(source) {
  const match = String(source || "").match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : String(source || "");
}

function pickReferenceCandidate(body) {
  const source = String(body || "");
  const exactWechat = extractElementByAttribute(source, "id", /^js_content$/i);
  if (exactWechat) {
    return { candidate: exactWechat, mode: "wechat-js-content", selector: "#js_content" };
  }

  const richMedia = extractElementByAttribute(source, "class", /\b(rich_media_content|article|post|entry)\b/i);
  if (richMedia) {
    return { candidate: richMedia, mode: "class-content", selector: ".rich_media_content/.article" };
  }

  const article = extractElementByTag(source, "article");
  if (article) return { candidate: article, mode: "article-tag", selector: "article" };

  const main = extractElementByTag(source, "main");
  if (main) return { candidate: main, mode: "main-tag", selector: "main" };

  const sections = source.match(/<section\b[\s\S]*?<\/section>/gi) || [];
  const sectionCandidate = sections
    .slice(0, 60)
    .map((candidate) => ({
      candidate,
      score:
        candidate.length +
        (candidate.match(/style=/gi) || []).length * 1800 +
        (candidate.match(/#[0-9a-f]{3,8}\b/gi) || []).length * 800 +
        (candidate.match(/font-size|line-height|border-radius|background|color/gi) || []).length * 400
    }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;

  if (sectionCandidate) {
    return { candidate: sectionCandidate, mode: "section-fallback", selector: "section" };
  }

  return { candidate: source, mode: "body-fallback", selector: "body" };
}

function extractElementByAttribute(source, attributeName, expectedValue) {
  const tagRegex = /<([a-z][\w:-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagRegex.exec(source))) {
    const tag = match[0];
    const value = readAttribute(tag, attributeName);
    if (!value) continue;
    const ok = expectedValue instanceof RegExp ? expectedValue.test(value) : value === expectedValue;
    if (!ok) continue;
    const element = extractBalancedElementFromStart(source, match.index);
    if (element) return element;
  }
  return "";
}

function extractElementByTag(source, tagName) {
  const match = new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>`, "i").exec(source);
  return match ? extractBalancedElementFromStart(source, match.index) : "";
}

function extractBalancedElementFromStart(source, startIndex) {
  const openMatch = /^<([a-z][\w:-]*)\b[^>]*>/i.exec(source.slice(startIndex));
  if (!openMatch) return "";
  const tagName = openMatch[1].toLowerCase();
  if (isVoidTag(tagName) || /\/>$/.test(openMatch[0])) return openMatch[0];

  const tagRegex = new RegExp(`<\\/?${escapeRegExp(tagName)}\\b[^>]*>`, "gi");
  tagRegex.lastIndex = startIndex;
  let depth = 0;
  let match;
  while ((match = tagRegex.exec(source))) {
    const token = match[0];
    if (/^<\//.test(token)) {
      depth -= 1;
    } else if (!/\/>$/.test(token)) {
      depth += 1;
    }
    if (depth === 0) return source.slice(startIndex, tagRegex.lastIndex);
  }
  return source.slice(startIndex);
}

function readAttribute(tag, name) {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);
  return match ? String(match[1] || match[2] || match[3] || "") : "";
}

function isVoidTag(tagName) {
  return ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(
    tagName
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeNativeHtml(html) {
  let clean = String(html || "")
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const bodyMatch = clean.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) clean = bodyMatch[1];

  clean = clean
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<head\b[\s\S]*?<\/head>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<canvas\b[\s\S]*?<\/canvas>/gi, "")
    .replace(/<video\b[\s\S]*?<\/video>/gi, "")
    .replace(/<audio\b[\s\S]*?<\/audio>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(html|body|meta|title|link)\b[^>]*>/gi, "");

  const allowed = new Set([
    "section",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "blockquote",
    "code",
    "pre",
    "img",
    "a",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "ul",
    "ol",
    "li",
    "br",
    "hr"
  ]);

  clean = clean.replace(/<\/?([a-z][\w:-]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!allowed.has(tag)) return "";
    return sanitizeNativeTag(match, tag);
  });

  const rootStyle = [
    "max-width:677px",
    "margin:0 auto",
    "padding:18px",
    "background:#ffffff",
    "color:#1f2933",
    "font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',Arial,sans-serif",
    "box-sizing:border-box"
  ].join(";");
  return `<section data-wechatpostgpt-native="article" style="${rootStyle}">${clean}</section>`;
}

function sanitizeNativeTag(match, tag) {
  if (/^<\//.test(match)) return isVoidTag(tag) ? "" : `</${tag}>`;
  const attrs = [];
  const style = sanitizeInlineStyle(readAttribute(match, "style"));
  if (style) attrs.push(`style="${escapeAttribute(style)}"`);

  if (tag === "a") {
    const href = sanitizeNativeUrl(readAttribute(match, "href"));
    if (href) attrs.push(`href="${escapeAttribute(href)}"`);
  }

  if (tag === "img") {
    const src = sanitizeNativeUrl(readAttribute(match, "src"));
    const alt = readAttribute(match, "alt");
    if (!src) return "";
    attrs.push(`src="${escapeAttribute(src)}"`);
    attrs.push(`alt="${escapeAttribute(alt || "图片")}"`);
    if (!style) attrs.push('style="max-width:100%;height:auto;display:block;margin:0 auto"');
  }

  if (["td", "th"].includes(tag)) {
    const colspan = clampInt(readAttribute(match, "colspan"), 1, 12, 1);
    const rowspan = clampInt(readAttribute(match, "rowspan"), 1, 20, 1);
    if (colspan > 1) attrs.push(`colspan="${colspan}"`);
    if (rowspan > 1) attrs.push(`rowspan="${rowspan}"`);
  }

  const suffix = isVoidTag(tag) ? "" : "";
  return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}${suffix}>`;
}

function sanitizeInlineStyle(value) {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const [rawName, ...rawValue] = part.split(":");
      const name = String(rawName || "").trim().toLowerCase();
      const styleValue = rawValue.join(":").trim();
      if (!name || !styleValue) return false;
      if (/^(position|z-index|animation|transition|transform|filter|backdrop-filter|behavior)$/i.test(name)) return false;
      if (/expression\s*\(|javascript:|@media|@keyframes|url\s*\(\s*['"]?\s*javascript:/i.test(styleValue)) return false;
      return /^[a-z-]+$/.test(name);
    })
    .join(";");
}

function sanitizeNativeUrl(value) {
  const url = String(value || "").trim().replace(/"/g, "%22");
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(url)) return url;
  if (/^wechatpostgpt:image:[a-zA-Z0-9_-]+$/.test(url)) return url;
  if (/^#[a-zA-Z0-9_-]+$/.test(url)) return url;
  return "";
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function validateReferenceSource(distilled, options = {}) {
  const diagnostics = distilled?.diagnostics || {};
  const requireWechatArticle = Boolean(options.requireWechatArticle);

  if (diagnostics.securityLike && diagnostics.textChars < 220) {
    return {
      ok: false,
      message: "URL 返回的是微信安全验证/拦截页，不是可学习的文章正文。请改用浏览器复制正文富文本或上传保存的网页 HTML。",
      diagnostics
    };
  }

  if (requireWechatArticle && diagnostics.extractionMode !== "wechat-js-content") {
    return {
      ok: false,
      message:
        "没有从该微信链接中提取到真实文章正文区域 #js_content。为避免生成错误模板，本次已停止学习。请改用浏览器复制正文富文本，或上传保存后的网页 HTML。",
      diagnostics
    };
  }

  if (diagnostics.textChars < 80 && diagnostics.styleAttrCount < 3 && diagnostics.colorCount < 3) {
    return {
      ok: false,
      message: "参考内容太少，无法可靠学习模板。请粘贴已排版文章正文区域的富文本，而不是空白页、分享页或登录/验证页。",
      diagnostics
    };
  }

  return { ok: true, diagnostics };
}

function analyzeReferenceSource({ raw, body, title, mode, selector, url }) {
  const text = stripHtmlText(body);
  return {
    title,
    url,
    extractionMode: mode,
    selector,
    textChars: text.length,
    styleAttrCount: (body.match(/\sstyle\s*=/gi) || []).length,
    sectionCount: (body.match(/<section\b/gi) || []).length,
    imageCount: (body.match(/<img\b/gi) || []).length,
    colorCount: (body.match(/#[0-9a-f]{3,8}\b/gi) || []).length,
    rawBytes: Buffer.byteLength(raw, "utf8"),
    extractedBytes: Buffer.byteLength(body, "utf8"),
    securityLike: /captcha|verify|weui-msg|security|access denied|forbidden|readtemplate/i.test(raw)
  };
}

function stripHtmlText(source) {
  return decodeHtmlEntities(
    String(source || "")
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

function isWeChatArticleUrl(url) {
  return /(^|\.)mp\.weixin\.qq\.com$/i.test(url.hostname) && /^\/s[\/?]/i.test(`${url.pathname}/`);
}

function truncateMiddle(value, maxBytes) {
  const text = String(value || "");
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
  const half = Math.max(1, Math.floor(maxBytes / 2) - 200);
  const head = Buffer.from(text).subarray(0, half).toString("utf8").replace(/[\uFFFD]$/u, "");
  const tail = Buffer.from(text)
    .subarray(Math.max(0, Buffer.byteLength(text, "utf8") - half))
    .toString("utf8")
    .replace(/^[\uFFFD]/u, "");
  return `${head}\n<!-- WeChatPostGPT: middle content truncated for template learning -->\n${tail}`;
}

function extractHtmlTitle(source) {
  const raw = String(source || "");
  const candidates = [
    raw.match(/id=["']activity-name["'][^>]*>([\s\S]*?)<\//i)?.[1],
    raw.match(/class=["'][^"']*rich_media_title[^"']*["'][^>]*>([\s\S]*?)<\//i)?.[1],
    raw.match(/property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1],
    raw.match(/var\s+msg_title\s*=\s*['"]([\s\S]*?)['"]/i)?.[1],
    raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  ];
  for (const candidate of candidates) {
    const title = stripHtmlText(candidate || "").replace(/\s+/g, " ").trim();
    if (title) return title.slice(0, 80);
  }
  return "";
}

function escapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
