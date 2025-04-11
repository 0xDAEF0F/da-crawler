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

Respond in a stringified JSON format with the following information:

"job_title": string, // Best representation of the job title
"summary": string, // Summary of the job description
"keywords": string[], // 3-5 keywords that best represent the role's essence
"is_remote": boolean | null, // Whether the job is remote 
"country": string | null, // Country the job is focused on 
"region": string | null, // Region of job is focused on 
"is_full_time": boolean | null, // Whether the job is full time 
"option_to_pay_in_crypto": boolean | null, // Whether the job can pay in cryptocurrencies 
"compensation_amount": string | null, // Compensation amount in USD per year. e.g., "100000-120000"

Notes:
- Avoid generic terms (e.g., "communication") unless explicitly tied to a unique job requirement.
- The text output will be applied a "JSON.parse()" so make sure it is valid.
`;

const jobs = await prisma.job.findMany({
  where: {
    ai_analysis: null,
  },
  orderBy: {
    date: "desc",
  },
});

console.log(`--- ${jobs.length} jobs to analyze`);

const jobsSummaries = (
  await Promise.all(
    jobs.map(async (job) => {
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
      return {
        job,
        summary: summary.choices[0]?.message?.content,
      };
    })
  )
).filter((job) => job.summary);

for (const job_ of jobsSummaries) {
  const { job, summary } = job_;
  const summary_ = jobAiAnalysis(summary);

  if (summary_ instanceof type.errors) {
    console.error(`Failed to analyze job ${job.title}`);
    console.log(`Reason: ${summary_.summary}`);
    continue;
  }

  console.log(`Analyzed job ${job.title}@${job.company}`);

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

console.log(`--- ${jobs.length} jobs analyzed`);
