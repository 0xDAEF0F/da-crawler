import { FastMCP } from "fastmcp";
import type { Job } from "./types";
import { type } from "arktype";

const server = new FastMCP({
  name: "Job Searchoor",
  version: "0.1.0",
});

server.addTool({
  name: "get_jobs",
  description: "Get the available jobs",
  parameters: type({
    sinceWhen: "/^[0-9]+[dw]$/",
    keywords: "string[]",
    excludeKeywords: "string[]",
    isRemote: "boolean?",
  }),
  execute: async (args) => {
    console.error(args);
    const response = await fetch("http://localhost:3000/get-jobs", {
      method: "POST",
      body: JSON.stringify(args),
    });
    const data = (await response.json()) as { error: boolean; jobs: Job[] };
    return {
      content: [{ type: "text", text: JSON.stringify(data.jobs) }],
    };
  },
});

server.start({ transportType: "stdio" });
