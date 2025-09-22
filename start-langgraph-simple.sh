#!/bin/bash

# Simple LangGraph Server Start Script

echo "🚀 Starting LangGraph Server..."
echo "📍 Location: services/langgraph_v10"
echo "🌐 Server will be available at: http://localhost:2024"
echo ""

# Change to the langgraph directory
cd services/langgraph_v10 || (
    echo "❌ Error: Could not find services/langgraph_v10 directory"
    exit 1
)

# Activate the virtual environment
echo "🔧 Activating Python virtual environment..."
source .venv/bin/activate || (
    echo "❌ Error: Could not activate virtual environment"
    echo "💡 Make sure the venv exists: services/langgraph_v10/.venv"
    exit 1
)

# Check if langgraph command is available
if ! command -v langgraph &> /dev/null; then
    echo "❌ Error: LangGraph CLI not found in venv"
    echo "💡 Try reinstalling: pip install -U \"langgraph-cli[inmem]\""
    exit 1
fi

echo "✅ Environment ready!"
echo "🌟 Starting LangGraph development server..."
echo "📚 API Docs: http://localhost:2024/docs"
echo "🎛️  LangGraph Studio: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024"
echo ""
echo "Press Ctrl+C to stop the server"
echo "═══════════════════════════════════════════════════════════════"

# Start the server
langgraph dev
