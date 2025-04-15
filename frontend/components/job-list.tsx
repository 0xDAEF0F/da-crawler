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
  PaginationEllipsis,
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
  const [currentPage, setCurrentPage] = useState(
    initialPage > 0 ? initialPage : 1,
  );

  const itemsPerPage = 10; // Number of items per page

  const jobs = jobs_.map((j) => ({
    ...j,
    id: j.id,
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Jobs ({jobs.length})</h2>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "salary")}
            className="rounded-md border-gray-300 text-sm focus:border-gray-500 focus:ring-gray-500 focus:outline-none"
          >
            <option value="date">Date</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => {
          return (
            <Link
              href={`/jobs/${job.id}`}
              key={job.id}
              className="block rounded-md border border-gray-200 p-4 transition-colors hover:border-gray-400"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {capitalize(job.job_title)}
                  </h3>
                  <p className="text-gray-600">{capitalize(job.company)}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">$0 - $0</span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {job.keywords.map((tag) => (
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
                {true && (
                  <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    Crypto Payment
                  </span>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {/* <p>{job.job_description}</p> */}
                <p>{job.job_description.slice(0, 50)}...</p>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Source: Source</span>
                <span>{formatDate(job.date)}</span>
              </div>
            </Link>
          );
        })}
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
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>

              {/* TODO: this is garbage but it works */}
              {(() => {
                const pageNumbers = [];
                const pagesToShow = 1; // Show 1 page before and 1 page after the current page
                const startPage = Math.max(1, currentPage - pagesToShow);
                const endPage = Math.min(totalPages, currentPage + pagesToShow);

                // Always show the first page
                if (startPage > 1) {
                  pageNumbers.push(
                    <PaginationItem key={1}>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                        isActive={currentPage === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>,
                  );
                }

                // Show ellipsis before the main range if needed
                if (startPage > 2) {
                  pageNumbers.push(
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>,
                  );
                }

                // Show pages around the current page
                for (let page = startPage; page <= endPage; page++) {
                  // Avoid duplicating the first page if it's already rendered
                  if (page === 1 && startPage > 1) continue;
                  // Avoid duplicating the last page if it will be rendered later
                  if (page === totalPages && endPage < totalPages) continue;

                  pageNumbers.push(
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
                    </PaginationItem>,
                  );
                }

                // Show ellipsis after the main range if needed
                if (endPage < totalPages - 1) {
                  pageNumbers.push(
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>,
                  );
                }

                // Always show the last page
                if (endPage < totalPages) {
                  pageNumbers.push(
                    <PaginationItem key={totalPages}>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(totalPages);
                        }}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>,
                  );
                }

                return pageNumbers;
              })()}

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
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
