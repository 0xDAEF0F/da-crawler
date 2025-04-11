import { JobFilters } from "@/components/job-filters";
import { JobList } from "@/components/job-list";
import { SearchBar } from "@/components/search-bar";
import prisma from "@/lib/db";

export default function Home() {
  // const jobs = await prisma.job.findMany();
  // console.log(jobs);
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Developer Jobs</h1>

      <SearchBar />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <aside className="w-full md:w-64 shrink-0">
          <JobFilters />
        </aside>

        <section className="flex-1">
          <JobList />
        </section>
      </div>
    </main>
  );
}
