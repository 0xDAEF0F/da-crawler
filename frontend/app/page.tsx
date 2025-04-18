import { JobFilters } from "@/components/job-filters";
import { JobList } from "@/components/job-list";
import { SearchBar } from "@/components/search-bar";
import { fetchAllTags } from "@/lib/fetchAllTags";
import { fetchJobs } from "@/lib/fetchJobs";
import { type } from "arktype";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const searchParamsSchema = type({
  limit: "string = '10'",
  page: "string = '1'",
  "q?": type("string | undefined").pipe(
    (s) => s?.split(" ").filter(Boolean) ?? [],
  ), // user search bar query
  "tags?": type("string | undefined").pipe(
    (s) => s?.split(",").filter(Boolean) ?? [],
  ), // user selected tags
}).to({
  limit: "string.numeric.parse",
  page: "string.numeric.parse",
});

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, allTags] = await Promise.all([searchParams, fetchAllTags()]);
  // TODO: implement "q"
  const { limit, page, q, tags } = searchParamsSchema.assert(params); // let it burn

  // console.log({
  //   limit,
  //   page,
  //   q,
  //   tags,
  // });

  const combinedKeywords = [...new Set([...[], ...(tags ?? [])])];

  const getOffset = (page: number): number => {
    if (page === 0) return 0;
    return (page - 1) * limit;
  };

  // console.log(`offset: ${getOffset(page)}`);

  const jobs = await fetchJobs(
    limit,
    getOffset(page),
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
