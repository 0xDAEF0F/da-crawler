import { type } from "arktype";
import { cleanUrl } from "./clean-url";

export const jobSchema = type({
  title: "string.lower |> string.trim",
  source: "string.lower |> string.trim",
  company: type({
    name: "string.lower |> string.trim",
    logoUrl: "string.url?",
    website: "string.url?",
  }),
  tags: "string.lower[] |> string.trim[]",
  location: "string[]",
  publishedAt: "Date",
  salaryMin: "number?",
  salaryMax: "number?",
  jobDescription: "string",
  // TODO: refine instead of pipe
  jobUrl: type("string.url").pipe((url) => cleanUrl(url)),
  isRemote: "boolean?",
});

export type JobSchema = typeof jobSchema.infer;
