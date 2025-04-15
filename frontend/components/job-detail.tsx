"use client";

import { useState } from "react";
import { GetJobResponse } from "~/api/routes/get-job"; // Assuming path

// Mock data based on the schema - REMOVED
// const MOCK_JOB = { ... };

// Simple markdown formatter (moved up for clarity)
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

type Props = {
  job: GetJobResponse;
};

export function JobDetail({ job }: Props) {
  const [isApplying, setIsApplying] = useState(false);

  // Determine AI analysis details safely
  const compensationText = job.ai_compensation_amount
    ? `$${job.ai_compensation_amount.replace("-", " - $")}`
    : "N/A";
  const isFullTime = job.is_full_time ?? false;
  const optionToPayInCrypto = false;
  const aiSummary = job.ai_summary ?? "No summary available.";
  const aiKeywords = job.ai_keywords ?? [];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-xl text-gray-600 mt-1">{job.company}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">{compensationText}</div>
            {isFullTime && <span className="text-gray-600">Full-time</span>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.keywords?.map((tag) => {
            return (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            );
          })}
          {job.is_remote && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
              Remote
            </span>
          )}
          {optionToPayInCrypto && (
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
            href={job.job_url} // Use job_url from prop
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
          {/* Render the markdown from the job prop */}
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
            <p className="mt-1">{aiSummary}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Keywords</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {aiKeywords.map((keyword: string) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          {/* Display other AI analysis fields if needed */}
        </div>
      </div>
    </div>
  );
}

// Removed formatMarkdown from here as it was moved up
