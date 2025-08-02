import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use serverExternalPackages for Next.js 15+
  serverExternalPackages: ["mongoose"],

  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;
