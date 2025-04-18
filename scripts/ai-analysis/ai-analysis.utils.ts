import { type Job } from "@prisma/client";
import dotenv from "dotenv";
import { aiAnalysisSchema } from "./ai-analysis.schema";
import OpenAI from "openai";
dotenv.config();

const AI_MODEL = "google/gemini-2.0-flash-001";
const PROMPT = `
Summarize the job description as concisely as possible, excluding redundant details (e.g., "must be
a team player" or "punctuality required") or obvious information (e.g., "must follow company policies")
that applies to most jobs and isn't critical for the applicant to understand the role. Focus on the
core responsibilities, requirements, and unique aspects of the position. Omit the name of the company
and the job title in the summary.
`;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Summarizes a job description using the AI model and prompt.
 * @param job - The job to summarize.
 * @returns The summarized job description (can throw an error if the AI model returns an error or
 * validation fails).
 */
export async function summarizeJob(job: Job): Promise<typeof aiAnalysisSchema.infer> {
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: PROMPT,
      },
      {
        role: "user",
        content: `Job Description:\n${job.job_description}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "save_ai_analysis",
          description: "Saves the AI analysis of the job description.",
          parameters: aiAnalysisSchema.toJsonSchema() as any,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "save_ai_analysis" } },
  });

  const data = completion.choices[0]?.message.tool_calls?.[0]?.function?.arguments;

  if (!data) {
    throw new Error("No data returned from OpenAI");
  }

  return aiAnalysisSchema.assert(JSON.parse(data));
}
