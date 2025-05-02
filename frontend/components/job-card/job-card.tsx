import { Button } from "@/components/ui/button";
import { capitalize, cn, extractSource, formatDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { useRouter, useSearchParams } from "next/navigation";
import type { JobResponse } from "~/api/routes/get-jobs/get-jobs-res";
import { Summary } from "./summary";

type Props = {
  job: JobResponse & { date: Date };
  searchParams: ReturnType<typeof useSearchParams>;
  pathname: string;
  router: ReturnType<typeof useRouter>;
};

export function JobCard(props: Props) {
  const { job, searchParams, pathname, router } = props;
  return (
    <div
      key={job.id}
      className="block rounded-md border border-gray-200 p-4 transition-colors hover:border-gray-400"
    >
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <h3 className="text-lg font-medium hover:underline">
              {capitalize(job.jobTitle)}
            </h3>
          </Link>
          <div className="flex gap-2 text-gray-600">
            {/* Container for logo and company name */}
            <div className="flex items-center gap-2">
              {job.companyLogoUrl ? (
                <Image
                  src={job.companyLogoUrl}
                  alt={`${job.company} logo`}
                  width={20}
                  height={20}
                  className="rounded-full object-contain"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-300" />
              )}
              <p className="text-gray-600">{capitalize(job.company)}</p>
            </div>
            {/* Salary */}
            <div className="text-right text-gray-600">
              {job.salaryMin && job.salaryMax ? (
                <span className="text-sm font-light text-gray-600">
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {job.jobUrl && (
          <Link href={job.jobUrl} target="_blank" rel="noopener noreferrer">
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
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
          <span
            key={tag}
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              const existingTags = params.get("tags")?.split(",").filter(Boolean) ?? [];
              if (!existingTags.includes(tag)) {
                existingTags.push(tag);
              }
              params.set("tags", existingTags.join(","));
              params.delete("page"); // Reset page on tag change
              router.push(`${pathname}?${params.toString()}`, {
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
        {job.isRemote && (
          <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            remote
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="text-sm text-gray-500">
          {job.jobSummary ? (
            <Summary summary={job.jobSummary} />
          ) : job.jobDescription.length > 300 ? (
            `${job.jobDescription.slice(0, 300)}...`
          ) : (
            job.jobDescription
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        {extractSource(job.jobUrl) ? (
          <span>
            Source: <span className="font-medium">{extractSource(job.jobUrl)}</span>
          </span>
        ) : (
          <span className="invisible">Source: Unknown</span>
        )}
        <span className="text-xs font-bold">{formatDate(job.date)}</span>
      </div>
    </div>
  );
}
