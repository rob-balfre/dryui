<script lang="ts">
	import { ThemeToggle } from '@dryui/ui';

	let mode = $state<string>('auto');
</script>

<div class="toggle-demo">
	<div class="status">
		<p class="eyebrow">Current mode</p>
		<p class="value">{mode}</p>
	</div>
	<ThemeToggle storageKey="dryui-docs-theme" onModeChange={(m) => (mode = m)} />
	<p class="note">
		ThemeToggle stores the preference under <code>dryui-docs-theme</code> and falls back to the system
		preference the first time a visitor loads the page.
	</p>
</div>

<style>
	.toggle-demo {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.status {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.value {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		grid-column: 1 / -1;
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
		max-inline-size: 62ch;
	}

	.note code {
		font-family: var(--dry-font-mono);
		font-size: 0.9em;
	}
</style>
