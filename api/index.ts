import { Hono } from "hono";
import { getTags } from "./routes/all-tags";
import { getJobs } from "./routes/get-jobs";

console.log(`Server starting at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`);

const app = new Hono();

app.post("/get-jobs", getJobs);
app.get("/all-tags", getTags);

export default app;
