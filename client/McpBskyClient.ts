import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export interface McpBskyClientOptions {
  serverUrl?: string;
  clientName?: string;
}

export interface BskyMessage {
  did: string;
  text: string;
  time: number;
}

export class McpBskyClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport;
  private serverUrl: string;
  private clientName: string;

  constructor(options: McpBskyClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:3000';
    this.clientName = options.clientName || 'mcp-client-bsky-jetstream';

    // Create StreamableHTTP transport for connecting to the server
    this.transport = new StreamableHTTPClientTransport(new URL(`${this.serverUrl}/mcp`));

    // Create MCP client
    this.client = new Client(
      {
        name: this.clientName,
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    console.log(`Connecting to MCP server at ${this.serverUrl}`);
    await this.client.connect(this.transport);
    console.log("Connected to MCP server successfully");
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.close();
    console.log("Disconnected from MCP server");
  }

  /**
   * List available tools on the server
   */
  async listTools(): Promise<string[]> {
    const toolsResponse = await this.client.listTools();
    return toolsResponse.tools.map((t: any) => t.name);
  }

  /**
   * Get recent messages from the Bluesky jetstream
   */
  async getMessages(): Promise<BskyMessage[]> {
    console.log("Calling getMessages tool...");
    const messagesResponse = await this.client.callTool({
      name: "getMessages",
      arguments: {}
    });

    if (messagesResponse.content && Array.isArray(messagesResponse.content) && messagesResponse.content.length > 0) {
      return JSON.parse((messagesResponse.content[0] as any).text);
    }

    return [];
  }

  /**
   * Get recent messages and display them (convenience method)
   */
  async getAndDisplayMessages(limit: number = 5): Promise<void> {
    const messages = await this.getMessages();

    if (messages.length === 0) {
      console.log("No messages received");
      return;
    }

    console.log(`\nReceived ${messages.length} messages:`);
    messages.slice(0, limit).forEach((msg: BskyMessage, index: number) => {
      console.log(`${index + 1}. ${msg.did}: ${msg.text}`);
    });

    if (messages.length > limit) {
      console.log(`... and ${messages.length - limit} more messages`);
    }
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Get client name
   */
  getClientName(): string {
    return this.clientName;
  }
}
