"use client"

import Link from "next/link"

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
]

export function RelatedJobs({ id }: { id: string }) {
  // In a real app, this would fetch related jobs based on the current job
  const relatedJobs = MOCK_RELATED_JOBS

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h2 className="font-medium text-lg mb-4">Similar Jobs</h2>

      <div className="space-y-3">
        {relatedJobs.map((job) => (
          <Link
            href={`/jobs/${job.id}`}
            key={job.id}
            className="block bg-white p-3 rounded border border-gray-200 hover:border-gray-400 transition-colors"
          >
            <h3 className="font-medium">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>

            <div className="mt-2 flex flex-wrap gap-1">
              {job.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {job.is_remote && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
  )
}
