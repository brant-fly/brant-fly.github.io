import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 日报｜晨报仪表盘",
  description: "以北京时间呈现的 AI 早间要闻、论文与实践观点。",
  openGraph: {
    title: "AI 日报｜晨报仪表盘",
    description: "以北京时间呈现的 AI 早间要闻、论文与实践观点。",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image", title: "AI 日报", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
