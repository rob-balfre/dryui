<script lang="ts">
	import { ChromaticShift } from '@dryui/ui';
</script>

<div class="grid">
	<ChromaticShift offset={4} trigger="hover">
		<div class="surface"></div>
	</ChromaticShift>
	<ChromaticShift offset={3} trigger="always" animated>
		<div class="surface"></div>
	</ChromaticShift>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: var(--dry-space-3);
	}

	.surface {
		aspect-ratio: 4 / 3;
		border-radius: var(--dry-radius-lg);
		background-image:
			radial-gradient(circle at 25% 30%, rgba(56, 189, 248, 0.5) 0%, transparent 55%),
			radial-gradient(circle at 78% 70%, rgba(167, 139, 250, 0.5) 0%, transparent 55%);
	}
</style>
