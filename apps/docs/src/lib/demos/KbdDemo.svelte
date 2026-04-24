<script lang="ts">
	import { Kbd } from '@dryui/ui';

	const shortcuts = [
		{ keys: ['⌘', 'K'], label: 'Open command palette' },
		{ keys: ['⌘', '/'], label: 'Toggle AI assist' },
		{ keys: ['⌘', 'Shift', 'P'], label: 'Run deploy task' },
		{ keys: ['G', 'I'], label: 'Jump to issues' },
		{ keys: ['Esc'], label: 'Dismiss overlay' }
	];
</script>

<div class="palette">
	<p class="eyebrow">Shortcuts</p>
	<dl class="rows">
		{#each shortcuts as shortcut (shortcut.label)}
			<div class="row">
				<dt class="label">{shortcut.label}</dt>
				<dd class="keys">
					{#each shortcut.keys as key (key)}
						<Kbd>{key}</Kbd>
					{/each}
				</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	.palette {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
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
		gap: var(--dry-space-2);
		margin: 0;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.label {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.keys {
		margin: 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1);
	}
</style>
