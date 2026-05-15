<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { GradientMesh } from '../../../packages/ui/src/gradient-mesh/index.js';
</script>

<GradientMesh
	colors={['#8b5cf6', '#38bdf8', '#f472b6', '#f59e0b']}
	interactive
	speed={0.25}
	data-testid="gradient-mesh"
>
	<div class="preview" data-testid="gradient-mesh-preview" aria-hidden="true"></div>
</GradientMesh>

<style>
	.preview {
		min-block-size: calc(var(--dry-space-16) * 3);
	}
</style>
