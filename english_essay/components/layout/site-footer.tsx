import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#f7f7f2]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-black/60 md:flex-row md:items-center md:justify-between md:px-10">
        <p>© {new Date().getFullYear()} Essay Studio · Mock 版本演示。</p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-black">
            产品预览
          </Link>
          <Link href="/write" className="hover:text-black">
            工作台
          </Link>
          <a
            href="mailto:team@essay.studio"
            className="hidden hover:text-black md:inline-flex"
          >
            联系团队
          </a>
        </div>
      </div>
    </footer>
  );
}

