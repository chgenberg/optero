#!/bin/bash

# Reformaterar alla prompts i databasen med GPT-5-mini
# Kör i batchar för att undvika timeout

API_URL="https://optero-production.up.railway.app/api/admin/reformat-prompts"
BATCH_SIZE=10
OFFSET=0
TOTAL=0

echo "🚀 STARTAR OMFORMATERING AV ALLA PROMPTS"
echo "========================================"
echo ""

while true; do
  echo "📦 Batch från offset $OFFSET..."
  
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"batchSize\": $BATCH_SIZE, \"offset\": $OFFSET}")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if there are more to process
  HAS_MORE=$(echo "$RESPONSE" | jq -r '.hasMore')
  PROCESSED=$(echo "$RESPONSE" | jq -r '.processed')
  TOTAL=$(echo "$RESPONSE" | jq -r '.total')
  
  echo ""
  echo "📊 Progress: $PROCESSED / $TOTAL"
  echo ""
  
  if [ "$HAS_MORE" != "true" ]; then
    echo "✅ ALLA PROMPTS OMFORMATERADE!"
    break
  fi
  
  OFFSET=$PROCESSED
  
  # Wait a bit between batches
  echo "⏳ Väntar 3 sekunder innan nästa batch..."
  sleep 3
done

echo ""
echo "🎉 KLART! Totalt $TOTAL prompts behandlade."
