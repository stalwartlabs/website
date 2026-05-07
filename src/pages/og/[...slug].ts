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
  [12, 12, 18],
  [20, 12, 22],
];
const BORDER: [number, number, number] = [219, 45, 84];
const TEXT: [number, number, number] = [244, 244, 246];
const MUTED: [number, number, number] = [163, 163, 173];

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
        path: "./public/favicon.svg",
        size: [64],
      },
      font: {
        title: {
          size: 64,
          weight: "ExtraBold",
          color: TEXT,
          lineHeight: 1.12,
        },
        description: {
          size: 28,
          color: MUTED,
          lineHeight: 1.4,
        },
      },
    };
  },
});
