<script lang="ts">
	import { GradientMesh } from '@dryui/ui';
</script>

<div class="frame">
	<GradientMesh colors={['#8b5cf6', '#38bdf8', '#f472b6', '#f59e0b']} interactive speed={0.25}>
		<span aria-hidden="true"></span>
	</GradientMesh>
</div>

<style>
	.frame {
		display: grid;
		min-block-size: 18rem;
		border-radius: var(--dry-radius-xl);
		overflow: hidden;
	}
</style>
