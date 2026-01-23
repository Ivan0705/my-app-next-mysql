import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export', // ← для Electron нужен экспорт
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@components": path.resolve(__dirname, "components"),
      "@lib": path.resolve(__dirname, "lib"),
      "@app": path.resolve(__dirname, "app"),
      "@processes": path.resolve(__dirname, "processes"),
      "@entities": path.resolve(__dirname, "@entities")
    };

    config.resolve.extensions = [
      ".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss",
    ];

    // Только для Electron
    if (!isServer) {
      config.target = 'electron-renderer';
    }

    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
      child_process: false,
    };

    return config;
  },

  env: {
    IS_ELECTRON: 'true',
  },
};

export default nextConfig;
