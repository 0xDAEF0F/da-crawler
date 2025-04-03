import { PrismaClient } from "@prisma/client";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { sortedUniq, sortedUniqBy, uniq } from "lodash";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { AVAILABLE_JOBS_TOOL, AVAILABLE_KEYWORDS_TOOL } from "./tools.js";
import { getJobKeywords, getJobs } from "./actions.js";

export const prisma = new PrismaClient();

const server = new Server(
  {
    name: "Job Searchoor",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, () => {
  console.error("Received ListToolsRequest");
  return {
    tools: [AVAILABLE_JOBS_TOOL, AVAILABLE_KEYWORDS_TOOL],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    console.error("Received CallToolRequest:", request);
    try {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error("No arguments provided");
      }

      switch (name) {
        case "get_job_keywords": {
          return await getJobKeywords(args);
        }
        case "get_jobs": {
          return await getJobs(args);
        }
        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

const app = express();

const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (_: Request, res: Response) => {
  // console.log(`someone is connecting at ${new Date().toISOString()}`);
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
    // console.log(`someone disconnected at ${new Date().toISOString()}`);
  });
  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  // console.log("sessionId", sessionId);
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
