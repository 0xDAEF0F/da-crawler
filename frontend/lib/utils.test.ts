import { test, expect } from "bun:test";
import { extractSource } from "./utils";

test("extract source from URL", () => {
  expect(
    extractSource(
      "https://jobs.smartrecruiters.com/EmergingTechnologyLtd/743999688663027-aws-blockchain-architect-developer",
    ),
  ).toBe("jobs.smartrecruiters");
  expect(
    extractSource(
      "https://jobs.ashbyhq.com/p2p.org/2ee26285-6591-40eb-a421-37593cd621fc",
    ),
  ).toBe("jobs.ashbyhq");
  expect(
    extractSource("https://jobs.lever.co/crypto/1f8b5c9f-258d-4d73-8c23-fa6aa09f3e6b"),
  ).toBe("jobs.lever");
});
