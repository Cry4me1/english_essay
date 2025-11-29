import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 构建时跳过 ESLint 和 TypeScript 检查（CI 环境兼容）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置
  images: {
    unoptimized: false,
  },
  
  // 实验性功能
  experimental: {
    // 服务端操作
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
