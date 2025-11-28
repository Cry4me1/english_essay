"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";

const mockLoginResponse = {
  status: "sent",
  message: "已向邮箱发送 Magic Link（Mock）",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("sent");
    }, 900);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-black/10 bg-white/90 p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        返回主页
      </Link>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Login</p>
        <h1 className="serif text-3xl text-black">加入 Essay Studio</h1>
        <p className="text-sm text-black/70">
          当前为前端 Mock，当接入 Supabase Auth 后即可复用同一 UI。
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          邮箱
          <input
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="you@example.com"
            type="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          密码
          <input
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="••••••••"
            type="password"
          />
        </label>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-medium text-white"
        >
          {status === "loading" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              发送中...
            </>
          ) : (
            "登录 / 获取链接"
          )}
        </button>
      </form>

      {status === "sent" && (
        <div className="rounded-2xl border border-dashed border-black/20 bg-[#f7f7f2] p-4 text-xs text-black/70">
          {mockLoginResponse.message}
          <pre className="mt-2 overflow-x-auto">{JSON.stringify(mockLoginResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

