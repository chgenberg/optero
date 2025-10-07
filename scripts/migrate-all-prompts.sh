#!/bin/bash

# Migrate all 934 prompts from PromptLibrary to TaskSolution
# This script runs in batches to avoid timeouts

API_URL="https://optero-production.up.railway.app/api/admin/migrate-prompts"
BATCH_SIZE=10
TOTAL_PROMPTS=934
TOTAL_BATCHES=$((($TOTAL_PROMPTS + $BATCH_SIZE - 1) / $BATCH_SIZE))

echo "🚀 Starting migration of 934 prompts in batches of ${BATCH_SIZE}"
echo "📊 Total batches to process: ${TOTAL_BATCHES}"
echo ""

START_FROM=0
BATCH_NUM=1

while [ $START_FROM -lt $TOTAL_PROMPTS ]; do
  echo "⏳ Processing batch ${BATCH_NUM}/${TOTAL_BATCHES} (starting from ${START_FROM})..."
  
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"batchSize\": ${BATCH_SIZE}, \"startFrom\": ${START_FROM}}")
  
  # Extract info from response
  SUCCESS=$(echo $RESPONSE | grep -o '"success":true' || echo "")
  PROCESSED=$(echo $RESPONSE | grep -o '"processed":[0-9]*' | grep -o '[0-9]*')
  SKIPPED=$(echo $RESPONSE | grep -o '"skipped":[0-9]*' | grep -o '[0-9]*')
  ERRORS=$(echo $RESPONSE | grep -o '"errors":[0-9]*' | grep -o '[0-9]*')
  NEXT_BATCH=$(echo $RESPONSE | grep -o '"nextBatch":[0-9]*' | grep -o '[0-9]*')
  
  if [ -z "$SUCCESS" ]; then
    echo "❌ Batch ${BATCH_NUM} failed!"
    echo "Response: $RESPONSE"
    break
  fi
  
  echo "   ✓ Processed: ${PROCESSED:-0}, Skipped: ${SKIPPED:-0}, Errors: ${ERRORS:-0}"
  
  # Check if done
  if [ -z "$NEXT_BATCH" ] || [ "$NEXT_BATCH" == "null" ]; then
    echo ""
    echo "✅ Migration complete!"
    break
  fi
  
  START_FROM=$NEXT_BATCH
  BATCH_NUM=$((BATCH_NUM + 1))
  
  # Small delay to avoid overwhelming the API
  sleep 2
done

echo ""
echo "📊 Final statistics:"
curl -s "https://optero-production.up.railway.app/api/admin/db-stats" | python3 -m json.tool | grep -A 6 "stats"
