<script lang="ts">
	import { LogoMark } from '@dryui/ui';
</script>

<div class="row">
	<LogoMark fallback="DR" alt="DryUI" size="sm" />
	<LogoMark fallback="DR" alt="DryUI" size="md" />
	<LogoMark fallback="DR" alt="DryUI" size="lg" />
	<LogoMark fallback="DR" alt="DryUI" size="lg" shape="circle" color="brand" />
	<LogoMark
		src="https://images.unsplash.com/photo-1557683316-973673baf926?w=160&h=160&fit=crop"
		alt="Planet Supplies"
		size="lg"
		shape="rounded"
	/>
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
