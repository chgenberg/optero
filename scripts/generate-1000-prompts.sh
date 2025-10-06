#!/bin/bash

# Generate 1000 prompts for top 100 professions
# 100 professions × 10 prompts = 1000 prompts
# 5 professions per batch = 20 batches total

echo "🚀 Starting bulk prompt generation..."
echo "📊 Target: 1000 prompts (100 professions × 10 prompts)"
echo "💰 Estimated cost: $5-6 USD (~50-60 SEK)"
echo "⏱️  Estimated time: 10-15 minutes"
echo ""

API_URL="https://optero-production.up.railway.app/api/admin/bulk-generate-prompts"

# Run 20 batches (0-19)
for i in {0..19}
do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Running batch $i/20..."
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"batchIndex\": $i, \"professionsPerBatch\": 5}")
  
  # Extract stats from response
  success=$(echo "$response" | grep -o '"success":true' || echo "failed")
  created=$(echo "$response" | grep -o '"totalPromptsCreated":[0-9]*' | grep -o '[0-9]*' || echo "0")
  progress=$(echo "$response" | grep -o '"percentage":[0-9]*' | grep -o '[0-9]*' || echo "0")
  
  if [ "$success" == "failed" ]; then
    echo "❌ Batch $i failed"
    echo "$response"
  else
    echo "✅ Batch $i complete"
    echo "   Created: $created prompts"
    echo "   Progress: $progress%"
  fi
  
  echo ""
  
  # Small delay between batches
  sleep 2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Bulk generation complete!"
echo ""
echo "📊 Checking total prompts in database..."

# Check total prompts
curl -s "https://optero-production.up.railway.app/api/admin/check-prompts" | \
  grep -o '"totalPrompts":[0-9]*' | \
  grep -o '[0-9]*' | \
  xargs -I {} echo "✅ Total prompts in database: {}"

echo ""
echo "🚀 Done!"
