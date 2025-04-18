"use client";

import { useState } from "react";
import { GetJobResponse } from "~/api/routes/get-job/get-job.schema";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { capitalize } from "@/lib/utils";

type Props = {
  job: GetJobResponse;
};

export function JobDetail({ job }: Props) {
  const [isApplying, setIsApplying] = useState(false);

  // Determine AI analysis details safely
  // console.log(job.ai_compensation_amount);
  const compensationText = job.ai_compensation_amount
    ? `$${job.ai_compensation_amount.replace("-", " - $")}`
    : "N/A";

  const isFullTime = job.is_full_time ?? false;
  const optionToPayInCrypto = false;
  const aiSummary = job.ai_summary ?? "No summary available.";
  const aiKeywords = job.ai_keywords ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{capitalize(job.title)}</h1>
            <p className="mt-1 text-xl text-gray-600">
              {capitalize(job.company)}
            </p>
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
                className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
              >
                {tag}
              </span>
            );
          })}
          {job.is_remote && (
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
              Remote
            </span>
          )}
          {optionToPayInCrypto && (
            <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800">
              Crypto Payment
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          >
            Apply Now
          </a>
        </div>

        {isApplying && (
          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <h3 className="font-medium">Quick Apply</h3>
            <p className="mt-1 text-sm text-gray-600">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
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
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="mr-3 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-lg font-medium">AI Analysis</h2>
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
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
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
