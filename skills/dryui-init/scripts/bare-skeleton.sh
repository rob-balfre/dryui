#!/usr/bin/env bash
# Bootstrap a SvelteKit + DryUI project from a bare bun-init / npm-init skeleton.
#
# Usage: bare-skeleton.sh <project-dir>
#
# Idempotent. Safe to re-run. Performs:
#   1. Triage check (exits 2 if the dir is not a bare skeleton).
#   2. Removes bun-init artifact (index.ts / index.js).
#   3. Copies templates verbatim from the skill's templates/ dir.
#   4. Merges scripts + devDependencies + type:module into package.json
#      via jq (preserves existing keys, especially `overrides`).
#   5. Appends SvelteKit/Vite ignores to .gitignore.
#   6. Detects local dryui workspace; if found, registers each package via
#      `bun link` and sets overrides with `link:@dryui/<pkg>`.
#   7. Installs runtime + lint via bun.
#   8. Runs `bun run check` to validate the contract.

set -euo pipefail

PROJECT_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATES_DIR="$SKILL_DIR/templates"

cd "$PROJECT_DIR"

echo "[dryui-init] Step 1: triage"
if [ -f svelte.config.js ] || [ -f svelte.config.ts ]; then
  echo "[dryui-init] not bare: svelte.config found — route=existing-sveltekit"
  exit 2
fi
if [ -d src ]; then
  echo "[dryui-init] not bare: src/ exists without svelte.config — route=ambiguous (ask user)"
  exit 2
fi

echo "[dryui-init] Step 2: remove bun-init artifact"
rm -f index.ts index.js

echo "[dryui-init] Step 3: copy templates from $TEMPLATES_DIR"
cp -R "$TEMPLATES_DIR/." .

echo "[dryui-init] Step 4: merge package.json (preserving overrides + other keys)"
[ -f package.json ] || echo '{"name":"app","private":true}' > package.json
jq '.type = "module"
  | .scripts = ((.scripts // {}) + {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "prepare": "svelte-kit sync || echo \"\"",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
    })
  | .dependencies = ((.dependencies // {}) + {
      "lucide-svelte": "^1.0.1"
    })
  | .devDependencies = ((.devDependencies // {}) + {
      "@sveltejs/adapter-auto": "^7.0.1",
      "@sveltejs/kit": "^2.57.0",
      "@sveltejs/vite-plugin-svelte": "^7.0.0",
      "@types/node": "^25.6.2",
      "svelte": "^5.55.2",
      "svelte-check": "^4.4.6",
      "typescript": "^6.0.2",
      "vite": "^8.0.7"
    })' package.json > package.json.new && mv package.json.new package.json

echo "[dryui-init] Step 5: append SvelteKit/Vite ignores to .gitignore"
touch .gitignore
GITIGNORE_BLOCK="
# SvelteKit
/.svelte-kit
/build
.output
.vercel
.netlify
.wrangler

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
"
if ! grep -q "/.svelte-kit" .gitignore; then
  printf "%s\n" "$GITIGNORE_BLOCK" >> .gitignore
fi

echo "[dryui-init] Step 6: detect local dryui workspace"
DRYUI_REPO=""
for candidate in \
  "${DRYUI_LOCAL:-}" \
  "$(cd .. 2>/dev/null && pwd)/dryui" \
  "$HOME/dryui" \
  "$HOME/src/dryui" \
  "$HOME/code/dryui"; do
  [ -z "$candidate" ] && continue
  if [ -f "$candidate/packages/lint/package.json" ] && [ -f "$candidate/packages/ui/package.json" ]; then
    DRYUI_REPO="$candidate"
    break
  fi
done

if [ -n "$DRYUI_REPO" ]; then
  echo "[dryui-init] found local dryui workspace at $DRYUI_REPO — linking"
  # Link every dryui workspace package; bun overrides only apply when the
  # package is also resolved, so all five must be registered globally.
  for pkg in ui lint primitives feedback feedback-server; do
    if [ -f "$DRYUI_REPO/packages/$pkg/package.json" ]; then
      ( cd "$DRYUI_REPO/packages/$pkg" && bun link >/dev/null 2>&1 ) &
    fi
  done
  wait

  # Only override packages that are actual deps; a dead override entry can
  # mislead callers into thinking the package is installed when bun has not
  # resolved it (overrides apply only when the package is also a dep).
  jq '
    .overrides = ((.overrides // {}) + {
      "@dryui/ui": "link:@dryui/ui",
      "@dryui/lint": "link:@dryui/lint",
      "@dryui/primitives": "link:@dryui/primitives",
      "@dryui/feedback": "link:@dryui/feedback",
      "@dryui/feedback-server": "link:@dryui/feedback-server"
    })
    | .dependencies = ((.dependencies // {}) + {"@dryui/ui": "*"})
    | .devDependencies = ((.devDependencies // {}) + {"@dryui/lint": "*", "@dryui/feedback": "*", "@dryui/feedback-server": "*"})
  ' package.json > package.json.new && mv package.json.new package.json

  echo "[dryui-init] Step 7: bun install with link overrides"
  bun install
else
  echo "[dryui-init] no local dryui workspace found (set DRYUI_LOCAL to override) — using published packages"
  echo "[dryui-init] Step 7: bun add @dryui/ui from npm; @dryui/lint + @dryui/feedback + @dryui/feedback-server as dev"
  bun add @dryui/ui &
  bun add -d @dryui/lint @dryui/feedback @dryui/feedback-server &
  wait
fi

echo "[dryui-init] Step 8: bun run check"
bun run check
