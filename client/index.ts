#!/usr/bin/env node

import { McpBskyClient } from './McpBskyClient.js';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

async function main() {
    const serverUrl = argv.server || 'http://localhost:3000';
    const clientName = argv.name || 'mcp-client-bsky-jetstream';

    // Create MCP client instance
    const client = new McpBskyClient({
        serverUrl,
        clientName
    });

    try {
        // Connect to the server
        await client.connect();

        // List available tools
        const tools = await client.listTools();
        console.log("Available tools:", tools);

        // Get and display messages
        await client.getAndDisplayMessages();

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Clean up
        await client.disconnect();
    }
}

// Handle command line arguments
if (argv.help || argv.h) {
    console.log(`
MCP Bluesky Jetstream Client

Usage: node dist/index.js [options]

Options:
  --server <url>    Server URL (default: http://localhost:3000)
  --name <name>     Client name (default: mcp-client-bsky-jetstream)
  --help, -h        Show this help message

Examples:
  node dist/index.js
  node dist/index.js --server http://localhost:3001
  node dist/index.js --name my-custom-client
`);
    process.exit(0);
}

main().catch(console.error);
