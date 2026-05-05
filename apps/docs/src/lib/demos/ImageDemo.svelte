<script lang="ts">
	import { Image } from '@dryui/ui';
</script>

<div class="frame">
	<Image
		src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop&q=80"
		alt="Mountain ridge at sunrise"
		loading="lazy"
	/>
</div>

<style>
	.frame {
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: var(--dry-radius-lg);
	}
</style>
