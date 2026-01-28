// next.config.dev.ts - для Vercel и разработки
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  
  // Для Vercel не нужны basePath/assetPrefix
  trailingSlash: false,  // Vercel лучше работает с false
  images: {
    unoptimized: false,  // Vercel оптимизирует изображения
  },
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@components": path.resolve(__dirname, "components"),
      "@lib": path.resolve(__dirname, "lib"),
      "@app": path.resolve(__dirname, "app"),
      "@processes": path.resolve(__dirname, "processes"),
      "@entities": path.resolve(__dirname, "@entities"),
    };

    config.resolve.extensions = [
      ".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss",
    ];

    return config;
  },
};

export default nextConfig;
