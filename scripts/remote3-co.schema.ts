import { cleanUrl } from "../api/utils";
import { trimSubstr } from "./utils";
import { type } from "arktype";

export const remote3CoSchema = type({
  id: "number",
  created_at: "string.date.parse",
  live_at: "string.date.parse",
  title: type("string.lower").pipe((t) => trimSubstr(t, ["| smartrecruiters"])),
  description: "string",
  description_format: "string.lower |> 'html'",
  type: "string.lower |> 'full-time' | 'contract'", // no internships
  location: "string", // worldwide
  salary_min: "number",
  on_site: "boolean",
  salary_max: "number",
  apply_url: type("string.url").pipe((url) => {
    const urlObj = new URL(url);
    return cleanUrl(`${urlObj.origin}${urlObj.pathname}`);
  }),
  slug: type("string").pipe((slug) => `https://remote3.co/remote-jobs/${slug}`),
  categories: type("string.json.parse").to("string.lower[] |> string.trim[]"),
  companies: type({
    name: type("string.lower").narrow((n, ctx) =>
      n.includes("stealth") ? ctx.mustBe("not stealth") : true
    ),
  }),
});
