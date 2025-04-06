import { normalizeWords } from "../utils";
import {
  KEYWORD_MAPPINGS,
  COUNTRY_MAPPINGS,
  REGION_MAPPINGS,
} from "../constants";
import { type } from "arktype";

// Job AI analysis schema in database
export const jobAiAnalysis = type("string.json.parse").to({
  summary: "string",
  keywords: type("string[]")
    .to("string.lower[]")
    .pipe((a) => normalizeWords(a, KEYWORD_MAPPINGS)),
  job_title: type("string").to("string.lower"),
  is_remote: "boolean | null",
  country: type("string | null").pipe((c) => {
    if (c === null) return null;
    return normalizeWords([c], COUNTRY_MAPPINGS)[0]?.toLowerCase() || null;
  }),
  region: type("string | null").pipe((r) => {
    if (r === null) return null;
    return normalizeWords([r], REGION_MAPPINGS)[0]?.toLowerCase() || null;
  }),
  is_full_time: "boolean | null",
  option_to_pay_in_crypto: "boolean | null",
  compensation_amount: "string | null",
});
