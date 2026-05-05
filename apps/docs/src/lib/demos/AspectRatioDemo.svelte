<script lang="ts">
	import { AspectRatio } from '@dryui/ui';
</script>

<div class="grid">
	<AspectRatio ratio={16 / 9}>
		<img
			src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1280&h=720&fit=crop&q=80"
			alt="Landscape"
			loading="lazy"
		/>
	</AspectRatio>
	<AspectRatio ratio={4 / 5}>
		<img
			src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&h=800&fit=crop&q=80"
			alt="Portrait"
			loading="lazy"
		/>
	</AspectRatio>
	<AspectRatio ratio={1}>
		<img
			src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=800&fit=crop&q=80"
			alt="Square"
			loading="lazy"
		/>
	</AspectRatio>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: var(--dry-space-4);
	}

	img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		display: block;
		border-radius: var(--dry-radius-lg);
	}
</style>
