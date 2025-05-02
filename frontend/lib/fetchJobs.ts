// imported from monorepo
import type { JobResponse } from "~/api/routes/get-jobs/get-jobs-res";
import { BASE_URL } from "./utils";

type GetLastJobsResponse = {
  jobs: JobResponse[];
  totalResults: number;
};

export async function fetchJobs(
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
