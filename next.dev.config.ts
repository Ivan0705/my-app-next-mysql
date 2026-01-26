import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,

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
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
      ".css",
      ".scss",
    ];

    return config;
  },
};

export default nextConfig;
