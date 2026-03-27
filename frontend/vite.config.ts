import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep this config lightweight so the project is easy to extend.
export default defineConfig({
  plugins: [react()]
});
