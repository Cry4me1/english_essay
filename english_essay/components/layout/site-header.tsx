import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { label: "落地页", href: "/" },
  { label: "仪表盘", href: "/dashboard" },
  { label: "工作台", href: "/write" },
  { label: "登录", href: "/login" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f7f2]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/40 text-xs tracking-tight">
            AI
          </span>
          <span>Essay Studio</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-black/70 transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/write"
          className="inline-flex items-center gap-1 rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
        >
          开始创作
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

