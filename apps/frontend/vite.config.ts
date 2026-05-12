import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 4200,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // shadcn/ui components live in shared; keep short alias working
      "@/components": path.resolve(__dirname, "./src/shared/components"),

      // Legacy short aliases used across pages/hooks before modularization
      "@/hooks/use-auth": path.resolve(__dirname, "./src/modules/auth/hooks/use-auth"),
      "@/hooks/use-is-admin": path.resolve(__dirname, "./src/modules/auth/hooks/use-is-admin"),
      "@/hooks/use-store": path.resolve(__dirname, "./src/shared/hooks/use-store"),
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
