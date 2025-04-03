import { type Tool } from "@modelcontextprotocol/sdk/types.js";

export const AVAILABLE_JOBS_TOOL: Tool = {
  name: "get_jobs",
  description: "Get the available jobs",
  inputSchema: {
    type: "object",
    properties: {
      sinceDate: {
        type: "string",
        description: "The date since when to get the available jobs",
      },
      isRemote: {
        type: "boolean",
        description: "Whether to filter jobs by remote work",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords to filter jobs by",
      },
      required: ["sinceDate"],
    },
  },
};
