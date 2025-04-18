import { uniq } from "lodash";

/**
 * Normalizes an array of words by replacing them with their normalized counterparts
 * based on the provided mappings.
 *
 * @param words - The array of words to normalize.
 * @param mappings - The mappings of normalized words to their variants.
 * @returns The normalized words.
 */
export function normalizeWords(
  words: string[],
  mappings: Record<string, string[]>
): string[] {
  const uniqueWords = uniq(words.map((word) => word.toLowerCase()));
  const normalizedWords: string[] = [];

  // Track which normalized tags are present
  const normalizedTagsPresent = new Set<string>();

  // Process each tag
  for (const tag of uniqueWords) {
    let isNormalized = false;

    // Check if tag matches any of our patterns to normalize
    for (const [normalizedTag, variants] of Object.entries(mappings)) {
      if (variants.some((variant) => tag.includes(variant))) {
        normalizedTagsPresent.add(normalizedTag);
        isNormalized = true;
        break;
      }
    }

    // If not matching any pattern, keep the original tag
    if (!isNormalized) {
      normalizedWords.push(tag);
    }
  }

  // Add all normalized tags that were found
  return [...normalizedWords, ...normalizedTagsPresent];
}
