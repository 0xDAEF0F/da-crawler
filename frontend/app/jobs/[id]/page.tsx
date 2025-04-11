import { JobDetail } from "@/components/job-detail"
import { RelatedJobs } from "@/components/related-jobs"
import Link from "next/link"

export default function JobPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to jobs
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <JobDetail id={params.id} />
        </div>

        <aside className="w-full lg:w-80 shrink-0">
          <RelatedJobs id={params.id} />
        </aside>
      </div>
    </main>
  )
}
