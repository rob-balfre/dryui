<script lang="ts">
	import { ChromaticAberration } from '@dryui/ui';
</script>

<ChromaticAberration offset={3} angle={18}>
	<h3 class="title">Chromatic Aberration</h3>
</ChromaticAberration>

<style>
	.title {
		margin: 0;
		font-size: clamp(1.85rem, 3.6vw, 2.75rem);
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: var(--dry-color-text-strong);
	}
</style>
