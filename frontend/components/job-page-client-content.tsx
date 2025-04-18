"use client";

import { JobDetail } from "@/components/job-detail";
import { GetJobResponse } from "~/api/routes/get-job/get-job.schema";

interface JobPageClientContentProps {
  job: GetJobResponse;
}

export function JobPageClientContent({ job }: JobPageClientContentProps) {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1 h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to jobs
      </button>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <JobDetail job={job} />
        </div>

        <aside className="w-full shrink-0 lg:w-80">
          {/* RelatedJobs can be added here if needed */}
          {/* <RelatedJobs id={job.id} /> */}
        </aside>
      </div>
    </main>
  );
}
