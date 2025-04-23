import { cleanUrl } from "~/utils/clean-url";
import { trimSubstr } from "@/utils";
import { type } from "arktype";

export const remote3CoSchema = type({
  id: "number",
  created_at: "string.date.parse",
  live_at: "string.date.parse",
  title: type("string.lower")
    .pipe((t) => trimSubstr(t, ["| smartrecruiters", "apply here!", "(m/w/d)"]))
    .to("string.trim"),
  description: "string",
  description_format: "string.lower |> 'html' | 'bbcode'",
  type: "string.lower |> 'full-time' | 'contract'", // no internships
  location: "string", // worldwide
  on_site: "boolean",
  salary_min: type("number | null"),
  salary_max: type("number | null"),
  apply_url: type("string.url").pipe((url) => {
    const urlObj = new URL(url);
    return cleanUrl(`${urlObj.origin}${urlObj.pathname}`);
  }),
  slug: type("string").pipe((slug) => `https://remote3.co/remote-jobs/${slug}`),
  categories: type("string | null").pipe((cat) => (cat === null ? [] : [cat])),
  companies: type({
    name: type("string.lower").narrow((n, ctx) =>
      n.includes("stealth") ? ctx.mustBe("not stealth") : true
    ),
  }),
});

export type Remote3CoJob = typeof remote3CoSchema.infer;
