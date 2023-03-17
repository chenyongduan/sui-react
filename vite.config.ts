import { defineConfig } from "vite-react";

export default defineConfig({
  react: {},
  legacy: true,
  html: {},
  server: {
    watchExtend: {},
    qrcode: true,
  },
  resolve: {
    aliasFromTsconfig: {},
  },
});
