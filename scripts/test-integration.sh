#!/bin/bash

# AI Style Studio Integration Test Script
# This script sends a style transfer request and listens for SSE progress.

API_URL="http://localhost:8080/query"
SSE_BASE_URL="http://localhost:8080/events"

echo "🚀 Starting Integration Test..."

# 1. Start Style Transfer Mutation
RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { startStyleTransfer(input: { modelId: \"inception-v3\", contentImagePath: \"test.jpg\", styleImagePath: \"style.jpg\", iterations: 100 }) { taskId status } }"}')

TASK_ID=$(echo $RESPONSE | grep -oE '"taskId":"([^"]+)"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
  echo "❌ Failed to start task. Response: $RESPONSE"
  exit 1
fi

echo "✅ Task Started. Task ID: $TASK_ID"
echo "📡 Listening for SSE events (Ctrl+C to stop early)..."

# 2. Listen for SSE events
curl -N -s $SSE_BASE_URL/$TASK_ID | while read line; do
  if [[ "$line" == "data: "* ]]; then
    DATA=${line#data: }
    STATUS=$(echo $DATA | grep -oE '"status":"([^"]+)"' | cut -d'"' -f4)
    STEP=$(echo $DATA | grep -oE '"step":([0-9]+)' | cut -d':' -f2)
    MAX=$(echo $DATA | grep -oE '"maxSteps":([0-9]+)' | cut -d':' -f2)
    
    echo "📊 Status: $STATUS | Step: $STEP/$MAX"
    
    if [[ "$STATUS" == "completed" ]]; then
      echo "🎉 Test passed! Style transfer completed."
      exit 0
    elif [[ "$STATUS" == "error" ]]; then
      echo "❌ Test failed! Server reported an error."
      exit 1
    fi
  fi
done
