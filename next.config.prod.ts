import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export', // ТОЛЬКО для продакшена
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
