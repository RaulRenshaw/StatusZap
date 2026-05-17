import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svgr from "vite-plugin-svgr";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 4200,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),

      // shadcn/ui components live in shared; keep short alias working
      "@/components": path.resolve(rootDir, "./src/shared/components"),

      // Legacy short aliases used across pages/hooks before modularization
      "@/hooks/use-auth": path.resolve(rootDir, "./src/modules/auth/hooks/use-auth"),
      "@/hooks/use-is-admin": path.resolve(rootDir, "./src/modules/auth/hooks/use-is-admin"),
      "@/hooks/use-store": path.resolve(rootDir, "./src/shared/hooks/use-store"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
