<script lang="ts">
	import { GodRays } from '@dryui/ui';
</script>

<div class="frame">
	<GodRays
		rayCount={18}
		intensity={78}
		speed={34}
		center={{ x: 0.22, y: 0.02 }}
		color="color-mix(in srgb, var(--dry-color-fill-brand) 42%, transparent)"
		blendMode="screen"
		style="min-block-size: 18rem; border-radius: inherit;"
	/>
</div>

<style>
	.frame {
		display: grid;
		min-block-size: 18rem;
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(135deg, #1f2937, #0f172a);
		overflow: hidden;
	}
</style>
