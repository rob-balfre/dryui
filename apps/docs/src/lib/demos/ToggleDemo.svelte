<script lang="ts">
	import { Toggle } from '@dryui/ui';

	let wrap = $state(true);
	let minimap = $state(false);
	let whitespace = $state(false);
</script>

<div class="panel">
	<p class="eyebrow">Editor</p>
	<p class="title">View options</p>
	<div class="toggles">
		<Toggle bind:pressed={wrap}>Word wrap</Toggle>
		<Toggle bind:pressed={minimap}>Minimap</Toggle>
		<Toggle bind:pressed={whitespace}>Show whitespace</Toggle>
	</div>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-2);
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

	.title {
		margin: 0 0 var(--dry-space-2);
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.toggles {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
