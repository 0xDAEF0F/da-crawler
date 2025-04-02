from crawlee.crawlers import PlaywrightCrawler
from crawlee.http_clients import HttpxHttpClient
from .routes import router
from .crawler import crawl4ai

async def main() -> None:
    await crawl4ai.start()

    crawler = PlaywrightCrawler(
        request_handler=router,
        headless=True,
        max_requests_per_crawl=None,
        http_client=HttpxHttpClient(),
    )

    await crawler.run(
        [
            "https://cryptocurrencyjobs.co/",
        ]
    )

    # Close the crawl4ai instance
    await crawl4ai.close()
