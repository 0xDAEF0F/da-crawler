"use client";

import Link from "next/link";

// Mock data based on the schema
const MOCK_RELATED_JOBS = [
  {
    id: 2,
    title: "Frontend Developer",
    company: "Web3 Solutions",
    tags: ["javascript", "react"],
    is_remote: true,
    ai_analysis: {
      summary: "Building UI components for DeFi applications.",
      compensation_amount: "90000-120000",
    },
  },
  {
    id: 3,
    title: "React Engineer",
    company: "DeFi Protocol",
    tags: ["typescript", "react"],
    is_remote: true,
    ai_analysis: {
      summary: "Working on the frontend of a decentralized exchange.",
      compensation_amount: "110000-140000",
    },
  },
  {
    id: 4,
    title: "UI Developer",
    company: "Crypto Exchange",
    tags: ["javascript", "react", "css"],
    is_remote: false,
    ai_analysis: {
      summary: "Creating responsive interfaces for a crypto trading platform.",
      compensation_amount: "100000-130000",
    },
  },
];

export function RelatedJobs({ id }: { id: string }) {
  // In a real app, this would fetch related jobs based on the current job
  const relatedJobs = MOCK_RELATED_JOBS;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-4 text-lg font-medium">Similar Jobs</h2>

      <div className="space-y-3">
        {relatedJobs.map((job) => (
          <Link
            href={`/jobs/${job.id}`}
            key={job.id}
            className="block rounded border border-gray-200 bg-white p-3 transition-colors hover:border-gray-400"
          >
            <h3 className="font-medium">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>

            <div className="mt-2 flex flex-wrap gap-1">
              {job.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {job.is_remote && (
                <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Remote
                </span>
              )}
            </div>

            {job.ai_analysis.compensation_amount && (
              <div className="mt-2 text-sm font-medium">
                ${job.ai_analysis.compensation_amount.replace("-", " - $")}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          View all similar jobs →
        </Link>
      </div>
    </div>
  );
}
