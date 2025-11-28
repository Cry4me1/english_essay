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
  title: "AI 英语作文工作台",
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
        className={`${inter.variable} ${notoSerif.variable} bg-[#f7f7f2] text-[#050505] antialiased`}
      >
        <div className="min-h-screen bg-[#f7f7f2]">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
