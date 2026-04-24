<script lang="ts">
	import { Button, IconSwap, Text } from '@dryui/ui';
	import { Eye, EyeOff, Moon, Pause, Play, Sun } from 'lucide-svelte';

	let playing = $state(false);
	let dark = $state(true);
	let visible = $state(false);
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Keyed icon swap</p>
		<Text color="secondary" size="sm">
			IconSwap crossfades when the key changes, keeping the layout still and the transition on the
			glyph itself.
		</Text>
	</div>

	<div class="row">
		<Button variant={playing ? 'solid' : 'outline'} onclick={() => (playing = !playing)}>
			<IconSwap
				icon={playing ? Pause : Play}
				label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
			/>
			{playing ? 'Pause walkthrough' : 'Play walkthrough'}
		</Button>

		<Button variant="ghost" onclick={() => (dark = !dark)}>
			<IconSwap icon={dark ? Moon : Sun} label={dark ? 'Dark theme' : 'Light theme'} />
			{dark ? 'Dark' : 'Light'}
		</Button>

		<Button variant="ghost" onclick={() => (visible = !visible)}>
			<IconSwap icon={visible ? Eye : EyeOff} label={visible ? 'Hide token' : 'Show token'} />
			{visible ? 'sk_live_••••c4a9' : 'Show secret'}
		</Button>
	</div>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
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

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}
</style>
