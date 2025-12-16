import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import unpluginIcons from "unplugin-icons/webpack";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  webpack(config) {
    config.plugins.push(
      unpluginIcons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    return config;
  },

  async rewrites() {
    return [
      {
        source: "/__scheduled",
        destination: "/api/scheduled",
      },
    ];
  },
};

export default nextConfig;
