import { cleanUrl } from "../utils";
import { type } from "arktype";
import { normalizeWords } from "../utils";
import { KEYWORD_MAPPINGS } from "../constants";

// Job schema in database
export const job = type({
  title: type("string").to("string.lower"),
  company: type("string >= 2").to("string.lower"),
  tags: type("string[]")
    .to("string.lower[]")
    .pipe((tags) => normalizeWords(tags, KEYWORD_MAPPINGS)),
  date: "string.date.iso.parse",
  is_remote: "boolean",
  job_description: "string",
  job_url: type("string"),
  // the `apply_url`
  real_job_url: type("string.url").pipe(cleanUrl),
});

export type Job = typeof job.infer;
