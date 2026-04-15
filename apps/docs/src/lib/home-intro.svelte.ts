export const homeIntroPrompts = {
	bun: 'bun install -g @dryui/cli@latest && dryui',
	npm: 'npm install -g @dryui/cli@latest && dryui',
	pnpm: 'pnpm add -g @dryui/cli@latest && dryui'
} as const;

export const homeIntroPrompt = homeIntroPrompts.bun;
