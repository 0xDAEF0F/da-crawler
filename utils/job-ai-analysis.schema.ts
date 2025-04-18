import { type } from "arktype";

export const jobAiAnalysisSchema = type({
  job_id: "number",
  job_title: "string",
  summary: "string",
  keywords: "string[]",
  is_remote: "boolean?",
  country: "string?",
  region: "string?",
  is_full_time: "boolean?",
  option_to_pay_in_crypto: "boolean?",
  compensation_amount: "string?",
});
