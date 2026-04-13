<script lang="ts">
	import { Shimmer } from '@dryui/ui';
	import { Sparkles } from 'lucide-svelte';
</script>

<div class="stage">
	<Shimmer color="#ffc27a" duration={3}>
		<Sparkles size={18} aria-hidden="true" />
		Theme Wizard
	</Shimmer>
</div>

<style>
	.stage {
		display: grid;
		place-items: center;
		padding: var(--dry-space-8);
		font-size: var(--dry-text-base-size);
		font-weight: 500;
		color: var(--dry-color-text-strong);
	}
</style>
