"use client";

import { useState } from "react";
import Link from "next/link";
import { capitalize } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// imported from monorepo
import { JobResponse } from "~/api/types/get-jobs-api-response";

export function JobList({ jobs_ }: { jobs_: JobResponse[] }) {
  const [sortBy, setSortBy] = useState<"date" | "salary">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  const jobs = jobs_.map((j) => ({
    ...j,
    id: j.job_url,
    date: new Date(j.date),
  }));

  // Calculate pagination values
  // const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const totalPages = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top when changing pages
    // window.scrollTo(0, 0);
  };

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
        {currentJobs.map((job) => (
          <Link
            href={`/jobs/${job.id}`}
            key={job.id}
            className="block border border-gray-200 rounded-md p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{capitalize(job.job_title)}</h3>
                <p className="text-gray-600">{capitalize(job.company)}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-900 font-medium">$0 - $0</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {job.keywords.map((tag) => (
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
              {true && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Crypto Payment
                </span>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-500">
              <p>{job.job_description}</p>
            </div>

            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
              <span>Source: Source</span>
              <span>{formatDate(job.date)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>

              {/* Dynamically generate page numbers (simplified example) */}
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Add more sophisticated logic here for handling many pages (e.g., ellipsis) if needed
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
