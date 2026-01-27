import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === 'production';
const repoName = "my-app-next-mysql";

const nextConfig: NextConfig = {
  output: 'export',
  
  // КРИТИЧЕСКИ ВАЖНО для GitHub Pages:
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Добавьте это для исправления CSS путей:
  experimental: {
    // Это заставляет Next.js использовать правильные пути
    turbo: {
      resolveAlias: {
        // Принудительно используем относительные пути
      }
    }
  },
  
  webpack: (config, { isServer }) => {
    // Исправляем пути для статических файлов
    if (!isServer) {
      config.output.publicPath = `./_next/`;
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@components": path.resolve(__dirname, "components"),
      "@lib": path.resolve(__dirname, "lib"),
      "@app": path.resolve(__dirname, "app"),
      "@processes": path.resolve(__dirname, "processes"),
      "@entities": path.resolve(__dirname, "@entities"),
    };
    
    return config;
  },
};

export default nextConfig;
