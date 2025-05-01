import { describe, expect, test } from "bun:test";
import { type } from "arktype";
import { remote3CoSchema } from "./remote3-co.schema";

const mockRawJob = {
  id: 12345,
  created_at: "2024-08-01T10:00:00Z",
  live_at: "2024-08-01T10:00:00Z",
  title: "senior software engineer | smartrecruiters",
  description: "<p>Great job description here.</p>",
  description_format: "html",
  type: "full-time",
  location: "Worldwide",
  on_site: false,
  salary_min: 100000,
  salary_max: 150000,
  apply_url: "https://example.com/apply?utm_source=remote3",
  slug: "senior-software-engineer-12345",
  categories: "Software Development",
  companies: {
    name: "Example Inc.",
    logo: "//logos.example.com/logo.png",
  },
};

describe("remote3-co schema", () => {
  test("should parse remote3-co jobs", () => {
    const result = remote3CoSchema(mockRawJob);
    expect(result instanceof type.errors).toBe(false);
  });
});
