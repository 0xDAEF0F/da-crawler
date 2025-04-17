import { type } from "arktype";

export const jobResponseSchema = type({
  id: "number",
  date: "string.date",
  job_title: "string",
  company: "string",
  job_description: "string",
  job_url: "string",
  keywords: "string[]",
  "location?": "string",
  "is_remote?": "boolean",
  "compensation_amount?": "string",
});

export type JobResponse = typeof jobResponseSchema.infer;
