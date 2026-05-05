<script lang="ts">
	import { Hotkey, Kbd } from '@dryui/ui';

	let lastFired = $state<string | null>(null);
</script>

<Hotkey keys="ctrl+k" handler={() => (lastFired = 'ctrl+k')} />
<Hotkey keys="ctrl+shift+d" handler={() => (lastFired = 'ctrl+shift+d')} />
<Hotkey keys="slash" handler={() => (lastFired = '/')} />

<div class="stack">
	<div class="row">
		<span>Open palette</span>
		<Kbd keys={['Ctrl', 'K']} />
	</div>
	<div class="row">
		<span>Create</span>
		<Kbd keys={['Ctrl', 'Shift', 'D']} />
	</div>
	<div class="row">
		<span>Search</span>
		<Kbd keys={['/']} />
	</div>
	<p class="status" aria-live="polite">
		{lastFired ? `Fired: ${lastFired}` : 'Press a shortcut to try it.'}
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.status {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
