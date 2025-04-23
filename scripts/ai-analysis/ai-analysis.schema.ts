import { type } from "arktype";

// Job AI analysis schema in database
export const aiAnalysisSchema = type({
  summary: "string?",
  minSalary: "number?",
  maxSalary: "number?",
  keywords: "string[]",
});
