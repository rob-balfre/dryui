<script lang="ts">
	import { Icon } from '@dryui/ui';
	import { CheckCircle2, GitBranch, Rocket } from 'lucide-svelte';
</script>

<div class="row">
	<Icon label="Deploy" size="sm">
		<Rocket aria-hidden="true" />
	</Icon>
	<Icon label="Branch" size="md">
		<GitBranch aria-hidden="true" />
	</Icon>
	<Icon label="Success" size="lg" color="primary">
		<CheckCircle2 aria-hidden="true" />
	</Icon>
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
