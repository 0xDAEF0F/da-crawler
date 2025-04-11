"use client"

import { useState } from "react"
import Link from "next/link"

// Mock data based on the schema
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Blockchain Inc",
    source: "cryptocurrencyjobs.co",
    tags: ["javascript", "react", "typescript"],
    date: new Date("2023-05-15"),
    is_remote: true,
    ai_analysis: {
      summary:
        "Senior role focused on building DeFi applications with React and TypeScript. Requires 5+ years of experience.",
      is_full_time: true,
      compensation_amount: "120000-160000",
      option_to_pay_in_crypto: true,
    },
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "TechCorp",
    source: "indeed.com",
    tags: ["python", "django", "postgresql"],
    date: new Date("2023-05-10"),
    is_remote: false,
    ai_analysis: {
      summary: "Backend role working on scaling API infrastructure. Python and Django experience required.",
      is_full_time: true,
      compensation_amount: "100000-130000",
      option_to_pay_in_crypto: false,
    },
  },
  {
    id: 3,
    title: "Blockchain Engineer",
    company: "CryptoStartup",
    source: "cryptocurrencyjobs.co",
    tags: ["solidity", "ethereum", "web3"],
    date: new Date("2023-05-12"),
    is_remote: true,
    ai_analysis: {
      summary: "Building smart contracts and dApps on Ethereum. Strong Solidity skills required.",
      is_full_time: true,
      compensation_amount: "130000-180000",
      option_to_pay_in_crypto: true,
    },
  },
]

export function JobList() {
  const [sortBy, setSortBy] = useState<"date" | "salary">("date")

  // In a real app, this would be filtered based on search params and filters
  const jobs = [...MOCK_JOBS].sort((a, b) => {
    if (sortBy === "date") {
      return b.date.getTime() - a.date.getTime()
    } else {
      const aMin = Number.parseInt(a.ai_analysis.compensation_amount?.split("-")[0] || "0")
      const bMin = Number.parseInt(b.ai_analysis.compensation_amount?.split("-")[0] || "0")
      return bMin - aMin
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Jobs ({jobs.length})</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "salary")}
            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="date">Date</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            href={`/jobs/${job.id}`}
            key={job.id}
            className="block border border-gray-200 rounded-md p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
              </div>
              {job.ai_analysis.compensation_amount && (
                <div className="text-right">
                  <span className="text-gray-900 font-medium">
                    ${job.ai_analysis.compensation_amount.replace("-", " - $")}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {job.tags.map((tag) => (
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
              {job.ai_analysis.option_to_pay_in_crypto && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Crypto Payment
                </span>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-500">
              <p>{job.ai_analysis.summary}</p>
            </div>

            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
              <span>Source: {job.source}</span>
              <span>{formatDate(job.date)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
