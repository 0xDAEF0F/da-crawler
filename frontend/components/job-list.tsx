"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { capitalize, cn, extractSource } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { JobResponse } from "~/api/routes/get-jobs/get-jobs-res";
import Summary from "./job-card/summary";

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

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      // Keep existing page if possible, otherwise reset to 1 when limit changes
      history: "replace",
      shallow: false, // Use shallow routing false to trigger server refetch
    }),
  );
  const [itemsPerPage, setItemsPerPage] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({
      history: "replace",
      shallow: false, // Use shallow routing false to trigger server refetch
    }),
  );

  const jobs = jobs_.map((j) => ({
    ...j,
    id: j.id,
    date: new Date(j.date),
  }));

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLimitChange = (limitStr: string) => {
    const newLimit = parseInt(limitStr, 10);
    if ([10, 20, 30, 40, 50].includes(newLimit)) {
      const newTotalPages = Math.ceil(totalResults / newLimit);
      const newPage = Math.min(currentPage ?? 1, newTotalPages); // Ensure page stays within bounds
      // Set limit first, then page if it needs adjustment
      setItemsPerPage(newLimit).then(() => {
        if (currentPage !== newPage && newPage > 0) {
          setCurrentPage(newPage > 0 ? newPage : 1);
        } else if (currentPage === newPage) {
          // If page doesn't change, ensure URL updates if needed (e.g., back button state)
          // This might not be strictly necessary depending on nuqs behavior, but safer
          setCurrentPage(currentPage);
        }
      });
    }
  };

  // Add logic to disable page size options that aren't relevant
  const limitOptions = [10, 20, 30, 40, 50];
  const nextAboveLimit = limitOptions.find((l) => l >= totalResults);

  const isLimitDisabled = (limit: number) => {
    if (limit <= totalResults) return false;
    if (limit === nextAboveLimit) return false;
    return true;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Jobs ({jobs.length} of {totalResults})
        </h2>
        <div className="flex items-center space-x-4">
          {/* Items per page selector */}
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-[80px] text-sm focus:ring-gray-500 focus:outline-none">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((limit) => (
                  <SelectItem
                    key={limit}
                    value={limit.toString()}
                    disabled={isLimitDisabled(limit)}
                  >
                    {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Sort by selector */}
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
      </div>

      <div className="space-y-4">
        {jobs.map((job) => {
          return (
            <div
              key={job.id}
              className="block rounded-md border border-gray-200 p-4 transition-colors hover:border-gray-400"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/jobs/${job.id}`} className="cursor-pointer">
                    <h3 className="text-lg font-medium hover:underline">
                      {capitalize(job.job_title)}
                    </h3>
                  </Link>
                  <div className="flex gap-2 text-gray-600">
                    {/* Container for logo and company name */}
                    <div className="flex items-center gap-2">
                      {/* Placeholder for Logo */}
                      <div className="h-5 w-5 rounded-full bg-gray-300"></div>
                      <p className="text-gray-600">{capitalize(job.company)}</p>
                    </div>
                    {/* Salary */}
                    <div className="text-right text-gray-600">
                      {job.salary_min && job.salary_max ? (
                        <span className="text-sm font-light text-gray-600">
                          ${job.salary_min.toLocaleString()} - $
                          {job.salary_max.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {job.job_url && (
                  <Link
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      asChild
                      className="hover:bg-primary/90 ml-4 inline-flex cursor-pointer items-center rounded-md px-3 py-1 text-xs font-medium focus:ring-offset-2 focus:outline-none"
                    >
                      <span className="flex items-center">
                        Apply
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {job.keywords.map((tag) => (
                  <span
                    key={tag}
                    role="button"
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      const existingTags =
                        params.get("tags")?.split(",").filter(Boolean) ?? [];
                      if (!existingTags.includes(tag)) {
                        existingTags.push(tag);
                      }
                      params.set("tags", existingTags.join(","));
                      params.delete("page"); // Reset page on tag change
                      router.push(pathname + "?" + params.toString(), {
                        scroll: false,
                      });
                    }}
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200",
                      tag === "crypto pay" && "bg-purple-100 text-purple-800",
                    )}
                  >
                    {tag}
                  </span>
                ))}
                {job.is_remote && (
                  <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    remote
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between">
                <div className="text-sm text-gray-500">
                  {job.job_summary ? (
                    <Summary summary={job.job_summary} />
                  ) : job.job_description.length > 300 ? (
                    job.job_description.slice(0, 300) + "..."
                  ) : (
                    job.job_description
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                {extractSource(job.job_url) ? (
                  <span>
                    Source:{" "}
                    <span className="font-medium">
                      {extractSource(job.job_url)}
                    </span>
                  </span>
                ) : (
                  <span className="invisible">Source: Unknown</span>
                )}
                <span className="text-xs font-bold">
                  {formatDate(job.date)}
                </span>
              </div>
            </div>
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
