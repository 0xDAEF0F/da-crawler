import { type } from "arktype";

export const jobResponseSchema = type({
  id: "number",
  publishedAt: "string",
  jobTitle: "string",
  company: "string",
  jobDescription: "string",
  jobUrl: "string",
  jobSummary: "string?", // ai summary
  keywords: "string[]",
  salaryMin: "number?",
  salaryMax: "number?",
  location: "string[]?",
  isRemote: "boolean?",
});

export type JobResponse = typeof jobResponseSchema.infer;
