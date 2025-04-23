import { type Browser, type Page } from "playwright";

/**
 * Checks if a URL's page content contains any of the specified keywords
 * @param url The URL to check
 * @param keywords Array of keywords to look for in the page content
 * @param browser Browser instance to use for navigation
 * @returns Promise resolving to true if any keyword is found, false otherwise
 */
export async function checkUrlForKeywords(
  url: string,
  keywords: string[],
  browser: Browser
): Promise<boolean> {
  if (!url || !browser || keywords.length === 0) {
    return false;
  }

  let page: Page | null = null;

  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });

    // Get the page content
    const content = await page.content();

    // Check if any keyword is present in the content
    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn(`Error checking URL ${url}`);
    return false;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}
