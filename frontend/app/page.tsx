import { JobFilters } from "@/components/job-filters";
import { JobList } from "@/components/job-list";
import { SearchBar } from "@/components/search-bar";
import { BASE_URL } from "@/lib/utils";

// imported from monorepo
import { JobResponse } from "~/api/types/get-jobs-api-response";

type GetLastJobsResponse = {
  jobs: JobResponse[];
  totalResults: number;
};
async function getLastJobs(
  num: number,
  offset: number,
  keywords?: string[]
): Promise<GetLastJobsResponse> {
  const response = await fetch(`${BASE_URL}/get-jobs`, {
    method: "POST",
    body: JSON.stringify({ limit: num, sinceWhen: "365d", keywords, offset }),
  });
  const data = await response.json();
  return data;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const query = params?.q as string | undefined;
  const keywords = query ? query.split(" ").filter(Boolean) : undefined;

  const page = params?.page as string | undefined;
  const offset = page ? parseInt(page) * 10 : 0;

  const jobs = await getLastJobs(10, offset, keywords);

  console.log(
    `called getLastJobs with ${10} jobs and offset ${offset} -- length: ${
      jobs.jobs.length
    }`
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Developer Jobs</h1>

      <SearchBar />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <aside className="w-full md:w-64 shrink-0">
          <JobFilters />
        </aside>

        <section className="flex-1">
          <JobList jobs_={jobs.jobs} totalResults={jobs.totalResults} />
        </section>
      </div>
    </main>
  );
}
