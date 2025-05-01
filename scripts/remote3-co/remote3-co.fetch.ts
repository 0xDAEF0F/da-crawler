import "dotenv/config";
import { isDateTooOld } from "@/utils";
import { type } from "arktype";
import { type Remote3CoJob, remote3CoSchema } from "./remote3-co.schema";

type Opts = {
  limit?: number;
  maxDays?: number;
};

export async function fetchRemote3CoJobs(opts?: Opts): Promise<Remote3CoJob[]> {
  const { limit = 200, maxDays = 7 } = opts ?? {};

  const url = `https://ojpncdvueyetebptprsv.supabase.co/rest/v1/jobs?select=*%2Ccompanies%28*%29&is_draft=eq.false&order=live_at.desc&offset=0&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "accept-profile": "public",
      apikey: process.env.REMOTE3_CO_API_KEY!,
      pragma: "no-cache",
      priority: "u=1, i",
      "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "x-client-info": "supabase-ssr/0.5.2",
      Referer: "https://www.remote3.co/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    method: "GET",
  });
  const data = (await res.json()) as unknown[];

  const remote3CoJobs: Remote3CoJob[] = [];

  for (const job of data) {
    const validated = remote3CoSchema(job);
    if (validated instanceof type.errors || isDateTooOld(validated.live_at, maxDays)) {
      continue;
    }
    remote3CoJobs.push(validated);
  }

  return remote3CoJobs;
}
