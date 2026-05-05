<script lang="ts">
	import { Displacement } from '@dryui/ui';
</script>

<div class="frame">
	<Displacement scale={22} turbulence="medium" animated>
		<div class="artwork" aria-hidden="true"></div>
	</Displacement>
</div>

<style>
	.frame {
		overflow: hidden;
		border-radius: var(--dry-radius-xl);
		aspect-ratio: 16 / 9;
	}

	.artwork {
		min-block-size: 100%;
		background:
			radial-gradient(ellipse 70% 80% at 30% 30%, rgba(251, 146, 60, 0.62) 0%, transparent 60%),
			radial-gradient(ellipse 70% 60% at 78% 70%, rgba(56, 189, 248, 0.58) 0%, transparent 60%),
			linear-gradient(145deg, #1f2937, #0f172a);
	}
</style>
