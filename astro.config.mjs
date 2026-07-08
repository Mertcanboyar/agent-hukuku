import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://agenthukuku.com",
  output: "static",          // sayfalar statik; prerender=false olan /api/* sunucuda çalışır
  adapter: vercel(),
  integrations: [sitemap()],
});
