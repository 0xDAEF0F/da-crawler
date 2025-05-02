import { Hono } from "hono";
import { getTags } from "./routes/all-tags";
import { getJobs } from "./routes/get-jobs";
import { getConnInfo } from "hono/bun";
import { getJob } from "./routes/get-job/get-job";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

console.log(
  `Server starting at ${new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`,
);

const app = new Hono();

app.post("/get-jobs", getJobs);
app.get("/all-tags", getTags);
app.get("/job/:id", getJob);
app.get("/", (c) => c.text("Hello World"));

export default app;
