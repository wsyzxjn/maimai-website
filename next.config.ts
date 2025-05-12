import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets2.lxns.net",
        port: "",
        pathname: "/maimai/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
