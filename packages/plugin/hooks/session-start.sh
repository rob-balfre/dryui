#!/usr/bin/env bash
# DryUI ambient context hook.
# Runs `dryui ambient` (via npx fallback) and emits the output as
# SessionStart additionalContext JSON so Claude Code can inject it
# before the agent acts. Exits silently (with no context) when not
# inside a DryUI project.

set -eu

# Prefer the `dryui-ambient` bin if it's on PATH (installed CLI). Fall
# back to `dryui ambient` subcommand, and finally to npx so users who
# have not installed @dryui/cli globally still get ambient context.
if command -v dryui-ambient >/dev/null 2>&1; then
  ambient_output="$(dryui-ambient 2>/dev/null || true)"
elif command -v dryui >/dev/null 2>&1; then
  ambient_output="$(dryui ambient 2>/dev/null || true)"
else
  ambient_output="$(npx -y @dryui/cli ambient 2>/dev/null || true)"
fi

# Strip trailing whitespace/newlines. If empty, stay silent (exit 0 with
# no body) so non-DryUI sessions don't see any banner.
ambient_output="$(printf '%s' "$ambient_output" | sed -e 's/[[:space:]]*$//')"

if [ -z "$ambient_output" ]; then
  exit 0
fi

# JSON-escape the payload and emit as SessionStart additionalContext.
# We use python3 (available on macOS + most Linux) to avoid fragile
# bash-based escaping.
python3 - "$ambient_output" <<'PY'
import json, sys
context = sys.argv[1]
payload = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": context
    }
}
print(json.dumps(payload))
PY
