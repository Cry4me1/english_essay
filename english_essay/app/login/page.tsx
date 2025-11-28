"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  LoaderCircle, 
  Mail, 
  Lock, 
  Sparkles, 
  Check, 
  ArrowUpRight,
  Eye,
  EyeOff,
  Github,
  Chrome
} from "lucide-react";

const mockLoginResponse = {
  status: "sent",
  message: "已向邮箱发送 Magic Link（Mock）",
};

const features = [
  "AI 驱动的写作辅助",
  "专业的雅思/托福评分",
  "实时语法与词汇建议",
  "沉浸式写作环境",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("sent");
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="neu-float p-8 md:p-0 md:grid md:grid-cols-2 overflow-hidden">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
            style={{ 
              background: "linear-gradient(145deg, var(--accent), var(--accent-dark))",
              borderRadius: "28px 0 0 28px"
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
              />
              <div 
                className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
              />
              {/* Floating shapes */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-10 h-16 w-16 rounded-2xl bg-white/10"
              />
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-32 left-10 h-12 w-12 rounded-full bg-white/10"
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Essay Studio</h2>
                  <p className="text-xs text-white/70">AI Writing Assistant</p>
                </div>
              </div>
              
              <h3 className="serif text-3xl text-white mb-4">
                开启你的
                <br />
                <span className="opacity-80">智能写作之旅</span>
              </h3>
              
              <p className="text-sm text-white/70 leading-relaxed">
                加入 Essay Studio，体验 AI 驱动的沉浸式英语写作平台，
                让你的每一篇文章都闪耀光芒。
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <div className="md:p-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-accent mb-6"
              style={{ color: "var(--muted)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="serif text-3xl">{isSignUp ? "创建账户" : "欢迎回来"}</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {isSignUp 
                    ? "注册以开始你的智能写作之旅" 
                    : "当前为前端 Mock，接入 Supabase Auth 后即可使用"
                  }
                </p>
              </div>

              {status !== "sent" ? (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      <Mail className="h-3.5 w-3.5" />
                      邮箱
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="neu-input w-full px-5 py-4 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      <Lock className="h-3.5 w-3.5" />
                      密码
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="neu-input w-full px-5 py-4 pr-12 text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  {!isSignUp && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="neu-inset h-5 w-5 rounded-md flex items-center justify-center">
                          <input type="checkbox" className="sr-only peer" />
                          <Check className="h-3 w-3 opacity-0 peer-checked:opacity-100 transition-opacity" style={{ color: "var(--accent)" }} />
                        </div>
                        <span style={{ color: "var(--muted)" }}>记住我</span>
                      </label>
                      <button type="button" className="hover:text-accent transition-colors" style={{ color: "var(--accent)" }}>
                        忘记密码？
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={status === "loading"}
                    className="neu-button-accent w-full py-4 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        {isSignUp ? "注册" : "登录"}
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="divider-neu" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-xs" style={{ background: "var(--background-elevated)", color: "var(--muted)" }}>
                      或者
                    </span>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="neu-button py-3 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="neu-button py-3 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Chrome className="h-4 w-4" />
                      Google
                    </motion.button>
                  </div>

                  {/* Toggle Sign Up / Sign In */}
                  <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
                    {isSignUp ? "已有账户？" : "还没有账户？"}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="ml-1 font-medium hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {isSignUp ? "立即登录" : "立即注册"}
                    </button>
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="neu-inset p-6 rounded-2xl text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center"
                      style={{ background: "var(--success-bg)" }}
                    >
                      <Check className="h-8 w-8" style={{ color: "var(--success)" }} />
                    </motion.div>
                    <h3 className="serif text-xl mb-2">邮件已发送</h3>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {mockLoginResponse.message}
                    </p>
                  </div>

                  <div className="neu-inset p-4 rounded-xl">
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Mock Response:</p>
                    <pre className="text-xs overflow-x-auto p-3 rounded-lg" style={{ background: "var(--background)" }}>
                      {JSON.stringify(mockLoginResponse, null, 2)}
                    </pre>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStatus("idle")}
                    className="neu-button w-full py-3 text-sm font-medium"
                  >
                    重新发送
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
