<script lang="ts">
	import { FlipCard } from '@dryui/ui';
</script>

<div class="wrap">
	<FlipCard.Root trigger="hover">
		<FlipCard.Front>
			<div class="face">Front</div>
		</FlipCard.Front>
		<FlipCard.Back>
			<div class="face">Back</div>
		</FlipCard.Back>
	</FlipCard.Root>
</div>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 18rem);
	}

	.face {
		display: grid;
		place-items: center;
		min-block-size: 12rem;
		padding: var(--dry-space-5);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-lg-size);
	}
</style>
