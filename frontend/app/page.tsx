import { JobFilters } from "@/components/job-filters";
import { JobList } from "@/components/job-list";
import { SearchBar } from "@/components/search-bar";
import { BASE_URL } from "@/lib/utils";

// imported from monorepo
import { JobResponse } from "~/api/types/get-jobs-api-response";

async function getLastJobs(num: number): Promise<JobResponse[]> {
  const response = await fetch(`${BASE_URL}/get-jobs`, {
    method: "POST",
    body: JSON.stringify({ limit: num, sinceWhen: "10d" }),
  });
  const data = await response.json();
  return data.jobs;
}

export default async function Home() {
  const jobs = await getLastJobs(10);
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Developer Jobs</h1>

      <SearchBar />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <aside className="w-full md:w-64 shrink-0">
          <JobFilters />
        </aside>

        <section className="flex-1">
          <JobList jobs_={jobs} />
        </section>
      </div>
    </main>
  );
}
