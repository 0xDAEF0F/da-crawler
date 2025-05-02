import { test, expect } from "bun:test";
import { isDateTooOld, parseArguments, trimSubstr } from "./utils";

test("trimSubstr", () => {
  expect(trimSubstr("hello world", ["world"])).toBe("hello");
  expect(trimSubstr("hola como estas putin", ["putin", "como"])).toBe("hola estas");
  expect(trimSubstr("hello world", ["world", "hello"])).toBe("");
  expect(trimSubstr("hello | smartrecruiters", ["world", "| smartrecruiters"])).toBe(
    "hello",
  );
});

test("isDateTooOld", () => {
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in ms
  const max_days_test = 5;

  // Case 1: Date is within the max_days limit (3 days ago)
  const recentDate = new Date(Date.now() - 3 * oneDay);
  let isTooOld = isDateTooOld(recentDate, max_days_test);
  expect(isTooOld).toBe(false);

  // Case 2: Date is exactly max_days ago (should not be filtered out yet)
  const exactDate = new Date(Date.now() - max_days_test * oneDay);
  isTooOld = isDateTooOld(exactDate, max_days_test);
  expect(isTooOld).toBe(false);

  // Case 3: Date is older than max_days limit (6 days ago)
  const oldDate = new Date(Date.now() - (max_days_test + 1) * oneDay);
  isTooOld = isDateTooOld(oldDate, max_days_test);
  expect(isTooOld).toBe(true);

  // Case 4: Edge case - Date is slightly less than max_days ago
  const slightlyBeforeEdgeDate = new Date(Date.now() - max_days_test * oneDay + 1000);
  isTooOld = isDateTooOld(slightlyBeforeEdgeDate, max_days_test);
  expect(isTooOld).toBe(false);

  // Case 5: Edge case - Date is slightly more than max_days ago
  const slightlyAfterEdgeDate = new Date(Date.now() - max_days_test * oneDay - 1000);
  isTooOld = isDateTooOld(slightlyAfterEdgeDate, max_days_test);
  expect(isTooOld).toBe(true);
});

test("parseArguments", () => {
  const { max_jobs, max_days } = parseArguments();
  expect(max_jobs).toBe(20);
  expect(max_days).toBe(5);
});
