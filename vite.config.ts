import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/war-animation-library/" : "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5177,
    strictPort: true
  },
  preview: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true
  }
});
