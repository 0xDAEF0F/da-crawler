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
import { Button } from "./ui/button";
import { JobResponse } from "~/api/routes/get-jobs/get-jobs-res";
import Summary from "./job-card/summary";
import { JobCard } from "./job-card/job-card";

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
    date: new Date(j.publishedAt),
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
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            searchParams={searchParams}
            pathname={pathname}
            router={router}
          />
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
