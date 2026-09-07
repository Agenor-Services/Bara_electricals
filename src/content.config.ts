import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    answerFirst: z.string(),
    priceRange: z.string().optional(),
    typicalDuration: z.string().optional(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    ).default([]),
    relatedServices: z.array(z.string()).default([]),
    relatedAreas: z.array(z.string()).default([]),
    lastReviewed: z.string().default('7 September 2026'),
    author: z.string().default('Nick'),
    authorRec: z.string().default('REC 29064')
  })
});

const help = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/help" }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    answerFirst: z.string(),
    safetyWarning: z.string(),
    causes: z.array(
      z.object({
        title: z.string(),
        description: z.string()
      })
    ).default([]),
    diyChecks: z.array(z.string()).default([]),
    licensedRequirements: z.array(z.string()).default([]),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    ).default([]),
    relatedService: z.string().default('/services/switchboard-upgrades-melbourne/'),
    lastReviewed: z.string().default('7 September 2026'),
    author: z.string().default('Nick'),
    authorRec: z.string().default('REC 29064')
  })
});

const areas = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/areas" }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    suburb: z.string(),
    postcode: z.string(),
    answerFirst: z.string(),
    housingEra: z.string(),
    typicalIssues: z.array(z.string()).default([]),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    ).default([]),
    lastReviewed: z.string().default('7 September 2026')
  })
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    publishedDate: z.string().default('2026-09-07'),
    lastReviewed: z.string().default('7 September 2026'),
    author: z.string().default('Nick'),
    authorRec: z.string().default('REC 29064')
  })
});

export const collections = { services, help, areas, guides };
