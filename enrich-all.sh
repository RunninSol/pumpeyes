#!/bin/bash

TOTAL_TOKENS=48154
BATCH_SIZE=100
OFFSET=0

echo "=========================================="
echo "🚀 STARTING FULL METADATA ENRICHMENT"
echo "=========================================="
echo "Total tokens: $TOTAL_TOKENS"
echo "Batch size: $BATCH_SIZE"
echo "Rate: 250 req/sec"
echo "=========================================="
echo ""

while [ $OFFSET -lt $TOTAL_TOKENS ]; do
  BATCH_NUM=$((OFFSET / BATCH_SIZE + 1))
  TOTAL_BATCHES=$(((TOTAL_TOKENS + BATCH_SIZE - 1) / BATCH_SIZE))
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Batch $BATCH_NUM/$TOTAL_BATCHES"
  echo "   Offset: $OFFSET"
  echo "   Processing tokens $OFFSET to $((OFFSET + BATCH_SIZE - 1))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  curl -s "http://localhost:3000/api/enrich-metadata?limit=$BATCH_SIZE&offset=$OFFSET"
  
  OFFSET=$((OFFSET + BATCH_SIZE))
  
  # Small delay between batches
  sleep 1
done

echo ""
echo "=========================================="
echo "✅ ENRICHMENT COMPLETE!"
echo "=========================================="
