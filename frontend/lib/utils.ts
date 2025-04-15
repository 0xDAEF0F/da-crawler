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

// "hello world" => "Hello World"
/// Throws if it does not passes validation
export const capitalize = (str: string) => {
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
};
