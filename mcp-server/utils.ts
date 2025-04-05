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
    parsedUrl.pathname =
      pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";

    return parsedUrl.toString();
  } catch (error) {
    // Return original URL if parsing fails
    return url;
  }
}
