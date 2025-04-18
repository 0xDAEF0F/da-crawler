/**
 * Cleans a URL by removing the last segment if it contains 'application' or 'apply'
 * and removes query parameters and hash fragment. Also removes trailing slashes.
 *
 * @param url - The URL to clean.
 * @returns The cleaned URL.
 */
export function cleanUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

    // Check if the last segment contains 'application' or 'apply'
    const lastSegment =
      pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
    if (
      lastSegment &&
      (lastSegment.includes("application") || lastSegment.includes("apply"))
    ) {
      pathSegments.pop();
    }

    // Reconstruct pathname without trailing slash
    parsedUrl.pathname = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";

    // Remove query parameters and hash fragment
    parsedUrl.search = "";
    parsedUrl.hash = "";

    return parsedUrl.toString();
  } catch (error) {
    // Return original URL if parsing fails
    return url;
  }
}
