const options = {
  method: "POST",
  url: "https://8ehcb38y1u-dsn.algolia.net/1/indexes/*/queries",
  qs: {
    "x-algolia-agent":
      "Algolia%20for%20JavaScript%20(4.10.5)%3B%20Browser%20(lite)%3B%20instantsearch.js%20(4.30.0)%3B%20JS%20Helper%20(3.5.5)",
    "x-algolia-api-key": "e3deada9c15551e6363ee91e7e7d59cc",
    "x-algolia-application-id": "8EHCB38Y1U",
  },
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    connection: "keep-alive",
    origin: "https://cryptocurrencyjobs.co",
    pragma: "no-cache",
    referer: "https://cryptocurrencyjobs.co/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "content-type": "application/json",
  },
  body: {
    requests: [
      {
        indexName: "jobs",
        params:
          "filters=searchFilter%3AIsHome&hitsPerPage=200&query=&highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&facets=%5B%22locationFilter%22%5D&tagFilters=",
      },
    ],
  },
  json: true,
};

type AlgoliaResponse = {
  results: {
    hits: unknown[];
  }[];
};

export async function fetchCryptocurrencyJobs(): Promise<unknown[]> {
  const url = new URL(options.url);
  for (const [key, value] of Object.entries(options.qs)) {
    url.searchParams.append(key, value);
  }

  const res = await fetch(url.toString(), {
    method: options.method,
    headers: options.headers,
    body: JSON.stringify(options.body),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Cryptocurrency Jobs: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as AlgoliaResponse;
  // Assuming the structure based on typical Algolia responses
  return data.results[0]?.hits ?? [];
}
