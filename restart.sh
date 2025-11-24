#!/bin/bash
# Restart the server by killing the process on port 8080 and starting again

# Find PID on port 8080
PID=$(lsof -t -i :8080)

if [ -n "$PID" ]; then
  echo "Found process $PID on port 8080. Killing it..."
  kill -9 $PID
  echo "Process killed."
else
  echo "No process found on port 8080."
fi

# Start the app
echo "Starting server..."
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Run start.sh from that directory
"$SCRIPT_DIR/start.sh"
