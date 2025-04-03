import { PrismaClient } from "@prisma/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { z } from "zod";

const prisma = new PrismaClient();
const server = new McpServer({
  name: "Job Searchoor",
  version: "0.1.0",
});

server.tool("echo", { message: z.string() }, async ({ message }) => ({
  content: [{ type: "text", text: `Tool echo: ${message}` }],
}));

// TODO: Refactor this tool (need implement isRemote)
server.tool(
  "get-jobs",
  {
    sinceDate: z.string().datetime(),
    isRemote: z.boolean().optional(),
    keywords: z.array(z.string()).default([]),
  },
  async ({ sinceDate, isRemote, keywords }) => {
    const date = new Date(sinceDate);
    const jobs = (
      await prisma.job.findMany({
        where: { date: { gte: date } },
      })
    ).map((job) => ({ ...job, tags: JSON.parse(job.tags) }));
    // filter jobs by keywords/tags
    const filteredJobsByTags = jobs.filter((job) => {
      if (keywords.length === 0) return true;
      for (const keyword of keywords) {
        if (job.tags.includes(keyword)) return true;
      }
      return false;
    });
    return {
      content: [{ type: "text", text: JSON.stringify(filteredJobsByTags) }],
    };
  },
);

const app = express();

const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
    console.log("deleting transport", transport.sessionId);
  });
  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  console.log("sessionId", sessionId);
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    console.error("No transport found for sessionId", sessionId);
    res.status(400).send("No transport found for sessionId");
  }
});

app.listen(3001);
console.log(`Express server running at http://localhost:3001`);
