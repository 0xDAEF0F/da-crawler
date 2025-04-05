import { uniq } from "lodash";
import { KEYWORD_MAPPINGS } from "../constants";

export function normalizeTags(tags: string[]): string[] {
  const uniqueTags = uniq(tags);
  const normalizedTags: string[] = [];

  // Track which normalized tags are present
  const normalizedTagsPresent = new Set<string>();

  // Process each tag
  for (const tag of uniqueTags) {
    let isNormalized = false;

    // Check if tag matches any of our patterns to normalize
    for (const [normalizedTag, variants] of Object.entries(KEYWORD_MAPPINGS)) {
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

export function cleanUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

    // Check if the last segment contains 'application' or 'apply'
    const lastSegment =
      pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
    if (
      lastSegment &&
      (lastSegment.includes("application") || lastSegment.includes("apply"))
    ) {
      pathSegments.pop();
    }

    // Reconstruct pathname without trailing slash
    parsedUrl.pathname =
      pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";

    return parsedUrl.toString();
  } catch (error) {
    // Return original URL if parsing fails
    return url;
  }
}
