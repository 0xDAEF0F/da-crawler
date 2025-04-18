import { type } from "arktype";
import { cleanUrl } from "./clean-url";

export const jobSchema = type({
  title: "string.lower |> string.trim",
  source: "string.lower |> string.trim",
  company: "string.lower |> string.trim",
  tags: "string.lower[] |> string.trim[]",
  location: "string[]",
  date: "Date",
  salary_min: "number = 0",
  salary_max: "number = 0",
  job_description: "string",
  "job_description_url?": "string.url",
  job_url: type("string.url").pipe((url) => cleanUrl(url)),
  is_remote: "boolean",
});
