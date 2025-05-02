import { trimSubstr } from "@/utils";
import { type } from "arktype";
import { cleanUrl } from "~/utils/clean-url";

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
  categories: type("string | null").pipe((c) =>
    !c ? [] : JSON.parse(c).map((c: string) => c.toLowerCase()),
  ),
  companies: type({
    name: type("string.lower").narrow((n, ctx) =>
      n.includes("stealth") ? ctx.mustBe("not stealth") : true,
    ),
    logo: type("string")
      .pipe.try((s) => {
        if (s.startsWith("//")) {
          return `https:${s}`;
        }
        return s;
      })
      .to("string.url"),
  }),
});

export type Remote3CoJob = typeof remote3CoSchema.infer;
