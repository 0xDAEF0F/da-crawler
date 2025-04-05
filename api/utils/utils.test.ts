import { test, expect } from "bun:test";
import { cleanUrl } from "./utils";

test("cleanUrl - do nothing", () => {
  const url = "https://job-boards.greenhouse.io/avalabs/jobs/5368357004";
  const url2 = cleanUrl(url);
  expect(url2).toBe("https://job-boards.greenhouse.io/avalabs/jobs/5368357004");
});

test("cleanUrl - remove application 2", () => {
  const url =
    "https://job-boards.greenhouse.io/avalabs/jobs/5368357004/application";
  const url2 = cleanUrl(url);
  expect(url2).toBe("https://job-boards.greenhouse.io/avalabs/jobs/5368357004");
});

test("cleanUrl - remove application", () => {
  const url =
    "https://job-boards.greenhouse.io/avalabs/jobs/5368357004/application/";
  const url2 = cleanUrl(url);
  expect(url2).toBe("https://job-boards.greenhouse.io/avalabs/jobs/5368357004");
});

test("cleanUrl - remove apply", () => {
  const url = "https://job-boards.greenhouse.io/avalabs/jobs/5368357004/apply/";
  const url2 = cleanUrl(url);
  expect(url2).toBe("https://job-boards.greenhouse.io/avalabs/jobs/5368357004");
});

test("cleanUrl - remote trailing slash", () => {
  const url = "https://job-boards.greenhouse.io/avalabs/jobs/5368357004/";
  const url2 = cleanUrl(url);
  expect(url2).toBe("https://job-boards.greenhouse.io/avalabs/jobs/5368357004");
});
