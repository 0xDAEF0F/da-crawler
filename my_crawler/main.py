from crawlee.crawlers import PlaywrightCrawler
from crawlee.storages import Dataset
from crawlee.http_clients import HttpxHttpClient
from .routes import router
from .crawler import crawl4ai


async def main() -> None:
    """The crawler entry point."""

    await crawl4ai.start()

    crawler = PlaywrightCrawler(
        request_handler=router,
        headless=True,
        max_requests_per_crawl=None,
        http_client=HttpxHttpClient(),
    )

    dataset = await Dataset.open(name="cryptocurrencyjobs")
    print(f"Dropping 'cryptocurrencyjobs' dataset")
    await dataset.drop()

    await crawler.run(
        [
            "https://cryptocurrencyjobs.co/",
        ]
    )

    # Close the crawl4ai instance
    await crawl4ai.close()
