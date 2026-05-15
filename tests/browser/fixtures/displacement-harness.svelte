<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Displacement } from '../../../packages/ui/src/displacement/index.js';
</script>

<div class="frame" data-testid="frame">
	<Displacement scale={22} turbulence="medium" animated data-testid="displacement">
		<div class="artwork" data-testid="artwork" aria-hidden="true"></div>
	</Displacement>
</div>

<style>
	.frame {
		block-size: calc(var(--dry-space-16) * 3);
		overflow: hidden;
		border-radius: var(--dry-radius-xl);
	}

	.artwork {
		min-block-size: 100%;
		background: linear-gradient(135deg, var(--dry-color-fill-brand), var(--dry-color-bg-inverse));
	}
</style>
