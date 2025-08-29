import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
export class McpBskyClient {
    client;
    transport;
    serverUrl;
    clientName;
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || 'http://localhost:3000';
        this.clientName = options.clientName || 'mcp-client-bsky-jetstream';
        // Create StreamableHTTP transport for connecting to the server
        this.transport = new StreamableHTTPClientTransport(new URL(`${this.serverUrl}/mcp`));
        // Create MCP client
        this.client = new Client({
            name: this.clientName,
            version: "1.0.0",
        }, {
            capabilities: {},
        });
    }
    /**
     * Connect to the MCP server
     */
    async connect() {
        console.log(`Connecting to MCP server at ${this.serverUrl}`);
        await this.client.connect(this.transport);
        console.log("Connected to MCP server successfully");
    }
    /**
     * Disconnect from the MCP server
     */
    async disconnect() {
        await this.client.close();
        console.log("Disconnected from MCP server");
    }
    /**
     * List available tools on the server
     */
    async listTools() {
        const toolsResponse = await this.client.listTools();
        return toolsResponse.tools.map((t) => t.name);
    }
    /**
     * Get recent messages from the Bluesky jetstream
     */
    async getMessages() {
        console.log("Calling getMessages tool...");
        const messagesResponse = await this.client.callTool({
            name: "getMessages",
            arguments: {}
        });
        if (messagesResponse.content && Array.isArray(messagesResponse.content) && messagesResponse.content.length > 0) {
            return JSON.parse(messagesResponse.content[0].text);
        }
        return [];
    }
    /**
     * Get recent messages and display them (convenience method)
     */
    async getAndDisplayMessages(limit = 5) {
        const messages = await this.getMessages();
        if (messages.length === 0) {
            console.log("No messages received");
            return;
        }
        console.log(`\nReceived ${messages.length} messages:`);
        messages.slice(0, limit).forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.did}: ${msg.text}`);
        });
        if (messages.length > limit) {
            console.log(`... and ${messages.length - limit} more messages`);
        }
    }
    /**
     * Get server URL
     */
    getServerUrl() {
        return this.serverUrl;
    }
    /**
     * Get client name
     */
    getClientName() {
        return this.clientName;
    }
}
