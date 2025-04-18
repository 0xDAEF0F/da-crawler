// INCOMPLETE
import { type } from "arktype";
import { fetchCryptocurrencyJobs } from "./ccj.fetch";

const jobs = await fetchCryptocurrencyJobs();

function parseSalary(salary: string) {
  //
}

const salarySchema = type({
  title: "string",
  company: type({
    name: "string",
  }),
  baseSalary: "string | false",
});

const salaries = jobs.flatMap((job) => {
  const res = salarySchema(job);
  if (res instanceof type.errors) {
    return [];
  }
  return [res];
});

console.log(salaries.length);
