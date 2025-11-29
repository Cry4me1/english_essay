"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, Sparkles, User, LogOut, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();

  // 根据登录状态动态生成导航项
  const navItems = user
    ? [
        { label: "首页", href: "/" },
        { label: "仪表盘", href: "/dashboard" },
        { label: "工作台", href: "/write" },
      ]
    : [
        { label: "首页", href: "/" },
        { label: "登录", href: "/login" },
      ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        isScrolled
          ? "py-3"
          : "py-4"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 border-0 outline-none",
            isScrolled
              ? "neu-raised glass"
              : "bg-transparent"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="icon-container h-10 w-10 transition-all duration-300 group-hover:shadow-lg">
                <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Essay Studio</span>
              <span className="text-[10px] tracking-wider" style={{ color: "var(--muted)" }}>
                AI Writing Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl",
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "var(--background-elevated)",
                        boxShadow: "3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)"
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-10 flex items-center justify-center">
                <LoaderCircle className="h-5 w-5 animate-spin" style={{ color: "var(--muted)" }} />
              </div>
            ) : user ? (
              /* User Menu */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="neu-button flex items-center gap-2 px-3 py-2"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: "var(--accent)", color: "white" }}
                    >
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                    {user.fullName || user.email?.split("@")[0]}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 neu-float p-2 rounded-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="text-sm font-medium truncate">{user.fullName || "用户"}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                          {user.email}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors"
                        >
                          <User className="h-4 w-4" style={{ color: "var(--muted)" }} />
                          仪表盘
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors w-full text-left"
                          style={{ color: "var(--error)" }}
                        >
                          <LogOut className="h-4 w-4" />
                          退出登录
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login Button */
              <Link href="/login" className="hidden sm:inline-flex">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="neu-button px-4 py-2.5 text-sm font-medium"
                >
                  登录
                </motion.div>
              </Link>
            )}

            {/* CTA Button */}
            <Link
              href="/write"
              className="hidden sm:inline-flex"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="neu-button-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
              >
                开始创作
                <ArrowUpRight className="h-4 w-4" />
              </motion.div>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="neu-button p-2.5 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-3 overflow-hidden md:hidden"
            >
              <div className="neu-float p-4 space-y-2">
                {/* User info on mobile */}
                {user && (
                  <div className="px-4 py-3 mb-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt="Avatar" 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ background: "var(--accent)", color: "white" }}
                        >
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{user.fullName || "用户"}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                          isActive
                            ? "neu-inset text-foreground"
                            : "hover:bg-background-elevated text-muted"
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Sign out button on mobile */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-background-elevated"
                      style={{ color: "var(--error)" }}
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + (user ? 1 : 0)) * 0.1 }}
                  className="pt-2"
                >
                  <Link
                    href="/write"
                    onClick={() => setMobileMenuOpen(false)}
                    className="neu-button-accent flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium"
                  >
                    开始创作
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
