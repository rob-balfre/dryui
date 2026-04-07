<script>
	import { ChromaticShift } from '@dryui/ui';
</script>

<div class="demo-grid">
	<ChromaticShift offset={4} trigger="hover">
		<div class="demo-card">
			<p class="demo-heading">Hover me</p>
			<p class="demo-text">RGB channel separation on hover</p>
		</div>
	</ChromaticShift>

	<ChromaticShift offset={5} trigger="always" animated>
		<div class="demo-card">
			<p class="demo-heading">Always active</p>
			<p class="demo-text">Animated chromatic drift</p>
		</div>
	</ChromaticShift>

	<ChromaticShift offset={3} trigger="always" channels="rb">
		<div class="demo-card">
			<p class="demo-heading">Red + Blue</p>
			<p class="demo-text">Two-channel mode</p>
		</div>
	</ChromaticShift>
</div>

<style>
	.demo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--dry-space-4, 1rem);
	}

	.demo-card {
		background: var(--dry-color-bg-raised, #1a1a2e);
		padding: var(--dry-space-6, 1.5rem);
		border-radius: var(--dry-radius-lg, 12px);
		text-align: center;
	}

	.demo-heading {
		font-size: var(--dry-text-lg, 1.125rem);
		font-weight: 600;
		color: var(--dry-color-text-strong, #fff);
		margin: 0 0 var(--dry-space-2, 0.5rem);
	}

	.demo-text {
		font-size: var(--dry-text-sm, 0.875rem);
		color: var(--dry-color-text-weak, #999);
		margin: 0;
	}
</style>
