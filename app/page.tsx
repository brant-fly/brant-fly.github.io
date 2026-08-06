"use client";

import { useEffect, useMemo, useState } from "react";

type Section = "模型发布/更新" | "产品发布/更新" | "行业动态" | "论文研究" | "技巧与观点";
type Story = { section: Section; title: string; source: string; summary: string; url: string };
type AihotItem = { title: string; summary?: string | null; source?: { name?: string }; links?: { aihot?: string; original?: string } };
type AihotReport = { date?: string; generatedAt?: string; links?: { aihot?: string }; attribution?: { name?: string; url?: string }; sections?: Array<{ label?: string; items?: AihotItem[] }> };

const sourceEndpoint = "https://aihot.virxact.com/api/v1/dailies/latest";
const defaultThumbnail = "/og.png";
const thumbnails: Record<Section, string[]> = {
  "模型发布/更新": ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=80"],
  "产品发布/更新": ["https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"],
  "行业动态": ["https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"],
  "论文研究": ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80"],
  "技巧与观点": ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80"],
};
const sections: Array<{ name: Section; tag: string; note: string }> = [
  { name: "模型发布/更新", tag: "MODEL", note: "能力、价格与可用性" },
  { name: "产品发布/更新", tag: "PRODUCT", note: "工具、功能与体验" },
  { name: "行业动态", tag: "SIGNAL", note: "公司、政策与市场" },
  { name: "论文研究", tag: "PAPER", note: "值得跟进的研究" },
  { name: "技巧与观点", tag: "PRACTICE", note: "方法、判断与工作流" },
];

function bjDate(value?: string) {
  const date = value ? new Date(`${value}T12:00:00+08:00`) : new Date();
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
}

function humanTime(value?: string) {
  if (!value) return "最新一期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "最新一期";
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [report, setReport] = useState<AihotReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadDaily() {
      try {
        const response = await fetch(sourceEndpoint);
        if (!response.ok) throw new Error("AI HOT request failed");
        const payload = await response.json() as { report?: AihotReport };
        if (!payload.report?.sections) throw new Error("AI HOT report missing");
        const nextStories = sections.flatMap(({ name }) => {
          const apiSection = payload.report?.sections?.find((section) => section.label === name);
          return (apiSection?.items || []).map((item) => ({
            section: name,
            title: item.title,
            source: item.source?.name || "AI HOT",
            summary: item.summary || "打开原文了解完整背景与细节。",
            url: item.links?.original || item.links?.aihot || payload.report?.links?.aihot || "https://aihot.virxact.com",
          }));
        });
        if (!nextStories.length) throw new Error("AI HOT report empty");
        if (active) { setStories(nextStories); setReport(payload.report); }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDaily();
    return () => { active = false; };
  }, []);

  const grouped = useMemo(() => sections.map((section) => ({ ...section, stories: stories.filter((story) => story.section === section.name) })), [stories]);
  const total = grouped.reduce((sum, group) => sum + group.stories.length, 0);
  const sourceUrl = report?.links?.aihot || report?.attribution?.url || "https://aihot.virxact.com";

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow"><span>THE DAILY INTELLIGENCE</span><span>ISSUE / {new Date().getFullYear()}</span></p>
        <div className="hero-copy">
          <div><h1 id="page-title">AI 日报</h1><p className="date">{bjDate(report?.date)} · {report ? "AI HOT 最新日报" : "正在获取最新一期"}</p></div>
          <p className="lede">用更少的噪音，看清今天真正值得跟进的 AI 信号。</p>
        </div>
        <div className="stat-strip" aria-label="日报统计">
          <div className="stat total"><span>{loading ? "—" : total}</span><small>条值得一看</small></div>
          {grouped.map((group) => <div className="stat" key={group.name}><span>{group.stories.length}</span><small>{group.tag}</small></div>)}
        </div>
      </section>

      <nav className="anchors" aria-label="版块导航">
        <span>今日版块</span>{sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.name}>{String(index + 1).padStart(2, "0")} {section.name}</a>)}
      </nav>

      <section className="intro"><p><span className="pulse" /> {loading ? "正在读取 AI HOT 最新日报" : error ? "AI HOT 数据暂不可用" : "AI HOT 数据读取已完成"}</p><p>{report?.generatedAt ? `日报生成于北京时间 ${humanTime(report.generatedAt)}` : "AI HOT 会在未生成当日报时返回最近一期"}</p></section>

      <div className="sections">
        {grouped.map((group, groupIndex) => (
          <section className="section" id={`section-${groupIndex + 1}`} key={group.name} aria-labelledby={`heading-${groupIndex + 1}`}>
            <header className="section-head"><div><p>{group.tag} / {String(groupIndex + 1).padStart(2, "0")}</p><h2 id={`heading-${groupIndex + 1}`}>{group.name}</h2></div><span>{group.note}</span></header>
            <div className="card-grid">
              {group.stories.map((story, index) => {
                const serial = stories.indexOf(story) + 1;
                return <article className="card" key={`${story.title}-${serial}`}>
                  <div className="card-top"><b>{String(serial).padStart(2, "0")}</b><span className="source">{story.source}</span></div>
                  <img className="thumbnail" src={thumbnails[story.section][(serial + index) % thumbnails[story.section].length]} alt="AI 资讯主题配图" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaultThumbnail; }} />
                  <h3>{story.title}</h3><p className="summary">{story.summary.slice(0, 60)}</p>
                  <footer><time>{report?.generatedAt ? humanTime(report.generatedAt) : "最新一期"}</time><a href={story.url} target="_blank" rel="noopener noreferrer" aria-label={`阅读原文：${story.title}`}>原文 <i>↗</i></a></footer>
                </article>;
              })}
              {!loading && !group.stories.length && <p className="summary">本期暂无此版块资讯。</p>}
            </div>
          </section>
        ))}
      </div>

      <footer className="site-footer"><p>本期共 <strong>{total}</strong> 条</p><p>数据源：<a href={sourceUrl} target="_blank" rel="noopener noreferrer">AI HOT</a>（仅使用其公开 API 最新日报数据）</p><p>AI MORNING SIGNAL · 北京时间呈现</p></footer>
    </main>
  );
}
