import { type } from "arktype";
import { BASE_URL } from "./utils";

type AllTagsResponse = {
  error: boolean;
  tags: string[];
};

export async function fetchAllTags(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/all-tags`);
    if (!response.ok) {
      console.error("Failed to fetch tags:", response.statusText);
      return []; // Return empty array on failure
    }
    const data: AllTagsResponse = await response.json();

    const validated = type("string[]")(data.tags);

    if (validated instanceof type.errors) {
      console.error("Invalid tags data received:", validated);
      return [];
    }

    if (!data.error && validated) {
      return validated;
    } else {
      console.error("API returned an error or invalid data for tags:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
    return []; // Return empty array on catch
  }
}
