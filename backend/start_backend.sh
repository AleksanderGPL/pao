#!/bin/bash
echo "Starting start_backend.sh script..."
cd /home/pi/pao/backend || { echo "Failed to change directory to /home/pi/pao/backend"; exit 1; }
echo "Current working directory: $(pwd)"

# Source the .env file
if [ -f ./.env ]; then
    echo "Sourcing ./.env file..."
    set -a # Automatically export all variables
    . ./.env
    set +a
    echo "Environment variables loaded."
else
    echo "Error: ./.env file not found!"
    exit 1
fi

echo "Executing deno task start..."
/home/pi/.deno/bin/deno task start
echo "deno task start command finished."