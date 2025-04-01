from crawlee.crawlers import PlaywrightCrawler
from crawlee.http_clients import HttpxHttpClient
from .routes import router


async def main() -> None:
    """The crawler entry point."""
    crawler = PlaywrightCrawler(
        request_handler=router,
        headless=True,
        max_requests_per_crawl=1,
        http_client=HttpxHttpClient(),
    )

    await crawler.run(
        [
            "https://cryptocurrencyjobs.co/",
        ]
    )
