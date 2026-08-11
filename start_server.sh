#!/bin/bash
export ALLOWED_ORIGIN=http://localhost
export ENCRYPTION_KEY=test-key-12345678901234567890123456789012
nohup node src/server.js > server.log 2>&1 &
sleep 3
curl -s http://localhost:3000/health