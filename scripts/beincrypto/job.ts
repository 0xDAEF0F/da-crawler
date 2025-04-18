import { type } from "arktype";
import { cleanUrl } from "~/utils/clean-url";
import { normalizeWords } from "~/utils/normalize-words";
import { KEYWORD_MAPPINGS } from "~/utils/constants";

// Job schema in database
export const job = type({
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
});

export type Job = typeof job.infer;
