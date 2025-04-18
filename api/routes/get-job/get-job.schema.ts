import { type } from "arktype";

export type GetJobResponse = typeof getJobSchema.infer;

// TODO: fix this schema (this is disgusting)
export const getJobSchema = type({
  id: "number",
  title: "string",
  company: "string",
  keywords: "string.json.parse |> string[]",
  date: "Date",
  job_description: "string",
  "is_full_time?": "boolean | undefined | null",
  job_url: "string",
  is_remote: "boolean",
  "location?": "string | undefined | null",
  // ai analysis
  "ai_summary?": "string | undefined | null",
  "ai_keywords?": "(string.json.parse |> string[]) | undefined | null",
  "ai_location?": "string | undefined | null",
  "ai_compensation_amount?": "string | undefined | null",
});
