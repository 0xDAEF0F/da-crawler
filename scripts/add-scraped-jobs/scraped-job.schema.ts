import { type } from "arktype";
import { cleanUrl } from "~/utils/clean-url";
import { KEYWORD_MAPPINGS } from "~/utils/constants";
import { normalizeWords } from "~/utils/normalize-words";

export const scrapedJobSchema = type({
  title: "string.lower |> string.trim",
  company: "string >= 2 |> string.trim |> string.lower",
  tags: type("string[]")
    .to("string.lower[] |> string.trim[]")
    .pipe((tags) => normalizeWords(tags, KEYWORD_MAPPINGS)),
  date: "string.date.iso.parse",
  is_remote: "boolean",
  job_description: "string",
  job_url: type("string"),
  // the `apply_url`
  real_job_url: type("string.url").pipe(cleanUrl),
  min_salary: "number?",
  max_salary: "number?",
});

export type ScrapedJobSchema = typeof scrapedJobSchema.infer;
