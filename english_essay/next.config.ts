import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 确保生成正确的输出格式
  output: undefined, // 使用默认值，让 Netlify 插件处理
  
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
