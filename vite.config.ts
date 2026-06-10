import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
    }),
    tanstackStart({
      router: {
        generatedRouteTree: `route-tree.gen.ts`,
        routeTreeFileHeader: [`/* oxlint-disable */`],
        routeFileIgnorePattern: "_modules",
      },
    }),
    viteReact(),
    tailwindcss(),
    Icons({ compiler: "jsx", jsx: "react" }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
