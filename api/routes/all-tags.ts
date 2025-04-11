import type { Context } from "hono";
import { prisma } from "../utils/db";
import { uniq } from "lodash";
import { type } from "arktype";

export async function allTags(c: Context) {
  const tags = await prisma.job.findMany({
    select: {
      tags: true,
      ai_analysis: {
        select: {
          keywords: true,
        },
      },
    },
  });

  // Flatten all tags and count their frequency
  const tagFrequencyMap = new Map<string, number>();

  tags.forEach((t) => {
    const combinedTags = [
      ...JSON.parse(t.tags),
      ...(JSON.parse(t.ai_analysis?.keywords ?? "[]") as string[]),
    ];
    combinedTags.forEach((tag) => {
      // const tag_ = tag.toLowerCase().trim();
      tagFrequencyMap.set(tag, (tagFrequencyMap.get(tag) || 0) + 1);
    });
  });

  // Sort tags by frequency in descending order
  const tags_ = uniq(
    Array.from(tagFrequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
  );

  const validated = type("string[]")(tags_);

  // TODO: Abstract this a bit more
  if (validated instanceof type.errors) {
    return c.json(
      {
        error: true,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
  return c.json({
    error: false,
    tags: validated,
  });
}
