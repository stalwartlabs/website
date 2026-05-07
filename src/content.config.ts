import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

// ----- Shared primitives -----

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
  primary: z.boolean().default(true),
  external: z.boolean().default(false),
});

const visualSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("screenshot"),
    src: z.string(),
    alt: z.string(),
    url: z.string().optional(),
    glow: z.boolean().default(false),
    tilt: z.boolean().default(false),
    frame: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("diagram"),
    id: z.string(),
  }),
  z.object({
    kind: z.literal("placeholder"),
    caption: z.string(),
    aspect: z.string().default("16 / 10"),
  }),
  z.object({
    kind: z.literal("code"),
    lang: z.string().default("text"),
    body: z.string(),
    filename: z.string().optional(),
    prompt: z.string().optional(),
  }),
]);

const heroSchema = z.object({
  eyebrow: z.string().optional(),
  banner: z
    .object({
      tone: z.enum(["info", "warn"]).default("info"),
      label: z.string(),
      body: z.string(),
    })
    .optional(),
  title: z.string(),
  titleHighlight: z.string().optional(),
  lead: z.string().optional(),
  ctas: z.array(ctaSchema).default([]),
  meta: z.array(z.string()).default([]),
  visual: visualSchema.optional(),
});

const ctaCardSchema = z.object({
  cta: z.string(),
  ctaSub: z.string(),
  ctaButton: z.string(),
  ctaLink: z.string(),
});

// ----- Section kinds -----

const featureSection = z.object({
  kind: z.literal("feature"),
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  learnMore: z.array(ctaSchema).default([]),
  visual: visualSchema.optional(),
  reverse: z.boolean().default(false),
  band: z.enum(["default", "alt"]).default("default"),
});

const proseSection = z.object({
  kind: z.literal("prose"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string(),
  band: z.enum(["default", "alt"]).default("default"),
});

const listSection = z.object({
  kind: z.literal("list"),
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
  bullets: z.array(z.string()),
  band: z.enum(["default", "alt"]).default("default"),
});

const pillarGridSection = z.object({
  kind: z.literal("pillar-grid"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  items: z.array(
    z.object({
      icon: z.enum(["mail", "users", "shield", "cpu", "zap", "globe", "lock"]),
      title: z.string(),
      body: z.string(),
      href: z.string(),
    })
  ),
});

const featureGridSection = z.object({
  kind: z.literal("feature-grid"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  items: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
      href: z.string(),
    })
  ),
});

const ctaCalloutSection = z.object({
  kind: z.literal("cta-callout"),
  title: z.string(),
  body: z.string().optional(),
  ctas: z.array(ctaSchema),
  band: z.enum(["default", "alt"]).default("default"),
});

const faqSection = z.object({
  kind: z.literal("faq"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

const addressesSection = z.object({
  kind: z.literal("addresses"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  items: z.array(
    z.object({
      label: z.string(),
      lines: z.array(z.string()).optional(),
      email: z.string().optional(),
    })
  ),
});

const comparisonTablesSection = z.object({
  kind: z.literal("comparison-tables"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  legend: z.string().optional(),
  columns: z.tuple([z.string(), z.string()]),
  band: z.enum(["default", "alt"]).default("default"),
  groups: z.array(
    z.object({
      title: z.string(),
      rows: z.array(z.tuple([z.string(), z.string(), z.string()])),
    })
  ),
  ctas: z.array(ctaSchema).default([]),
});

const pricingTiersSection = z.object({
  kind: z.literal("pricing-tiers"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  // Tier rates in each currency, ordered ascending by upper-bound mailbox count.
  // The last tier has upper: null (open-ended).
  tiers: z.array(
    z.object({
      lower: z.number(),
      upper: z.number().nullable(),
      eur: z.number(),
      usd: z.number(),
    })
  ),
  // Below this max, show a price; at-or-above, show "Obtain quote" CTA in the table.
  showTableBelow: z.number().default(100_000),
  quoteCta: ctaSchema.optional(),
});

const calculatorSection = z.object({
  kind: z.literal("calculator"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  // Calculator reads the same tier table from a sibling pricing-tiers section.
  premiumSupportThreshold: z.number().default(150),
});

const contactFormSection = z.object({
  kind: z.literal("contact-form"),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  band: z.enum(["default", "alt"]).default("default"),
  action: z.string(),
  topics: z.array(z.union([z.string(), z.object({ label: z.string(), value: z.string().optional() })])),
  mailboxRanges: z.array(z.union([z.string(), z.object({ label: z.string(), value: z.string().optional() })])),
  supportRedirectTopic: z.string().optional(),
  submitLabel: z.string().default("Send message"),
});

const sectionSchema = z.discriminatedUnion("kind", [
  featureSection,
  proseSection,
  listSection,
  pillarGridSection,
  featureGridSection,
  ctaCalloutSection,
  faqSection,
  addressesSection,
  comparisonTablesSection,
  pricingTiersSection,
  calculatorSection,
  contactFormSection,
]);

// ----- Page collection -----

const pages = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    layout: z.enum(["default", "long-form"]).default("default"),
    hero: heroSchema.optional(),
    sections: z.array(sectionSchema).default([]),
    footerCta: ctaCardSchema.optional(),
    // For long-form (legal) pages
    longForm: z
      .object({
        body: z.string(),
        toc: z
          .array(z.object({ id: z.string(), label: z.string() }))
          .optional(),
        lastUpdated: z.string().optional(),
      })
      .optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    lastUpdated: z.string().optional(),
  }),
});

const docs = defineCollection({
  // Custom generateId preserves dots in slugs (Astro's default sluggifier
  // strips them, which would turn /docs/0.15/... into /docs/015/... and
  // break the URLs preserved from the Docusaurus version of the site).
  loader: docsLoader({
    generateId: ({ entry }) => {
      // Strip extension; index.* renders at its parent directory's URL.
      let id = entry.replace(/\.mdx?$/, "").replace(/(^|\/)index$/, "");
      return id
        .split("/")
        .map((seg) =>
          seg
            .toLowerCase()
            // Keep dots and dashes (the rest of the project relies on
            // /docs/0.15/...); collapse anything else to a single dash to
            // match github-slugger's behaviour for normal segments.
            .replace(/[^a-z0-9.\-]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        )
        .filter(Boolean)
        .join("/");
    },
  }),
  schema: docsSchema({
    extend: (context) => blogSchema(context),
  }),
});

export const collections = { pages, legal, docs };
