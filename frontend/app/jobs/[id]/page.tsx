import { BASE_URL } from "@/lib/utils";
import { GetJobResponse } from "~/api/routes/get-job/get-job.schema";
import { JobPageClientContent } from "@/components/job-page-client-content";

async function getJobById(id: string): Promise<GetJobResponse> {
  const res = await fetch(`${BASE_URL}/job/${id}`);
  const json = await res.json();
  // console.log(json);
  return json;
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const job = await getJobById(id);
  return <JobPageClientContent job={job} />;
}
