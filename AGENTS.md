# AGENTS.md

Repo-wide instructions for AI coding agents working in this repository.

## Canonical Docs

- Public overview: [`README.md`](./README.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- CSS discipline and token rules: [`packages/ui/skills/dryui/rules/theming.md`](./packages/ui/skills/dryui/rules/theming.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)

## Canonical Sources

- Editor install snippets and MCP config examples live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts). Do not duplicate them elsewhere.
- Skill sources live in:
  - [`packages/ui/skills/dryui/`](./packages/ui/skills/dryui/)
  - [`packages/feedback/skills/live-feedback/`](./packages/feedback/skills/live-feedback/)
  - [`packages/cli/skills/init/`](./packages/cli/skills/init/)
- Sync generated skill copies with `bun run sync:skills`. Do not edit `packages/plugin/skills/` or `.cursor/rules/` directly.
- The local plugin source is [`packages/plugin`](./packages/plugin). `/plugins` refers to the in-app Codex or Claude install flow, not a repo directory.

## Repo Rules

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- DryUI is pre-alpha. Prefer the current shape over compatibility shims unless a task explicitly asks for backwards compatibility.
- Use the DryUI CLI as the default entry point:

```bash
bun install -g @dryui/cli@latest
dryui
```

- Keep root-level Markdown durable. One-off audits, scratch TODOs, and generated reports belong under `docs/`, `reports/`, or ignored local directories, not the repo root.
- Repo-local editor install output such as `.agents/skills/`, `.github/skills/`, `.opencode/`, and `opencode.json` is not canonical source.

## Isolated Testing

To exercise the public install flow (`bunx @dryui/cli init`, `bun run build`, dev server) without polluting the host Mac, use [smolvm](https://github.com/smol-machines/smolvm), a lightweight Linux microVM that boots in ~240ms on Apple Silicon. Port forwarding lets you open the VM's dev server in your Mac's browser, and Vite HMR works over the same forward.

One-shot install and build smoke test in a disposable VM:

```bash
smolvm machine run --net --image oven/bun:alpine -- sh -c \
  'mkdir -p /app && cd /app && bunx -y @dryui/cli init . --pm bun && bun run build'
```

Persistent dev session with a dynamically-chosen host port (avoids collisions with any existing dev server already on 5173):

```bash
PORT=$(python3 -c 'import socket;s=socket.socket();s.bind(("",0));print(s.getsockname()[1]);s.close()')
smolvm machine create --net --image oven/bun:alpine -p $PORT:5173 dryui-dev
smolvm machine start --name dryui-dev
smolvm machine exec --name dryui-dev -- sh -c 'bunx -y @dryui/cli init /app --pm bun'
echo "→ http://localhost:$PORT"
smolvm machine exec --name dryui-dev -- sh -c \
  'cd /app && bun run dev -- --host 0.0.0.0 --port 5173'
# Ctrl-C the dev server when done, then:
smolvm machine delete -f dryui-dev
```

`--port 5173` inside the VM stays fixed (Vite's default); only the host-side port is dynamic. smolvm does not support `-p 0:5173` auto-allocation, so the Python one-liner picks a free port first. If you prefer a memorable fixed port, `-p 15173:5173` is a safe default.

Install via `curl -sSL https://smolmachines.com/install.sh | bash`, then ensure the extracted `agent-rootfs` lives at `~/Library/Application Support/smolvm/agent-rootfs` (the installer does not always place it there).

## Verification

- After editing `.svelte` files in `packages/ui/`, run `bun run --filter '@dryui/ui' build`.
- For docs work, prefer the root wrappers so local runs match CI: `bun run docs`, `bun run docs:build`, `bun run docs:check`, and `bun run build:docs`.
- After changing skill content or setup guidance, run `bun run sync:skills`.
