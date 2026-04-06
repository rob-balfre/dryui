<script lang="ts">
	import { Hotkey, Kbd, Text, Badge } from '@dryui/ui';

	let count = $state(0);
</script>

<Hotkey keys="ctrl+k" handler={() => count++} />

<div class="demo">
	<Text color="secondary">Press <Kbd keys={['Ctrl', 'K']} /> to trigger the hotkey</Text>
	{#if count > 0}
		<Badge variant="soft" color="green">Triggered {count} {count === 1 ? 'time' : 'times'}</Badge>
	{/if}
</div>

<style>
	.demo {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}
</style>
