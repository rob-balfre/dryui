<script lang="ts">
	import { Button, IconSwap } from '@dryui/ui';
	import { Moon, Pause, Play, Sun } from 'lucide-svelte';

	let playing = $state(false);
	let dark = $state(true);
</script>

<div class="row">
	<Button variant={playing ? 'solid' : 'outline'} onclick={() => (playing = !playing)}>
		<IconSwap icon={playing ? Pause : Play} label={playing ? 'Pause' : 'Play'} />
		{playing ? 'Pause' : 'Play'}
	</Button>
	<Button variant="ghost" onclick={() => (dark = !dark)}>
		<IconSwap icon={dark ? Moon : Sun} label={dark ? 'Dark' : 'Light'} />
		{dark ? 'Dark' : 'Light'}
	</Button>
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}
</style>
