"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Mail, Heart } from "lucide-react";

const footerLinks = [
  { label: "产品预览", href: "/dashboard" },
  { label: "工作台", href: "/write" },
  { label: "登录", href: "/login" },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Mail, href: "mailto:team@essay.studio", label: "Email" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20">
      {/* 装饰分割线 */}
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <div className="divider-neu mb-12" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 md:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div 
                className="icon-container h-8 w-8"
                style={{ background: "linear-gradient(145deg, var(--accent-light), var(--accent))" }}
              >
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <span className="font-semibold">Essay Studio</span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              沉浸式英语写作与批改平台，基于 AI 技术为您提供专业的学术写作辅助。
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="neu-button p-2.5"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" style={{ color: "var(--muted)" }} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              快速链接
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-accent"
                    style={{ color: "var(--foreground)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              技术栈
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js 14", "TypeScript", "Tailwind", "Supabase", "Gemini AI"].map((tech) => (
                <span
                  key={tech}
                  className="badge-neu"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl p-4 sm:flex-row neu-inset"
        >
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} Essay Studio. 保留所有权利。
          </p>
          <p className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
            Made with <Heart className="h-3 w-3 text-red-400" /> by AI Enthusiasts
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
