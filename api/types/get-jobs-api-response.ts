import { type } from "arktype";

export const jobResponse = type({
  date: "Date",
  job_title: "string",
  company: "string",
  job_description: "string",
  job_url: "string",
  keywords: "string[]",
  "location?": "string",
  "is_remote?": "boolean",
});

export type JobResponse = typeof jobResponse.infer;
