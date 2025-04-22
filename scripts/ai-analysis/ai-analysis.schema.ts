import { type } from "arktype";

// Job AI analysis schema in database
export const aiAnalysisSchema = type({
  "summary?": "string > 0",
  min_salary: "number = 0",
  max_salary: "number = 0",
  keywords: "string[]",
});
