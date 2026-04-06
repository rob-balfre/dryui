<script lang="ts">
	import { AspectRatio } from '@dryui/ui';
</script>

<AspectRatio>
	<div class="placeholder">
		<span>16:9 content area</span>
	</div>
</AspectRatio>

<style>
	.placeholder {
		background: var(--dry-color-bg-raised);
		display: grid;
		place-items: center;
		height: 100%;
		border-radius: var(--dry-radius-md);
	}
</style>
