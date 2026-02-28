import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["toeless-nonconductible-alexzander.ngrok-free.dev"],
    proxy: {
      // 你前端呼叫 /api/... 時，會被轉發到 http://localhost:3000/api/...
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/admin/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
