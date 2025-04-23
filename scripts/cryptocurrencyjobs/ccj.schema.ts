import { type } from "arktype";

export const ccjSchema = type({
  baseSalary: "string | false",
  company: type({
    name: "string",
  }),
  countLocation: "boolean",
  date: "string",
  datePublished: "string",
  employmentTypes: type({
    name: "string",
    url: "string",
    comma: "boolean",
  }).array(),
  keywords: type({
    name: "string",
    url: "string | boolean",
  }).array(),
  highlight: "boolean",
  index: "boolean",
  locationFilter: "string[]",
  logo: type({
    src: "string",
    srcset: "string",
    "data-sizes": "string",
    "data-src": "string",
    "data-srcset": "string",
    height: "string",
    width: "string",
  }),
  onsiteLocation: type({
    city: "string",
    state: "string",
    country: "string",
  })
    .array()
    .or("string"),
  permalink: "string",
  remoteLocation: type({
    name: "string",
    url: "string",
  }).or("boolean"),
  role: type({
    name: "string",
    url: "string",
  }),
  searchFilter: "string[]",
  title: "string",
});

export type CcjJob = typeof ccjSchema.infer;
