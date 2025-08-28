#!/usr/bin/env node
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-empty-pattern: 0 */


import express from "express";
import { v4 } from "uuid";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";
import minimist from 'minimist';
import { TinyJetstream as Jetstream } from 'mbjc/tinyjetstream.min.js';

const argv = minimist(process.argv.slice(2));

const jetstream = new Jetstream({
	wantedCollections: ["app.bsky.feed.post",
        //  "app.bsky.feed.like"
        ], // omit to receive all collections
	wantedDids: [
        // "did:web:example.com"
    ], // omit to receive events from all dids
});

const lastMessages: {}[] = []; // this could be redis

// jetstream.onCreate("app.bsky.feed.post", (event) => {
jetstream.onTweet = (event: { did: string, commit: { record: { text: string }}}) => {
    const text = event.commit.record.text;
    const did = event.did;
    lastMessages.unshift({
        did: did, text: text, time: Date.now()
    });
    lastMessages.splice(argv["n"] || 100);
    if (!argv["silent"]) {
        console.log(did + ': ' + text);
    }
};
// });

// jetstream.on("open", () => {
//     console.log("open");
// });

// jetstream.on("close", () => {
//     console.log("close");
// });

// jetstream.on("error", event => {
//     console.log("error");
//     console.log(event);
// });

console.log("constructed");
jetstream.start();
console.log("started");


const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => v4(),
            onsessioninitialized: (sessionId) => {
                // Store the transport by session ID
                transports[sessionId] = transport;
            },
            // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
            // locally, make sure to set:
            // enableDnsRebindingProtection: true,
            // allowedHosts: ['127.0.0.1'],
            });

        // Clean up transport when closed
        transport.onclose = () => {
            if (transport.sessionId) {
                delete transports[transport.sessionId];
            }
        };
        const server = new McpServer({
        name: "mcp-server-bsky-jetstream",
        version: "1.0.0"
        }, { capabilities: { tools: {}}});

        // ... set up server resources, tools, and prompts ...

        server.registerTool(
            "getMessages",
            {
                description: "Get the last n messages",
                inputSchema: {},
            },
            async ({ }) => {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(lastMessages),
                        },
                    ],
                };
            }
        );

        // Connect to the MCP server
        await server.connect(transport);
    } else {
        // Invalid request
        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided',
            },
            id: null,
        });
        return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);
console.log("listening");
app.listen(argv["mcpPort"] || 3000);
