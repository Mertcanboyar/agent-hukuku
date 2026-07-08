import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://agenthukuku.com",
  output: "hybrid",          // sayfalar statik; sadece /api/* sunucuda çalışır
  adapter: vercel(),
  integrations: [sitemap()],
});
