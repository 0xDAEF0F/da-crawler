from datetime import datetime
import json
from crawlee.crawlers import PlaywrightCrawlingContext
from crawlee.router import Router
import asyncio

router = Router[PlaywrightCrawlingContext]()


def parse_job_url(url: str) -> str:
    """Parse the job URL to ensure it is absolute for cryptocurrencyjobs.co"""
    if url.startswith("http"):
        return url
    else:
        return f"https://cryptocurrencyjobs.co{url}"


@router.default_handler
async def default_handler(context: PlaywrightCrawlingContext) -> None:
    """Default request handler."""
    context.log.info(f"Processing {context.request.url} ...")

    # Locate all the jobs and wait for them to be attached in the DOM
    locator = context.page.locator("ol.ais-Hits-list")
    await locator.wait_for(state="attached")

    # Get all the jobs
    all_jobs = await locator.locator("li.ais-Hits-item").all()

    print(f"Found {len(all_jobs)} jobs")

    jobs = []

    for li in all_jobs:
        title_future = li.locator("h2 > a").inner_text()
        job_url_future = li.locator("h2 > a").get_attribute("href")
        company_future = li.locator("h3").inner_text()
        tags_future = li.locator("ul.flex.flex-wrap > li").all()
        date_future = li.locator("time").get_attribute("datetime")

        title, job_url, company, tags, date_str = await asyncio.gather(
            title_future, job_url_future, company_future, tags_future, date_future
        )

        job_url = parse_job_url(job_url)
        tags_text = [(await tag.inner_text()).strip().lower() for tag in tags]
        date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
        jobs.append(
            {
                "title": title,
                "job_url": job_url,
                "company": company,
                "tags": tags_text,
                "date": date,
            }
        )
    print(json.dumps(jobs, indent=2, default=(lambda o: o.isoformat())))
