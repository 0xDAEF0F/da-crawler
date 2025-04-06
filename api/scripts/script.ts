import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import dotenv from "dotenv";
import { type } from "arktype";
import { jobAiAnalysis } from "../types/job-ai-analysis";

dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prisma = new PrismaClient();

const summarizePrompt = `
Summarize the job description as concisely as possible, excluding redundant details (e.g., "must be
a team player" or "punctuality required") or obvious information (e.g., "must follow company policies")
that applies to most jobs and isn't critical for the applicant to understand the role. Focus on the
core responsibilities, requirements, and unique aspects of the position.

Respond in a stringified JSON format with the following structure:
{
  "summary": string,
  "keywords": string[],
  "is_remote": boolean | null,
  "job_title": string,
  "country": string | null,
  "region": string | null,
  "is_full_time": boolean | null,
  "option_to_pay_in_crypto": boolean | null,
  "compensation_amount": string | null,
}

Notes:
- The 'job_title' should be a job title that more closely describes the job.
- The 'is_remote' should be true if the job is remote, false if it is not, and null if it is not clear.
- The 'country' should be a string of the country the job is focused on, or null if it is not focused on a specific country.
- The 'region' should be a string of the region the job is focused on, or null if it is not focused on a specific region.
- The 'is_full_time' should be true if the job is full time, false if it is not, and null if it is not clear.
- The 'compensation_amount' should be the amount of compensation the job pays (in USD per year),
  or null if unclear. e.g., "$100,000 - $120,000" should be "100000-120000"
- The 'option_to_pay_in_crypto' should be true if the job can pay in cryptocurrencies, false if it
  is not, and null if it is not clear.
- Select the most critical keywords based on frequency, specificity, or importance to the role
  (e.g., technologies like "python" or "sql", certifications like "cpa", or skills like "project management").
- If the job description is unclear or lacks distinct keywords, prioritize terms that best represent the role's essence.
- Avoid generic terms (e.g., "communication") unless explicitly tied to a unique job requirement.
`;

const jobs = await prisma.job.findMany();

for (const job of jobs) {
  const summary = await openai.chat.completions.create({
    model: "openrouter/quasar-alpha",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: summarizePrompt },
          { type: "text", text: `JOB DESCRIPTION: ${job.job_description}` },
        ],
      },
    ],
  });

  const summary_ = jobAiAnalysis(summary.choices[0]?.message.content);

  if (summary_ instanceof type.errors) {
    console.error(summary_.summary);
    continue;
  }

  console.log(summary_);

  await prisma.jobAiAnalysis.create({
    data: {
      job: {
        connect: {
          id: job.id,
        },
      },
      option_to_pay_in_crypto: summary_.option_to_pay_in_crypto,
      job_title: summary_.job_title,
      summary: summary_.summary,
      keywords: JSON.stringify(summary_.keywords),
      is_remote: summary_.is_remote,
      country: summary_.country,
      region: summary_.region,
      is_full_time: summary_.is_full_time,
    },
  });
}
