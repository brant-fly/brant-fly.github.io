"use client";

import { useEffect, useMemo, useState } from "react";

type Section = "模型发布/更新" | "产品发布/更新" | "行业动态" | "论文研究" | "技巧与观点";
type Story = { section: Section; title: string; source: string; summary: string; url: string; time: string; image?: string };

const sections: Array<{ name: Section; tag: string; note: string }> = [
  { name: "模型发布/更新", tag: "MODEL", note: "能力、价格与可用性" },
  { name: "产品发布/更新", tag: "PRODUCT", note: "工具、功能与体验" },
  { name: "行业动态", tag: "SIGNAL", note: "公司、政策与市场" },
  { name: "论文研究", tag: "PAPER", note: "值得跟进的研究" },
  { name: "技巧与观点", tag: "PRACTICE", note: "方法、判断与工作流" },
];

const visualBank: Record<Section, string[]> = {
  "模型发布/更新": ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=80"],
  "产品发布/更新": ["https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"],
  "行业动态": ["https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"],
  "论文研究": ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80"],
  "技巧与观点": ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80"],
};
const visualFor = (section: Section, seed = 0) => visualBank[section][seed % visualBank[section].length];

async function toChineseTitle(title: string) {
  if (!/[a-z]{3,}/i.test(title) || /[\u4e00-\u9fff]/.test(title)) return title;
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(title)}&langpair=en|zh-CN`);
    const translated = (await response.json()).responseData?.translatedText?.trim();
    return translated && !/MYMEMORY WARNING/i.test(translated) ? translated : title;
  } catch { return title; }
}

const fallback: Story[] = [
  { section: "模型发布/更新", title: "GPT‑5.4 mini 在 ChatGPT 中上线", source: "OpenAI", summary: "轻量推理模型向免费与 Go 用户逐步开放，并承担高峰期回退。", url: "https://help.openai.com/en/articles/9624314-model-release-notes", time: "8月4日 上午" },
  { section: "模型发布/更新", title: "MAI‑Cyber‑1‑Flash 面向安全场景预览", source: "Microsoft", summary: "面向代码漏洞发现的轻量模型进入公开预览，强调成本效率。", url: "https://www.itpro.com/security/it-delivers-world-class-performance-at-50-percent-of-the-cost-of-leading-models-microsoft-unveils-cut-price-ai-for-security-with-latest-in-house-model-launch", time: "8月3日 晚上" },
  { section: "产品发布/更新", title: "OpenAI 模型退役节奏更新", source: "OpenAI", summary: "旧模型的 ChatGPT 退役计划持续推进，团队需检查依赖与预案。", url: "https://help.openai.com/en/articles/9624314-model-release-notes", time: "8月4日 上午" },
  { section: "产品发布/更新", title: "Windows AI Components 支持单独管理", source: "Windows Central", summary: "Windows 11 更新将让部分设备用户可独立管理本地 AI 组件。", url: "https://www.windowscentral.com/microsoft/windows-11/biggest-changes-microsoft-is-rolling-out-in-august-for-windows-11", time: "7月28日 下午" },
  { section: "行业动态", title: "欧盟 AI 透明度义务进入新阶段", source: "European Commission", summary: "欧盟对与 AI 交互及 AI 合成内容的告知义务已进入适用阶段。", url: "https://digital-strategy.ec.europa.eu/en/news/commission-opens-consultation-draft-guidelines-ai-transparency-obligations", time: "8月2日" },
  { section: "行业动态", title: "前沿模型治理讨论持续升温", source: "AP News", summary: "自主安全测试事件让模型能力、隔离措施与问责机制再度成为焦点。", url: "https://apnews.com/article/708cb598bc1e33cef560e7196adb2afa", time: "7月23日" },
  { section: "论文研究", title: "AI 系统协助科学家撰写经验软件", source: "Nature", summary: "研究展示 AI 在完成专家级经验软件任务上的潜力与评估路径。", url: "https://www.nature.com/articles/s41586-026-10658-6", time: "5月19日" },
  { section: "论文研究", title: "递归训练导致模型退化的防御方法", source: "npj AI", summary: "研究聚焦递归训练下的模型坍塌风险，并提出相应防御思路。", url: "https://www.nature.com/npjai/articles?year=2026", time: "7月25日" },
  { section: "技巧与观点", title: "把“能用”改成可回滚的 AI 工作流", source: "编辑部", summary: "先定义人工确认点、日志与失败回退，才适合把 AI 接入关键流程。", url: "https://www.nist.gov/itl/ai-risk-management-framework", time: "今日 · 编辑观点" },
  { section: "技巧与观点", title: "评估 AI 工具：任务成功率优先于演示效果", source: "编辑部", summary: "用真实任务、时间成本与人工复核比例衡量价值，而非单次惊艳输出。", url: "https://www.nist.gov/itl/ai-risk-management-framework", time: "今日 · 编辑观点" },
  { section: "行业动态", title: "中文 AI 资讯进入每日采集队列", source: "量子位 / 极客公园", summary: "中文科技媒体的公开 RSS 已纳入采集，按 AI 关键词和发布时间筛选。", url: "https://www.qbitai.com/", time: "持续更新" },
];

function bjDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
}

function bjDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function humanTime(seconds: number) {
  const date = new Date(seconds * 1000);
  const today = bjDay(new Date());
  const dateDay = bjDay(date);
  const time = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  return dateDay === today ? `今天 ${time}` : new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function classify(title: string): Section {
  const text = title.toLowerCase();
  if (/(model|llm|gpt|claude|gemini|qwen|mistral|weights|reasoning|模型|大模型|推理)/.test(text)) return "模型发布/更新";
  if (/(launch|release|introduc|copilot|agent|app|product|feature|tool|发布|上线|产品|智能体|应用)/.test(text)) return "产品发布/更新";
  if (/(prompt|workflow|guide|how to|tips|opinion|lesson|提示词|工作流|方法|观点)/.test(text)) return "技巧与观点";
  return "行业动态";
}

export default function Home() {
  const [stories, setStories] = useState(fallback);
  const [issueLabel, setIssueLabel] = useState("最近一期精选");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadDaily() {
      try {
        const since = new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const [idsResponse, papersResponse, qbitResponse, geekparkResponse] = await Promise.all([
          fetch("https://hacker-news.firebaseio.com/v0/topstories.json"),
          fetch(`https://api.openalex.org/works?search=artificial%20intelligence&filter=from_publication_date:${since}&sort=publication_date:desc&per-page=6`),
          fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.qbitai.com%2Ffeed"),
          fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.geekpark.net%2Frss"),
        ]);
        const ids: number[] = await idsResponse.json();
        const rawItems = await Promise.all(ids.slice(0, 70).map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())));
        const aiItems = rawItems.filter((item) => item && item.url && /(ai|artificial intelligence|llm|model|gpt|claude|gemini|agent|machine learning)/i.test(item.title || "")).slice(0, 7);
        const hnStories: Story[] = aiItems.map((item) => ({
          section: classify(item.title), title: item.title, source: "Hacker News", summary: "来自开发者社区的当日高热度讨论；请打开原文核对细节与上下文。", url: item.url, time: humanTime(item.time),
        }));
        const papers = (await papersResponse.json()).results || [];
        const paperStories: Story[] = papers.slice(0, 3).map((paper: { title: string; doi?: string; id: string; publication_date?: string }) => ({
          section: "论文研究", title: paper.title, source: "OpenAlex", summary: "OpenAlex 近期索引的 AI 论文；适合作为后续精读与检索入口。", url: paper.doi ? `https://doi.org/${paper.doi}` : paper.id, time: paper.publication_date ? new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(new Date(`${paper.publication_date}T12:00:00Z`)) : "近期收录",
        }));
        const toChineseStories = (payload: { items?: Array<{ title?: string; link?: string; pubDate?: string; description?: string }> }, source: string): Story[] =>
          (payload.items || []).filter((item) => item.title && item.link && /(ai|人工智能|大模型|模型|智能体|生成式|算法|机器人)/i.test(item.title)).slice(0, 4).map((item) => ({
            section: classify(item.title || ""), title: item.title || "", source,
            summary: "来自中文科技媒体的近期 AI 报道；打开原文获取完整背景与判断。", url: item.link || "#",
            time: item.pubDate ? new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(item.pubDate)) : "近期发布",
          }));
        const [qbit, geekpark] = await Promise.all([qbitResponse.json(), geekparkResponse.json()]);
        const chineseStories = [...toChineseStories(qbit, "量子位"), ...toChineseStories(geekpark, "极客公园")];
        const fresh = [...hnStories, ...chineseStories, ...paperStories].map((story, index) => ({ ...story, image: visualFor(story.section, index) }));
        if (active && fresh.length >= 4) {
          const translated = await Promise.all(fresh.map(async (story) => ({ ...story, title: await toChineseTitle(story.title) })));
          setStories([...translated, ...fallback].slice(0, 16));
          setIssueLabel(hnStories.some((story) => story.time.startsWith("今天")) ? "今日实时更新" : "最新可用一期");
        }
      } catch {
        // 网络接口不可用时保留最近一期编辑精选，页面仍可离线阅读。
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDaily();
    return () => { active = false; };
  }, []);

  const grouped = useMemo(() => sections.map((section) => ({ ...section, stories: stories.filter((story) => story.section === section.name) })), [stories]);
  const total = grouped.reduce((sum, group) => sum + group.stories.length, 0);

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow"><span>THE DAILY INTELLIGENCE</span><span>ISSUE / {new Date().getFullYear()}</span></p>
        <div className="hero-copy">
          <div><h1 id="page-title">AI 日报</h1><p className="date">{bjDate()} · {issueLabel}</p></div>
          <p className="lede">用更少的噪音，看清今天真正值得跟进的 AI 信号。</p>
        </div>
        <div className="stat-strip" aria-label="日报统计">
          <div className="stat total"><span>{loading ? "…" : total}</span><small>条值得一看</small></div>
          {grouped.map((group) => <div className="stat" key={group.name}><span>{group.stories.length}</span><small>{group.tag}</small></div>)}
        </div>
      </section>

      <nav className="anchors" aria-label="版块导航">
        <span>今日版块</span>{sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.name}>{String(index + 1).padStart(2, "0")} {section.name}</a>)}
      </nav>

      <section className="intro"><p><span className="pulse" /> 数据读取 {loading ? "进行中" : "已完成"}</p><p>北京时间 · 国际与中文公开数据源 · 无当日数据时保留最近一期</p></section>

      <div className="sections">
        {grouped.map((group, groupIndex) => (
          <section className="section" id={`section-${groupIndex + 1}`} key={group.name} aria-labelledby={`heading-${groupIndex + 1}`}>
            <header className="section-head"><div><p>{group.tag} / {String(groupIndex + 1).padStart(2, "0")}</p><h2 id={`heading-${groupIndex + 1}`}>{group.name}</h2></div><span>{group.note}</span></header>
            <div className="card-grid">
              {group.stories.map((story) => {
                const serial = stories.indexOf(story) + 1;
                return <article className="card" key={`${story.title}-${serial}`}>
                  <div className="card-top"><b>{String(serial).padStart(2, "0")}</b><span className="source">{story.source}</span></div>
                  <img className="thumbnail" src={story.image || visualFor(story.section, serial)} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/og.png"; }} />
                  <h3>{story.title}</h3><p className="summary">{story.summary.slice(0, 60)}</p>
                  <footer><time>{story.time}</time><a href={story.url} target="_blank" rel="noopener noreferrer" aria-label={`阅读原文：${story.title}`}>原文 <i>↗</i></a></footer>
                </article>;
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="site-footer"><p>本期共 <strong>{total}</strong> 条</p><p>数据源：Hacker News、OpenAlex、量子位 RSS、极客公园 RSS，以及官方与研究机构公开页面</p><p>AI MORNING SIGNAL · 北京时间呈现</p></footer>
    </main>
  );
}
