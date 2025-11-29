"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Wand2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const features = [
  "AI 驱动的写作辅助",
  "专业的雅思/托福评分",
  "实时语法与词汇建议",
  "沉浸式写作环境",
];

type LoginMode = "password" | "magic-link";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { signInWithPassword, signUp, signInWithMagicLink, signInWithOAuth, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 处理 URL 中的错误参数
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_callback_error") {
      setError("认证失败，请重试");
    }
  }, [searchParams]);

  const resetForm = () => {
    setStatus("idle");
    setMessage("");
    setError("");
  };

  const handlePasswordAuth = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (isSignUp) {
      // 注册
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
        setStatus("error");
      } else if (result.requiresEmailConfirmation) {
        setMessage("注册成功！请查收邮箱验证链接");
        setStatus("success");
      }
      // 如果直接成功，useAuth hook 会处理跳转
    } else {
      // 登录
      const result = await signInWithPassword(email, password);
      if (result.error) {
        setError(result.error);
        setStatus("error");
      }
      // 成功时 useAuth hook 会处理跳转
    }
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const result = await signInWithMagicLink(email);
    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setMessage("登录链接已发送到您的邮箱，请查收");
      setStatus("success");
    }
  };

  const handleGitHubLogin = async () => {
    setStatus("loading");
    setError("");
    
    const result = await signInWithOAuth("github");
    if (result.error) {
      setError(result.error);
      setStatus("idle");
    }
    // OAuth 会重定向，不需要手动处理成功
  };

  const handleSubmit = (e: FormEvent) => {
    if (loginMode === "magic-link") {
      handleMagicLink(e);
    } else {
      handlePasswordAuth(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

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
                    : "使用邮箱密码或第三方账号登录"
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: "var(--error-bg)", color: "var(--error)" }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {status === "success" ? (
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
                    <h3 className="serif text-xl mb-2">
                      {loginMode === "magic-link" ? "邮件已发送" : "注册成功"}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {message}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetForm}
                    className="neu-button w-full py-3 text-sm font-medium"
                  >
                    返回登录
                  </motion.button>
                </motion.div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Login Mode Toggle (only for login, not signup) */}
                  {!isSignUp && (
                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--background)" }}>
                      <button
                        type="button"
                        onClick={() => { setLoginMode("password"); resetForm(); }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          loginMode === "password" ? "neu-float" : ""
                        }`}
                        style={{ 
                          color: loginMode === "password" ? "var(--foreground)" : "var(--muted)"
                        }}
                      >
                        <Lock className="h-3.5 w-3.5 inline mr-1.5" />
                        密码登录
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLoginMode("magic-link"); resetForm(); }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          loginMode === "magic-link" ? "neu-float" : ""
                        }`}
                        style={{ 
                          color: loginMode === "magic-link" ? "var(--foreground)" : "var(--muted)"
                        }}
                      >
                        <Wand2 className="h-3.5 w-3.5 inline mr-1.5" />
                        Magic Link
                      </button>
                    </div>
                  )}

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
                      onChange={(e) => setEmail(e.target.value)}
                      className="neu-input w-full px-5 py-4 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password Input (only for password mode or signup) */}
                  {(loginMode === "password" || isSignUp) && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        <Lock className="h-3.5 w-3.5" />
                        密码 {isSignUp && <span className="normal-case">(至少6位)</span>}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="neu-input w-full px-5 py-4 pr-12 text-sm"
                          placeholder="••••••••"
                          minLength={6}
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
                  )}

                  {/* Magic Link hint */}
                  {loginMode === "magic-link" && !isSignUp && (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      我们将发送一个登录链接到您的邮箱，点击即可登录，无需密码
                    </p>
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
                        {isSignUp 
                          ? "注册" 
                          : loginMode === "magic-link" 
                            ? "发送登录链接" 
                            : "登录"
                        }
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

                  {/* Social Login - GitHub Only (国内可用) */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGitHubLogin}
                    disabled={status === "loading"}
                    className="neu-button w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    使用 GitHub 登录
                  </motion.button>

                  {/* Toggle Sign Up / Sign In */}
                  <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
                    {isSignUp ? "已有账户？" : "还没有账户？"}
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(!isSignUp); resetForm(); setLoginMode("password"); }}
                      className="ml-1 font-medium hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {isSignUp ? "立即登录" : "立即注册"}
                    </button>
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
