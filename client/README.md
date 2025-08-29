# MCP Bluesky Jetstream Client

A TypeScript MCP (Model Context Protocol) client for consuming the Bluesky Jetstream MCP server.

## Features

- Connects to MCP server via **StreamableHTTP** transport
- Lists available tools on the server
- Calls the `getMessages` tool to retrieve recent Bluesky posts
- Command-line interface with configurable options
- **Library API** for programmatic use in other projects
- TypeScript support with full type definitions
- Comprehensive error handling

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Basic Usage

```bash
# Run the client (connects to localhost:3000 by default)
npm start

# Or run directly with Node.js
node dist/index.js
```

### Testing with Server

To test the full client-server integration, use the provided test script:

```bash
# Make sure you're in the project root directory
./client/test-with-server.sh
```

This script will:
1. Start the MCP server in the background
2. Wait for it to initialize
3. Run the client to connect and retrieve messages
4. Clean up by stopping the server

### Command Line Options

- `--server <url>`: Server URL (default: `http://localhost:3000`)
- `--name <name>`: Client name (default: `mcp-client-bsky-jetstream`)
- `--help, -h`: Show help message

### Examples

```bash
# Connect to a different server
npm start -- --server http://localhost:3001

# Use a custom client name
npm start -- --name my-custom-client

# Show help
npm start -- --help
```

### Using as a Library

You can also import and use the `McpBskyClient` class in your own projects:

```typescript
import { McpBskyClient, BskyMessage } from 'mcp-bsky-jetstream-client';

async function main() {
    // Create client instance
    const client = new McpBskyClient({
        serverUrl: 'http://localhost:3000',
        clientName: 'my-app-client'
    });

    try {
        // Connect to server
        await client.connect();

        // Get available tools
        const tools = await client.listTools();
        console.log('Available tools:', tools);

        // Get messages
        const messages: BskyMessage[] = await client.getMessages();

        // Process messages
        messages.forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.did}: ${msg.text}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Always disconnect
        await client.disconnect();
    }
}

main();
```

**API Reference:**

```typescript
interface McpBskyClientOptions {
  serverUrl?: string;    // Default: 'http://localhost:3000'
  clientName?: string;   // Default: 'mcp-client-bsky-jetstream'
}

interface BskyMessage {
  did: string;     // User DID
  text: string;    // Message text
  time: number;    // Timestamp
}

class McpBskyClient {
  constructor(options?: McpBskyClientOptions)

  // Connection management
  connect(): Promise<void>
  disconnect(): Promise<void>

  // Tool operations
  listTools(): Promise<string[]>
  getMessages(): Promise<BskyMessage[]>

  // Convenience methods
  getAndDisplayMessages(limit?: number): Promise<void>

  // Getters
  getServerUrl(): string
  getClientName(): string
}
```

## Development

For development with hot reloading:

```bash
npm run dev
```

This uses `tsx` for TypeScript execution without building.

## How It Works

1. **Connection**: Establishes a StreamableHTTP connection to the MCP server
2. **Initialization**: Performs MCP handshake and initialization
3. **Tool Discovery**: Lists available tools on the server
4. **Tool Execution**: Calls the `getMessages` tool to retrieve recent messages
5. **Display**: Shows the retrieved messages in a formatted output

## Requirements

- Node.js 18+
- Running MCP Bluesky Jetstream server (see parent directory)

## Error Handling

The client includes comprehensive error handling for:
- Connection failures
- Server unavailability
- Invalid responses
- Tool execution errors

All errors are logged to the console with descriptive messages.
