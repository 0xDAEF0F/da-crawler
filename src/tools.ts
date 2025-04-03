import { type Tool } from "@modelcontextprotocol/sdk/types.js";

export const AVAILABLE_JOBS_TOOL: Tool = {
  name: "get_jobs",
  description: "Get the available jobs",
  inputSchema: {
    type: "object",
    properties: {
      sinceWhen: {
        type: "string",
        description:
          "Since when to get available jobs. e.g., '1d' or '1w' (only days and weeks are supported)",
        required: true,
      },
      isRemote: {
        type: "boolean",
        description: "Whether to filter jobs by remote work",
        optional: true,
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords to filter jobs by",
        default: [],
      },
    },
  },
};

export const AVAILABLE_KEYWORDS_TOOL: Tool = {
  name: "get_job_keywords",
  description: "Get the available job keywords",
  inputSchema: {
    type: "object",
    properties: {
      sinceWhen: {
        type: "string",
        description:
          "Since when to get the job keywords. e.g., '1d' or '1w' (only days and weeks are supported)",
        required: true,
      },
    },
  },
};
