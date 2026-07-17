import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

export default defineConfig({
  title: "cloudflare-toys",
  description: "Small typed helpers for Cloudflare Workers-adjacent projects.",
  base: "/cloudflare-toys/",
  cleanUrls: true,
  vite: {
    // @ts-expect-error VitePress alpha and the plugin resolve separate Vite type instances.
    plugins: [llmstxt({ excludeIndexPage: false })],
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "GitHub", link: "https://github.com/D4ario0/cloudflare-toys" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [{ text: "Getting Started", link: "/" }],
      },
      {
        text: "Images",
        items: [
          { text: "Storage API", link: "/images" },
          { text: "Delivery Variants", link: "/variants" },
        ],
      },
      {
        text: "Security",
        items: [{ text: "Turnstile", link: "/turnstile" }],
      },
      {
        text: "Email",
        items: [{ text: "Unemail", link: "/unemail" }],
      },
      {
        text: "Analytics",
        items: [{ text: "Workers Analytics Engine", link: "/wae" }],
      },
      {
        text: "Miscellaneous",
        items: [
          { text: "Better Auth", link: "/better-auth" },
          { text: "Drizzle KV Cache", link: "/drizzle-kv-cache" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/D4ario0/cloudflare-toys" },
    ],
  },
});
