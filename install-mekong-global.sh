#!/usr/bin/env bash
# install-mekong-global.sh
# ------------------------------------------------------------------
# Installs the mekong-cli command/skill/agent library into
# ~/.claude/ so every Claude Code project on this Mac can use
# /mekong:<name> slash-commands.
#
# Run ONCE from your Mac terminal:
#   bash "/Users/mac/mekong-cli/SALE MLM/install-mekong-global.sh"
#
# What it does:
#   - Points ~/.claude/commands/mekong  ->  SALE MLM/.mekong/cli-cache/.claude/commands
#   - Points ~/.claude/skills/mekong    ->  SALE MLM/.mekong/cli-cache/.claude/skills
#   - Points ~/.claude/agents/mekong    ->  SALE MLM/.mekong/cli-cache/.claude/agents
#
# Idempotent — safe to re-run.
# ------------------------------------------------------------------
set -euo pipefail

CACHE="/Users/mac/mekong-cli/SALE MLM/.mekong/cli-cache"
CLAUDE_HOME="${HOME}/.claude"

if [ ! -d "${CACHE}/.claude/commands" ]; then
  echo "ERROR: mekong-cli cache not found at ${CACHE}" >&2
  echo "Clone the repo first:" >&2
  echo "  git clone --depth 1 https://github.com/longtho638-jpg/mekong-cli.git \"${CACHE}\"" >&2
  exit 1
fi

mkdir -p "${CLAUDE_HOME}/commands" "${CLAUDE_HOME}/skills" "${CLAUDE_HOME}/agents"

# Remove any prior mekong symlinks/dirs before re-linking
for sub in commands skills agents; do
  target="${CLAUDE_HOME}/${sub}/mekong"
  if [ -L "${target}" ] || [ -e "${target}" ]; then
    rm -rf "${target}"
  fi
done

ln -s "${CACHE}/.claude/commands" "${CLAUDE_HOME}/commands/mekong"
ln -s "${CACHE}/.claude/skills"   "${CLAUDE_HOME}/skills/mekong"
ln -s "${CACHE}/.claude/agents"   "${CLAUDE_HOME}/agents/mekong"

CMD_COUNT=$(find -L "${CLAUDE_HOME}/commands/mekong" -name '*.md' | wc -l | tr -d ' ')
SKILL_COUNT=$(find -L "${CLAUDE_HOME}/skills/mekong" -name 'SKILL.md' | wc -l | tr -d ' ')

echo "Installed mekong-cli into ~/.claude/"
echo "  ${CMD_COUNT} slash commands   (/mekong:<name>)"
echo "  ${SKILL_COUNT} skills"
echo ""
echo "Try it:  open any folder in Claude Code and type  /mekong:"
echo "Update:  bash \"/Users/mac/mekong-cli/SALE MLM/mekong-sync.sh\""
