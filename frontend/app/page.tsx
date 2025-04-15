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
  keywords?: string[],
): Promise<GetLastJobsResponse> {
  const response = await fetch(`${BASE_URL}/get-jobs`, {
    method: "POST",
    body: JSON.stringify({ limit: num, sinceWhen: "365d", keywords, offset }),
  });
  const data = await response.json();
  return data;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const query = params?.q as string | undefined;
  const keywords = query ? query.split(" ").filter(Boolean) : undefined;

  const page = params?.page as string | undefined;

  const getOffset = (page: number): number => {
    if (page === 0) return 0;
    return (page - 1) * 10;
  };

  const jobs = await getLastJobs(10, getOffset(page ? +page : 1), keywords);

  // console.log(
  //   `called getLastJobs with ${10} jobs and offset ${getOffset(
  //     page ? +page : 1
  //   )} -- length: ${jobs.jobs.length}`
  // );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Developer Jobs</h1>

      <SearchBar />

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <JobFilters />
        </aside>

        <section className="flex-1">
          <JobList jobs_={jobs.jobs} totalResults={jobs.totalResults} />
        </section>
      </div>
    </main>
  );
}
