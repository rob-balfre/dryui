<script lang="ts">
	import { ImageComparison } from '@dryui/ui';
</script>

{#snippet beforeScene()}
	<div class="scene before">
		<span>Before</span>
	</div>
{/snippet}

{#snippet afterScene()}
	<div class="scene after">
		<span>After</span>
	</div>
{/snippet}

<div class="frame">
	<ImageComparison before={beforeScene} after={afterScene} />
</div>

<style>
	.frame {
		aspect-ratio: 16 / 9;
		min-height: 16rem;
	}

	.scene {
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: white;
	}

	.before {
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.45), transparent 35%),
			linear-gradient(135deg, #6f8cff, #4b63d1 55%, #22317a);
	}

	.after {
		background:
			radial-gradient(circle at top right, rgba(255, 255, 255, 0.4), transparent 30%),
			linear-gradient(135deg, #ffbf6f, #ff8a47 45%, #6e2c16);
	}
</style>
