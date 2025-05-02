import { PrismaClient } from "@prisma/client";
import { type } from "arktype";

const keywordsSchema = type("string.json.parse |> string.lower[]").pipe((a) =>
  JSON.stringify(a),
);

function validateKeywords(keywords: string) {
  const maybeValidated = keywordsSchema(keywords);
  if (maybeValidated instanceof type.errors) {
    throw new Error(maybeValidated.summary);
  }
  return maybeValidated;
}

const prisma = new PrismaClient().$extends({
  query: {
    job: {
      create({ args, query }) {
        if (args.data.keywords) {
          args.data.keywords = validateKeywords(args.data.keywords);
        }
        return query(args);
      },
    },
  },
});

export { prisma };
