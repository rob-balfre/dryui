#!/usr/bin/env bash

CONFIG_PATH="${DRYUI_FEEDBACK_CONFIG_PATH:-$HOME/.dryui-feedback/server.json}"
BASE_URL="${DRYUI_FEEDBACK_URL:-}"

if [ -z "$BASE_URL" ] && [ -f "$CONFIG_PATH" ]; then
  BASE_URL=$(python3 - "$CONFIG_PATH" <<'PY' 2>/dev/null
import json
import pathlib
import sys

try:
    data = json.loads(pathlib.Path(sys.argv[1]).read_text())
    print((data.get("baseUrl") or "").rstrip("/"))
except Exception:
    pass
PY
)
fi

if [ -z "$BASE_URL" ]; then
  HOST="${DRYUI_FEEDBACK_HOST:-127.0.0.1}"
  PORT="${DRYUI_FEEDBACK_PORT:-4748}"
  BASE_URL="http://${HOST}:${PORT}"
fi

RESPONSE=$(curl -s --connect-timeout 1 "${BASE_URL%/}/pending" 2>/dev/null) || exit 0
COUNT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('count',0))" 2>/dev/null)
[ -z "$COUNT" ] || [ "$COUNT" = "0" ] && exit 0

echo "=== DRYUI FEEDBACK ($COUNT pending) ==="
echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, a in enumerate(data.get('annotations', []), 1):
    print(f'[{i}] {a[\"element\"]} — {a.get(\"elementPath\", \"\")}')
    print(f'    Comment: {a[\"comment\"]}')
    if a.get('nearbyText'):
        print(f'    Context: {a[\"nearbyText\"]}')
    if a.get('svelteComponents'):
        print(f'    Svelte: {a[\"svelteComponents\"]}')
    if a.get('intent'):
        print(f'    Intent: {a[\"intent\"]}')
    if a.get('severity'):
        print(f'    Severity: {a[\"severity\"]}')
    print()
"
echo "=== END DRYUI FEEDBACK ==="
