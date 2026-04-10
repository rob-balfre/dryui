<script lang="ts">
	import { Badge, ShaderCanvas, Text } from '@dryui/ui';
</script>

<div class="demo-shell">
	<div class="shader-stage">
		<ShaderCanvas fps={30} aspectRatio="16 / 9">
			<div class="shader-copy">
				<Badge variant="outline" color="gray">30 FPS demo budget</Badge>
				<Text color="secondary" size="sm">
					Decorative shaders are capped and framed inside a bounded preview surface.
				</Text>
			</div>
		</ShaderCanvas>
	</div>
</div>

<style>
	.demo-shell {
		display: grid;
		grid-template-columns: minmax(0, min(100%, 48rem));
		justify-content: center;
	}

	.shader-stage {
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: var(--dry-radius-xl);
	}

	.shader-copy {
		display: grid;
		align-content: end;
		gap: var(--dry-space-3);
		block-size: 100%;
		padding: var(--dry-space-6);
		background: linear-gradient(
			180deg,
			transparent 0%,
			color-mix(in srgb, var(--dry-color-bg-base) 72%, transparent) 70%,
			color-mix(in srgb, var(--dry-color-bg-base) 92%, var(--dry-color-bg-overlay)) 100%
		);
	}
</style>
