import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
