<script lang="ts">
	import { Halftone } from '@dryui/ui';
</script>

<div class="frame">
	<Halftone dotSize="coarse" angle={24} opacity={0.44} color="rgba(88, 51, 27, 0.94)">
		<div class="surface"></div>
	</Halftone>
</div>

<style>
	.frame {
		display: grid;
		border-radius: var(--dry-radius-xl);
		overflow: hidden;
	}

	.surface {
		min-block-size: 18rem;
		background: linear-gradient(145deg, #f9d39a, #f19aa5 54%, #a978f5);
	}
</style>
