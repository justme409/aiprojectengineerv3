#!/bin/bash

# Start LangGraph Server Script
# This script activates the Python venv and starts the LangGraph dev server

echo "🚀 Starting LangGraph Server..."
echo "📍 Location: services/langgraph_v10"
echo "🌐 Server will be available at: http://localhost:2024"
echo ""

# Change to the langgraph directory
cd services/langgraph_v10 || {
    echo "❌ Error: Could not find services/langgraph_v10 directory"
    exit 1
}

# Activate the virtual environment
echo "🔧 Activating Python 3.11 virtual environment..."
source .venv/bin/activate || {
    echo "❌ Error: Could not activate virtual environment"
    echo "💡 Make sure the venv exists: services/langgraph_v10/.venv"
    exit 1
}

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

# Log file location (in root directory)
LOG_FILE="/app/aiprojectengineerv3/langgraph_server.log"
WINDOW_FILE="/app/aiprojectengineerv3/langgraph_server.last10k.log"

# Function to trim log file to last 10000 characters
trim_log() {
    while true; do
        if [ -f "$LOG_FILE" ]; then
            # Get file size
            FILE_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo "0")

            # If file is larger than 10000 characters, trim it
            if [ "$FILE_SIZE" -gt 10000 ]; then
                # Keep only the last 10000 characters WITHOUT replacing the inode.
                # This ensures the writer (tee) keeps writing to the same file descriptor.
                TMP_FILE="$(mktemp)"
                tail -c 10000 "$LOG_FILE" > "$TMP_FILE"
                # Truncate and rewrite in place to preserve inode
                cat "$TMP_FILE" > "$LOG_FILE"
                rm -f "$TMP_FILE"
            fi
        fi
        sleep 1  # Check every second
    done
}

# Start the log trimming function in background
trim_log &
TRIM_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping LangGraph server..."
    kill $TRIM_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo "📝 Server logs will be written to: $LOG_FILE"
echo "🔄 Log will be automatically trimmed to last 10000 characters"
echo "🪵 Live 10k window (continuously updated): $WINDOW_FILE"

# Start the server and redirect output to log files
# - Force unbuffered, line-buffered output so streaming events flush immediately
# - Use append mode for main log
# - Continuously maintain a separate 10k-byte rolling window file from the live stream
touch "$LOG_FILE" 2>/dev/null || true
: > "$WINDOW_FILE" 2>/dev/null || true

RUN_CMD="langgraph dev"
if command -v stdbuf >/dev/null 2>&1; then
    RUN_CMD="stdbuf -oL -eL $RUN_CMD"
fi

PY_BIN="python"
if ! command -v "$PY_BIN" >/dev/null 2>&1; then
    PY_BIN="python3"
fi

PYTHONUNBUFFERED=1 $RUN_CMD 2>&1 | tee -a "$LOG_FILE" | "$PY_BIN" -u /app/aiprojectengineerv3/scripts/rolling_window.py --output "$WINDOW_FILE" --bytes 10000
