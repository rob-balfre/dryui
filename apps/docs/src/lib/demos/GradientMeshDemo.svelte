<script lang="ts">
	import { GradientMesh } from '@dryui/ui';
</script>

<div class="frame">
	<GradientMesh colors={['#8b5cf6', '#38bdf8', '#f472b6', '#f59e0b']} interactive speed={0.25}>
		<div class="preview" aria-hidden="true"></div>
	</GradientMesh>
</div>

<style>
	.frame {
		border-radius: var(--dry-radius-xl);
		overflow: hidden;
	}

	.preview {
		min-block-size: 18rem;
	}
</style>
