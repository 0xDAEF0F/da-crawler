from datetime import datetime, timedelta, timezone
import json
from crawlee import Request
from crawlee.storages import Dataset
from crawlee.crawlers import PlaywrightCrawlingContext
from crawlee.router import Router
import asyncio
from pydantic_core import Url
from urllib.parse import urlparse, urlunparse

from my_crawler.db import is_job_already_scraped
from .crawler import crawl4ai, get_config
from .utils import current_run_id, parse_job_url

NUMBER_OF_JOBS = 10000
SLEEP_INTERVAL = 0.5

JOB_DATE_THRESHOLD = 10  # days


def get_job_date_threshold() -> datetime:
    return datetime.now().replace(
        hour=0, minute=0, second=0, microsecond=0
    ) - timedelta(days=JOB_DATE_THRESHOLD)


router = Router[PlaywrightCrawlingContext]()


@router.handler(label="cryptocurrencyjobs_main")
async def cryptocurrencyjobs_main_handler(context: PlaywrightCrawlingContext) -> None:
    context.log.info(f"Processing URL: {context.request.url}")

    # Locate all the jobs and wait for them to be attached in the DOM
    locator = context.page.locator("ol.ais-Hits-list")
    await locator.wait_for(state="attached")

    # Get all the jobs
    all_jobs = await locator.locator("li.ais-Hits-item").all()

    context.log.info(f"Found {len(all_jobs)} jobs at cryptocurrencyjobs.co")

    jobs = []

    for li in all_jobs:
        title_future = li.locator("h2 > a").inner_text()
        job_url_future = li.locator("h2 > a").get_attribute("href")
        company_future = li.locator("h3").inner_text()
        tags_future = li.locator("ul.flex.flex-wrap > li").all()
        date_future = li.locator("time").get_attribute("datetime")
        is_remote_future = li.locator("a[href='/remote/']").is_visible()

        title, job_url, company, tags, date_str, is_remote = await asyncio.gather(
            title_future,
            job_url_future,
            company_future,
            tags_future,
            date_future,
            is_remote_future,
        )

        # Handle relative URLs
        if job_url.startswith("http"):
            job_url = parse_job_url(job_url)
        else:
            job_url = parse_job_url(f"https://cryptocurrencyjobs.co{job_url}")

        tags_text = [(await tag.inner_text()).strip().lower() for tag in tags]
        date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")

        if date < get_job_date_threshold():
            context.log.info(f"Skipping job: {title}@{company} because it is too old")
            continue
        elif is_job_already_scraped(job_url):
            context.log.info(
                f"Skipping job: {title}@{company} because it is already scraped"
            )
            continue

        jobs.append(
            {
                "title": title,
                "job_url": job_url,
                "company": company,
                "tags": tags_text,
                "date": date,
                "is_remote": is_remote,
            }
        )

    jobs.sort(key=lambda x: x["date"], reverse=True)
    jobs = [{**job, "date": job["date"].isoformat()} for job in jobs]

    context.log.info("--------------------------------------")
    context.log.info(f"{len(jobs)} JOBS SHOULD BE SCRAPED")
    context.log.info("--------------------------------------")

    for job in jobs[:NUMBER_OF_JOBS]:
        context.log.info(f"Adding job: {job['job_url']}")
        await context.add_requests(
            requests=[
                Request.from_url(
                    url=job["job_url"],
                    user_data={"job": job},
                    label="cryptocurrencyjobs_job_description",
                ),
            ]
        )


@router.handler(label="cryptocurrencyjobs_job_description")
async def job_description_handler(context: PlaywrightCrawlingContext) -> None:
    # Job data from the request context
    job = context.request.user_data["job"]

    context.log.info(f"Processing job description: {job['title']}@{job['company']}")

    # Get the real job url to process it later
    real_job_url = Url(
        await context.page.locator("a")
        .filter(has_text="Apply")
        .first.get_attribute("href")
    )

    # Get the job description
    job_description = (
        await crawl4ai.arun(
            url=job["job_url"], config=get_config(css_selector="div.prose")
        )
    ).markdown

    # Set the job description
    job["job_description"] = job_description

    # Parse the url
    parsed = urlparse(str(real_job_url))
    real_job_url = Url(
        urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
    )

    job["real_job_url"] = str(real_job_url)

    dataset = await Dataset.open(name=f"cryptocurrencyjobs_{current_run_id}")
    await dataset.push_data(json.dumps(job, indent=2))

    context.log.info(
        f"Finished processing {job['title']}@{job['company']}. Sleeping for {SLEEP_INTERVAL} seconds."
    )
    await asyncio.sleep(SLEEP_INTERVAL)


@router.handler(label="cryptojobs_main")
async def cryptojobs_main_handler(context: PlaywrightCrawlingContext) -> None:
    context.log.info(f"Scraping jobs from: {context.request.url}")

    jobs_section = context.page.locator("#searchForm > section.job_listing")

    all_jobs = await jobs_section.locator("div.new-box").all()

    context.log.info(f"Found {len(all_jobs)} jobs at cryptojobs.com")

    for job in all_jobs[:NUMBER_OF_JOBS]:
        job_title_url_locator = job.locator("a").nth(0)
        title = (await job_title_url_locator.text_content()).strip()
        job_url = (await job_title_url_locator.get_attribute("href")).strip()
        company = (await job.locator("a").nth(1).locator("b").text_content()).strip()
        posted = await job.locator(
            "ul.date span"
        ).text_content()  # Yesterday, 6 days ago, 1 week ago
        is_remote = (
            (await job.locator("a").nth(2).text_content())
            .strip()
            .lower()
            .startswith("remote")
        )

        if parse_date(posted) < get_job_date_threshold():
            context.log.info(f"Skipping job: {title}@{company} because it is too old")
            continue

        job = {
            "title": title,
            "job_url": job_url,
            "company": company,
            "date": parse_date(posted).isoformat(),
            "is_remote": is_remote,
        }
        await context.add_requests(
            requests=[
                Request.from_url(
                    url=job_url,
                    label="cryptojobs_job_description",
                    user_data={"job": job},
                ),
            ]
        )


@router.handler(label="cryptojobs_job_description")
async def cryptojobs_job_description_handler(
    context: PlaywrightCrawlingContext,
) -> None:
    job = context.request.user_data["job"]

    context.log.info(f"Processing job description: {job['title']}@{job['company']}")

    tags = await context.page.locator("ul.tags").nth(0).locator("li").all()
    tags_text = [(await tag.inner_text()).strip().lower() for tag in tags]
    job["tags"] = tags_text

    job_description = (
        await crawl4ai.arun(
            url=job["job_url"], config=get_config(css_selector="div.details-area")
        )
    ).markdown

    job["job_description"] = job_description

    try:
        real_job_url = await (
            context.page.locator("button.btn")
            .filter(has_text="Apply")
            .first.get_attribute("data-href")
        )
    except Exception as e:
        context.log.error(
            f"Error getting real job url for {job['job_url']}: {e}\nSkipping job."
        )
        return

    job["real_job_url"] = real_job_url

    dataset = await Dataset.open(name=f"cryptojobs_{current_run_id}")
    await dataset.push_data(json.dumps(job, indent=2))

    context.log.info(
        f"Finished processing {job['title']}@{job['company']}. Sleeping for {SLEEP_INTERVAL} seconds."
    )
    await asyncio.sleep(SLEEP_INTERVAL)


# Yesterday, {n} days ago, {n} weeks ago, {n} months ago
def parse_date(date_str: str) -> datetime:
    date_str = date_str.strip().lower()
    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    if "yesterday" in date_str:
        return now - timedelta(days=1)
    elif "days ago" in date_str:
        days = int(date_str.split()[0])
        return now - timedelta(days=days)
    elif "week" in date_str:
        weeks = int(date_str.split()[0])
        return now - timedelta(days=7 * weeks)
    elif "weeks ago" in date_str:
        weeks = int(date_str.split()[0])
        return now - timedelta(weeks=weeks)
    elif "month" in date_str:
        months = int(date_str.split()[0])
        return now - timedelta(days=30 * months)
    elif "months ago" in date_str:
        months = int(date_str.split()[0])
        return now - timedelta(days=30 * months)
    else:
        return now
