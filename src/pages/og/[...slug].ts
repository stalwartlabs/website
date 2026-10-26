import { OGImageRoute } from "astro-og-canvas";
import { getCollection, type CollectionEntry } from "astro:content";

const allDocs = await getCollection("docs");

// Build /og/blog/<slug>.png for every blog post.
const pages = Object.fromEntries(
  allDocs
    .filter((entry) => entry.id.startsWith("blog/"))
    .map((entry: CollectionEntry<"docs">) => {
      const slug = entry.id.replace(/\.mdx?$/, "");
      return [slug, entry];
    }),
);

// Stalwart brand palette mirrors src/styles/tokens.css.
const BG: [number, number, number][] = [
  [245, 242, 236],
  [235, 229, 218],
];
const BORDER: [number, number, number] = [219, 45, 84];
const TEXT: [number, number, number] = [28, 26, 23];
const MUTED: [number, number, number] = [90, 83, 75];

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page: CollectionEntry<"docs">) => {
    const data = page.data as Record<string, unknown> & {
      title: string;
      description?: string;
      excerpt?: string;
    };
    const description =
      typeof data.description === "string" && data.description.length
        ? data.description
        : typeof data.excerpt === "string"
          ? // Strip basic Markdown so the OG card stays readable.
            data.excerpt
              .replace(/`([^`]+)`/g, "$1")
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              .replace(/[*_]+/g, "")
              .slice(0, 220)
          : "Open-source mail and collaboration server.";

    return {
      title: data.title,
      description,
      bgGradient: BG,
      border: { color: BORDER, width: 6, side: "block-start" },
      padding: 70,
      logo: {
        path: "./public/img/og-logo.png",
        size: [280],
      },
      font: {
        title: {
          size: 64,
          weight: "ExtraBold",
          families: ["Plus Jakarta Sans"],
          color: TEXT,
          lineHeight: 1.12,
        },
        description: {
          size: 28,
          families: ["Inter"],
          color: MUTED,
          lineHeight: 1.4,
        },
      },
      fonts: [
        "./src/assets/og-fonts/plus-jakarta-sans-800.ttf",
        "./src/assets/og-fonts/inter-400.ttf",
      ],
    };
  },
});
