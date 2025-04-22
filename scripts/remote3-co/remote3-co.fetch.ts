import dotenv from "dotenv";
dotenv.config();

export async function fetchRemote3CoJobs(limit: number = 200): Promise<unknown[]> {
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
  return data;
}
