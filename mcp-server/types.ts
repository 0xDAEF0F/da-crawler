import { type } from "arktype";
import { uniq } from "lodash";

const tagMappings = {
  frontend: ["frontend", "front end", "front-end"],
  backend: ["backend", "back end", "back-end"],
  fullstack: ["fullstack", "full stack", "full-stack"],
  react: ["react", "reactjs", "react.js"],
  nodejs: ["node", "nodejs", "node.js"],
  nextjs: ["nextjs", "next.js", "nextjs"],
  ethers: ["ethers", "ethers.js", "ethersjs"],
};

export function normalizeTags(tags: string[]): string[] {
  const uniqueTags = uniq(tags);
  const normalizedTags: string[] = [];

  // Track which normalized tags are present
  const normalizedTagsPresent = new Set<string>();

  // Process each tag
  for (const tag of uniqueTags) {
    let isNormalized = false;

    // Check if tag matches any of our patterns to normalize
    for (const [normalizedTag, variants] of Object.entries(tagMappings)) {
      if (variants.some((variant) => tag.includes(variant))) {
        normalizedTagsPresent.add(normalizedTag);
        isNormalized = true;
        break;
      }
    }

    // If not matching any pattern, keep the original tag
    if (!isNormalized) {
      normalizedTags.push(tag);
    }
  }

  // Add all normalized tags that were found
  return [...normalizedTags, ...normalizedTagsPresent];
}

export const job = type({
  title: type("string").to("string.lower"),
  company: type("string >= 2").to("string.lower"),
  tags: type("string[]").to("string.lower[]").pipe(normalizeTags),
  date: "string.date.iso.parse",
  is_remote: "boolean",
  job_description: "string",
  real_job_url: "string.url",
});

export type Job = typeof job.infer;
