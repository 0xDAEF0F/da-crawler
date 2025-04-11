"use client";

import { useState } from "react";

// Mock data based on the schema
const MOCK_JOB = {
  id: 1,
  title: "Senior Frontend Engineer",
  company: "Blockchain Inc",
  source: "cryptocurrencyjobs.co",
  tags: ["javascript", "react", "typescript"],
  date: new Date("2023-05-15"),
  is_remote: true,
  job_description: `
# Senior Frontend Engineer

## About Us
Blockchain Inc is a leading DeFi platform with over $1B in TVL. We're building the future of finance.

## The Role
We're looking for a Senior Frontend Engineer to join our team and help build our next-generation DeFi applications.

## Requirements
- 5+ years of experience with JavaScript and React
- Strong TypeScript skills
- Experience with Web3 technologies
- Excellent problem-solving abilities

## Benefits
- Competitive salary: $120,000 - $160,000
- Option to be paid in crypto
- Fully remote
- Flexible working hours
- Health insurance
- 401(k) matching
  `,
  job_url: "https://example.com/jobs/1",
  job_description_url: "https://example.com/jobs/1/description",
  ai_analysis: {
    job_title: "Senior Frontend Engineer - DeFi",
    summary:
      "Senior role focused on building DeFi applications with React and TypeScript. Requires 5+ years of experience.",
    keywords: "react, typescript, web3, defi, frontend, javascript",
    is_remote: true,
    country: null,
    region: null,
    is_full_time: true,
    compensation_amount: "120000-160000",
    option_to_pay_in_crypto: true,
  },
};

export function JobDetail({ id }: { id: string }) {
  const [isApplying, setIsApplying] = useState(false);

  // In a real app, this would fetch the job by ID
  const job = MOCK_JOB;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-xl text-gray-600 mt-1">{job.company}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">
              ${job.ai_analysis.compensation_amount?.replace("-", " - $")}
            </div>
            {job.ai_analysis.is_full_time && (
              <span className="text-gray-600">Full-time</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
          {job.is_remote && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
              Remote
            </span>
          )}
          {job.ai_analysis.option_to_pay_in_crypto && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
              Crypto Payment
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setIsApplying(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Apply Now
          </button>
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            View Original
          </a>
        </div>

        {isApplying && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium">Quick Apply</h3>
            <p className="text-sm text-gray-600 mt-1">
              Submit your application directly through our platform.
            </p>
            <form className="mt-3 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700"
                >
                  Resume
                </label>
                <input
                  type="file"
                  id="resume"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="prose max-w-none">
          {/* In a real app, you would render the markdown with a library */}
          <div
            dangerouslySetInnerHTML={{
              __html: formatMarkdown(job.job_description),
            }}
          />
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h2 className="text-lg font-medium mb-4">AI Analysis</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Summary</h3>
            <p className="mt-1">{job.ai_analysis.summary}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Keywords</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {job.ai_analysis.keywords.split(", ").map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple markdown formatter for demo purposes
// In a real app, you would use a proper markdown library
function formatMarkdown(markdown: string): string {
  let html = markdown
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gm, "<em>$1</em>")
    .replace(/- (.*)/gm, "<li>$1</li>")
    .replace(/\n\n/gm, "<br/>");

  // Wrap lists
  html = html.replace(/<li>.*?<\/li>/gs, (match) => {
    return `<ul>${match}</ul>`;
  });

  return html;
}
