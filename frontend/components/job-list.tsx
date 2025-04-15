"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

export function JobList({
  jobs_,
  totalResults,
}: {
  jobs_: JobResponse[];
  totalResults: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [sortBy, setSortBy] = useState<"date" | "salary">("date");

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);

  const itemsPerPage = 10; // Number of items per page

  const jobs = jobs_.map((j) => ({
    ...j,
    id: j.job_url,
    date: new Date(j.date),
  }));

  const totalPages = Math.floor(totalResults / itemsPerPage);

  const updateUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      updateUrl(page);
    }
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
        {jobs.map((job) => (
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
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
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
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
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
