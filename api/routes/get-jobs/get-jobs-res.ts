import { type } from "arktype";

export const jobResponseSchema = type({
  id: "number",
  publishedAt: "string",
  jobTitle: "string",
  company: "string",
  companyLogoUrl: "string?",
  jobDescription: "string",
  jobUrl: "string",
  jobSummary: "string?", // ai summary
  keywords: "string[]",
  salaryMin: "number | null",
  salaryMax: "number | null",
  location: "string[]?",
  isRemote: "boolean?",
});

export type JobResponse = typeof jobResponseSchema.infer;
