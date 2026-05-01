export const homeIntroPrompts = {
	bun: 'target="$(readlink ~/.bun/install/global/node_modules/@dryui/cli 2>/dev/null || true)"; case "$target" in */packages/cli) DRYUI_DEV=1 dryui ;; *) bun install -g @dryui/cli@latest && dryui ;; esac',
	npm: 'target="$(readlink ~/.bun/install/global/node_modules/@dryui/cli 2>/dev/null || true)"; case "$target" in */packages/cli) DRYUI_DEV=1 dryui ;; *) npm install -g @dryui/cli@latest && dryui ;; esac',
	pnpm: 'target="$(readlink ~/.bun/install/global/node_modules/@dryui/cli 2>/dev/null || true)"; case "$target" in */packages/cli) DRYUI_DEV=1 dryui ;; *) pnpm add -g @dryui/cli@latest && dryui ;; esac'
} as const;
