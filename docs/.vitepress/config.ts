import { defineConfig } from "vitepress";

export default defineConfig({
  title: "cloudflare-toys",
  description: "Small typed helpers for Cloudflare Workers-adjacent projects.",
  base: "/cloudflare-toys/",
  cleanUrls: true,
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
        text: "Analytics",
        items: [{ text: "Workers Analytics Engine", link: "/wae" }],
      },
      {
        text: "Miscellaneous",
        items: [{ text: "Better Auth", link: "/better-auth" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/D4ario0/cloudflare-toys" },
    ],
  },
});
