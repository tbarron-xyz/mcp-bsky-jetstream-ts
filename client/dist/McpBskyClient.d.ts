export interface McpBskyClientOptions {
    serverUrl?: string;
    clientName?: string;
}
export interface BskyMessage {
    did: string;
    text: string;
    time: number;
}
export declare class McpBskyClient {
    private client;
    private transport;
    private serverUrl;
    private clientName;
    constructor(options?: McpBskyClientOptions);
    /**
     * Connect to the MCP server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the MCP server
     */
    disconnect(): Promise<void>;
    /**
     * List available tools on the server
     */
    listTools(): Promise<string[]>;
    /**
     * Get recent messages from the Bluesky jetstream
     */
    getMessages(): Promise<BskyMessage[]>;
    /**
     * Get recent messages and display them (convenience method)
     */
    getAndDisplayMessages(limit?: number): Promise<void>;
    /**
     * Get server URL
     */
    getServerUrl(): string;
    /**
     * Get client name
     */
    getClientName(): string;
}
