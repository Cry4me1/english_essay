import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "AI 英语作文工作台 | Essay Studio",
  description: "沉浸式的英语作文创作与批改体验，面向考试与学术写作者。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.variable} ${notoSerif.variable} antialiased`}
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div className="relative min-h-screen bg-grid">
          {/* 装饰性背景光晕 */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div 
              className="absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-30"
              style={{ 
                background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                filter: "blur(60px)"
              }}
            />
            <div 
              className="absolute top-1/2 -left-40 h-80 w-80 rounded-full opacity-20"
              style={{ 
                background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                filter: "blur(80px)"
              }}
            />
            <div 
              className="absolute -bottom-20 right-1/3 h-72 w-72 rounded-full opacity-25"
              style={{ 
                background: "radial-gradient(circle, rgba(91, 95, 199, 0.2) 0%, transparent 70%)",
                filter: "blur(60px)"
              }}
            />
          </div>
          
          <div className="relative z-10">
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 md:px-10">
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
