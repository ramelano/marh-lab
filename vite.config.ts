import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    open: true,
    allowedHosts: [
      "4173-iur1fbe6hi1ils8utcn1i-bd76213d.sg2.manus.computer",
      "5173-ipqqid38kipki2o9ra18w-5a7a9d10.sg2.manus.computer",
    ],
  },
});
