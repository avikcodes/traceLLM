export type DocsPage = {
  title: string;
  slug: string;
  description: string;
};

export type DocsSection = {
  title: string;
  pages: DocsPage[];
};

export const docsSections = [
  {
    title: "Getting Started",
    pages: [
      {
        title: "What is TraceLLM?",
        slug: "getting-started/what-is-tracellm",
        description: "A short overview of TraceLLM and the problems it solves.",
      },
      {
        title: "Quick Start",
        slug: "getting-started/quick-start",
        description: "Install TraceLLM and capture a first trace.",
      },
      {
        title: "Installation",
        slug: "getting-started/installation",
        description: "Supported installation paths and environment setup.",
      },
      {
        title: "First Trace",
        slug: "getting-started/first-trace",
        description: "Create and inspect your first TraceLLM execution record.",
      },
    ],
  },
  {
    title: "CLI Commands",
    pages: [
      {
        title: "tracellm",
        slug: "cli/tracellm",
        description: "Top-level TraceLLM CLI command reference.",
      },
      {
        title: "tracellm start",
        slug: "cli/tracellm-start",
        description: "Start the local TraceLLM runtime.",
      },
      {
        title: "tracellm trace",
        slug: "cli/tracellm-trace",
        description: "Trace prompts, tool calls, retries, and model responses.",
      },
      {
        title: "tracellm replay",
        slug: "cli/tracellm-replay",
        description: "Replay a recorded execution timeline.",
      },
      {
        title: "tracellm monitor",
        slug: "cli/tracellm-monitor",
        description: "Watch live trace events from the terminal.",
      },
      {
        title: "tracellm export",
        slug: "cli/tracellm-export",
        description: "Export trace data for analysis and sharing.",
      },
    ],
  },
  {
    title: "SDK",
    pages: [
      {
        title: "@trace decorator",
        slug: "sdk/trace-decorator",
        description: "Mark functions for automatic tracing.",
      },
      {
        title: "Sync Functions",
        slug: "sdk/sync-functions",
        description: "Trace synchronous application code.",
      },
      {
        title: "Async Functions",
        slug: "sdk/async-functions",
        description: "Trace async workflows and awaited tool calls.",
      },
      {
        title: "Nested Traces",
        slug: "sdk/nested-traces",
        description: "Represent parent-child execution spans.",
      },
    ],
  },
  {
    title: "Integrations",
    pages: [
      {
        title: "OpenAI",
        slug: "integrations/openai",
        description: "Trace OpenAI requests and responses.",
      },
      {
        title: "Groq",
        slug: "integrations/groq",
        description: "Trace Groq-powered LLM workflows.",
      },
      {
        title: "LangChain",
        slug: "integrations/langchain",
        description: "Trace LangChain chains, tools, and agents.",
      },
    ],
  },
  {
    title: "Core Concepts",
    pages: [
      {
        title: "Replay Engine",
        slug: "core-concepts/replay-engine",
        description: "Understand how TraceLLM reconstructs execution history.",
      },
      {
        title: "Trace Model",
        slug: "core-concepts/trace-model",
        description: "Learn the shape of a TraceLLM trace.",
      },
      {
        title: "Execution Timeline",
        slug: "core-concepts/execution-timeline",
        description: "Understand ordering, spans, events, and state transitions.",
      },
    ],
  },
  {
    title: "Dashboard",
    pages: [
      {
        title: "Overview",
        slug: "dashboard/overview",
        description: "Navigate the visual layer on top of TraceLLM.",
      },
      {
        title: "Traces",
        slug: "dashboard/traces",
        description: "Browse and inspect recorded traces.",
      },
      {
        title: "Analytics",
        slug: "dashboard/analytics",
        description: "Review latency, token usage, and execution trends.",
      },
      {
        title: "Live Logs",
        slug: "dashboard/live-logs",
        description: "Watch trace events arrive in real time.",
      },
      {
        title: "Failures",
        slug: "dashboard/failures",
        description: "Inspect errors, retries, and failed execution branches.",
      },
    ],
  },
  {
    title: "Developers",
    pages: [
      {
        title: "Architecture",
        slug: "developers/architecture",
        description: "Understand TraceLLM internals and system boundaries.",
      },
      {
        title: "Environment Variables",
        slug: "developers/environment-variables",
        description: "Configure TraceLLM for local and production workflows.",
      },
      {
        title: "MongoDB",
        slug: "developers/mongodb",
        description: "Configure and operate the trace database.",
      },
      {
        title: "WebSocket",
        slug: "developers/websocket",
        description: "Stream live trace events to clients.",
      },
      {
        title: "API Reference",
        slug: "developers/api-reference",
        description: "Placeholder reference for TraceLLM API endpoints.",
      },
    ],
  },
  {
    title: "Examples",
    pages: [
      {
        title: "OpenAI Example",
        slug: "examples/openai-example",
        description: "Placeholder OpenAI tracing example.",
      },
      {
        title: "Groq Example",
        slug: "examples/groq-example",
        description: "Placeholder Groq tracing example.",
      },
      {
        title: "Agent Example",
        slug: "examples/agent-example",
        description: "Placeholder agent tracing example.",
      },
      {
        title: "RAG Example",
        slug: "examples/rag-example",
        description: "Placeholder RAG tracing example.",
      },
    ],
  },
  {
    title: "Resources",
    pages: [
      {
        title: "FAQ",
        slug: "resources/faq",
        description: "Frequently asked questions placeholder.",
      },
      {
        title: "Troubleshooting",
        slug: "resources/troubleshooting",
        description: "Common issues and debugging paths placeholder.",
      },
    ],
  },
] satisfies DocsSection[];

export const docsPages = docsSections.flatMap((section) => section.pages);

export function getDocsPage(slug: string) {
  return docsPages.find((page) => page.slug === slug);
}

export function getDocsPageIndex(slug: string) {
  return docsPages.findIndex((page) => page.slug === slug);
}

export function getDefaultDocsPage() {
  return docsPages[0];
}
