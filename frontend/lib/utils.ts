import { type } from "arktype";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://terribly-true-mullet.ngrok-free.app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 * @throws If the string is not a string
 */
export function capitalize(str: string) {
  const result = type("string").pipe((str) =>
    str
      .split(" ")
      .map((w) => type("string.capitalize")(w))
      .join(" "),
  )(str);
  if (result instanceof type.errors) {
    throw new Error("Invalid string");
  }
  return result;
}

/**
 * Extracts the source from a URL
 * @param url - The URL to extract the source from
 * @returns The source of the URL
 * @throws If the URL is not valid
 */
export function extractSource(url: string): string {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const source = hostname.split(".").slice(0, -1);

  if (source[0] === "www") {
    return source.slice(1).join(".");
  }

  return source.join(".");
}

/**
 * Formats a date relative to the current time.
 * @param date - The date to format
 * @returns A string representing the formatted date (e.g., "Today", "Yesterday", "3 days ago", "Jan 1")
 */
export function formatDate(date: Date): string {
  const now = new Date();
  // Normalize dates to the start of the day for accurate day difference calculation
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = startOfNow.getTime() - startOfDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  // Format for dates older than a week
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
