from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, DefaultMarkdownGenerator

# Crawl4Ai
md_generator = DefaultMarkdownGenerator(
    options={"ignore_links": True, "escape_html": False, "body_width": 80}
)


def get_config(css_selector: str) -> CrawlerRunConfig:
    return CrawlerRunConfig(markdown_generator=md_generator, css_selector=css_selector)


crawl4ai = AsyncWebCrawler()
