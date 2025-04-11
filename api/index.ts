import { Hono } from "hono";
import { getTags } from "./routes/all-tags";
import { getJobs } from "./routes/get-jobs";

const app = new Hono();

app.post("/get-jobs", getJobs);
app.get("/all-tags", getTags);

export default app;
