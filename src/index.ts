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

server.tool(
  "get-jobs",
  {
    sinceDate: z.string(),
    isRemote: z.boolean().optional(),
    keywords: z.array(z.string()).default([]),
  },
  async ({ sinceDate, isRemote, keywords }) => {
    console.log({ sinceDate, isRemote, keywords });
    return {
      content: [{ type: "text", text: "jobs pending..." }],
    };
  }
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
