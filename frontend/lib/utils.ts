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
