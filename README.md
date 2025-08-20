# mcp-irc-ts
MCP Server listening to the Bluesky Jetstream in Typescript. Allows an MCP client to consume the entire Bluesky firehose in realtime.

# Launching the MCP server and IRC Client

```
node index.ts --mcpPort 3000 -n 1000
```

# Using the MCP server
## Tools
* `getMessages()` - Gets a JSON stringified list of the last `n` (default 100) messages in the form `{ did: did, text: text, time: Date.now() }`
