import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "英単語8択クイズ",
        short_name: "単語クイズ",
        description: "CSV同梱データで学べる英語から日本語への8択クイズ",
        display: "standalone",
        start_url: ".",
        scope: ".",
        theme_color: "#2563eb",
        background_color: "#f8fafc",
        icons: [
          {
            src: "icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,csv}"]
      }
    })
  ]
});
