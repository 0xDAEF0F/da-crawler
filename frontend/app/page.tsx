import { JobFilters } from "@/components/job-filters";
import { JobList } from "@/components/job-list";
import { SearchBar } from "@/components/search-bar";
import { fetchAllTags } from "@/lib/fetchAllTags";
import { fetchJobs } from "@/lib/fetchJobs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  // Fetch all tags concurrently with other data fetching if needed
  const allTags = await fetchAllTags();

  const query = params?.q as string | undefined;
  const searchKeywords = query ? query.split(" ").filter(Boolean) : [];

  const tags_ = params?.tags;
  const tags = Array.isArray(tags_)
    ? tags_.flatMap((t) => t.split(",")).filter(Boolean)
    : typeof tags_ === "string"
      ? tags_.split(",").filter(Boolean)
      : [];

  // Combine search keywords and selected tags
  const combinedKeywords = [...new Set([...searchKeywords, ...tags])];

  const page = params?.page as string | undefined;

  const getOffset = (page: number): number => {
    if (page === 0) return 0;
    return (page - 1) * 10;
  };

  const jobs = await fetchJobs(
    10,
    getOffset(page ? +page : 1),
    combinedKeywords.length > 0 ? combinedKeywords : undefined,
  );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Developer Jobs</h1>

      <SearchBar />

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <JobFilters availableTags={allTags} />
        </aside>

        <section className="flex-1">
          <JobList jobs_={jobs.jobs} totalResults={jobs.totalResults} />
        </section>
      </div>
    </main>
  );
}
