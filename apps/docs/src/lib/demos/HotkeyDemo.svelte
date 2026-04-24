<script lang="ts">
	import { Hotkey, Kbd } from '@dryui/ui';

	type Binding = { action: string; keys: string[]; combo: string };

	const bindings: Binding[] = [
		{ action: 'Open command palette', keys: ['Ctrl', 'K'], combo: 'ctrl+k' },
		{ action: 'Create deploy', keys: ['Ctrl', 'Shift', 'D'], combo: 'ctrl+shift+d' },
		{ action: 'Jump to search', keys: ['/'], combo: 'slash' }
	];

	let lastFired = $state<string | null>(null);
	let count = $state(0);
</script>

{#each bindings as binding (binding.combo)}
	<Hotkey
		keys={binding.combo}
		handler={() => {
			lastFired = binding.action;
			count++;
		}}
	/>
{/each}

<div class="palette">
	<p class="eyebrow">Keyboard shortcuts</p>
	<ul class="rows">
		{#each bindings as binding (binding.combo)}
			<li class="row">
				<span class="action">{binding.action}</span>
				<Kbd keys={binding.keys} />
			</li>
		{/each}
	</ul>

	<p class="status" aria-live="polite">
		{#if lastFired}
			Fired <strong>{lastFired}</strong> ({count} {count === 1 ? 'time' : 'times'})
		{:else}
			Press a shortcut to try it.
		{/if}
	</p>
</div>

<style>
	.palette {
		display: grid;
		gap: var(--dry-space-3);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.rows {
		display: grid;
		gap: var(--dry-space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 50%, transparent);
	}

	.action {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.status {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.status strong {
		color: var(--dry-color-text-strong);
		font-weight: 600;
	}
</style>
