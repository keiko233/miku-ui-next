import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import unpluginIcons from "unplugin-icons/webpack";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },

  webpack(config) {
    config.plugins.push(
      unpluginIcons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    return config;
  },
};

export default nextConfig;
