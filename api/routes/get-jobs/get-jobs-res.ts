import { type } from "arktype";

export const jobResponseSchema = type({
  id: "number",
  date: "string",
  job_title: "string",
  company: "string",
  job_description: "string",
  "job_summary?": "string", // ai summary
  job_url: "string",
  keywords: "string[]",
  salary_min: "number",
  salary_max: "number",
  "location?": "string",
  "is_remote?": "boolean",
});

export type JobResponse = typeof jobResponseSchema.infer;
