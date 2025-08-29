#!/bin/bash

# Test script to run both server and client together
# This demonstrates the full MCP client-server communication

echo "Starting MCP Bluesky Jetstream Server..."
echo "Note: Make sure you're in the project root directory"
echo ""

# Start the server in the background
cd ..
npm start &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "Waiting 3 seconds for server to initialize..."
sleep 3

echo ""
echo "Starting MCP Client..."
cd client
npm start

echo ""
echo "Stopping server..."
kill $SERVER_PID

echo "Test completed!"
