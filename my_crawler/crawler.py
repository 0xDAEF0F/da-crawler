from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, DefaultMarkdownGenerator

# Crawl4Ai
md_generator = DefaultMarkdownGenerator(
    options={"ignore_links": True, "escape_html": False, "body_width": 80}
)
crawl4ai_config = CrawlerRunConfig(
    markdown_generator=md_generator, css_selector="div.prose"
)
crawl4ai = AsyncWebCrawler()
