#!/usr/bin/env node

/**
 * Example usage of the McpBskyClient as a library
 * This demonstrates how to import and use the client in your own projects
 */

import { McpBskyClient, BskyMessage } from './McpBskyClient.js';

async function exampleUsage() {
    console.log('=== MCP Bluesky Client Library Example ===\n');

    // Create client with custom options
    const client = new McpBskyClient({
        serverUrl: 'http://localhost:3000',
        clientName: 'example-app-client'
    });

    try {
        console.log('1. Connecting to server...');
        await client.connect();

        console.log('2. Listing available tools...');
        const tools = await client.listTools();
        console.log('Available tools:', tools);

        console.log('\n3. Fetching messages...');
        const messages: BskyMessage[] = await client.getMessages();

        if (messages.length > 0) {
            console.log(`Retrieved ${messages.length} messages:`);
            messages.slice(0, 3).forEach((msg, index) => {
                console.log(`${index + 1}. User ${msg.did}: ${msg.text}`);
                console.log(`   Timestamp: ${new Date(msg.time).toLocaleString()}`);
            });

            if (messages.length > 3) {
                console.log(`   ... and ${messages.length - 3} more messages`);
            }
        } else {
            console.log('No messages available');
        }

        console.log('\n4. Using convenience method...');
        await client.getAndDisplayMessages(2);

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        console.log('\n5. Disconnecting...');
        await client.disconnect();
        console.log('Done!');
    }
}

// Run the example
exampleUsage().catch(console.error);
