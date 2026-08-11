#!/usr/bin/env bash
# mekong-sync.sh
# Pulls the latest mekong-cli into the cache. Run whenever you
# want new commands/skills from upstream.
set -euo pipefail

CACHE="/Users/mac/mekong-cli/SALE MLM/.mekong/cli-cache"

if [ ! -d "${CACHE}/.git" ]; then
  echo "Cache not found at ${CACHE}" >&2
  echo "Cloning fresh..."
  mkdir -p "$(dirname "${CACHE}")"
  git clone --depth 1 https://github.com/longtho638-jpg/mekong-cli.git "${CACHE}"
  exit 0
fi

cd "${CACHE}"
echo "Pulling latest from $(git remote get-url origin)..."
git fetch --depth 1 origin main
git reset --hard origin/main

CMD_COUNT=$(find .claude/commands -name '*.md' | wc -l | tr -d ' ')
SKILL_COUNT=$(find .claude/skills -name 'SKILL.md' | wc -l | tr -d ' ')
echo "Synced. Now have ${CMD_COUNT} commands and ${SKILL_COUNT} skills."
