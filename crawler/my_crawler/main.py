import argparse
from datetime import timedelta
from crawlee import ConcurrencySettings, Request
from crawlee.crawlers import PlaywrightCrawler
from crawlee.http_clients import HttpxHttpClient
from .routes import router
from .crawler import crawl4ai


cryptocurrencyjobs = Request.from_url(
    url="https://cryptocurrencyjobs.co/", label="cryptocurrencyjobs_main"
)

cryptojobs = Request.from_url(
    url="https://www.cryptojobs.com/jobs?sort_by=posted_at&sort_order=desc&per_page=200",
    label="cryptojobs_main",
)


async def main() -> None:
    await crawl4ai.start()

    crawler = PlaywrightCrawler(
        request_handler=router,
        headless=True,
        max_requests_per_crawl=None,
        http_client=HttpxHttpClient(),
        concurrency_settings=ConcurrencySettings(max_concurrency=1),
        request_handler_timeout=timedelta(seconds=10),
    )

    await crawler.run([cryptocurrencyjobs, cryptojobs])

    # Close the crawl4ai instance
    await crawl4ai.close()
