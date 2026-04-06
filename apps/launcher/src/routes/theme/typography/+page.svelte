<script lang="ts">
	import { goto } from '$app/navigation';
	import { WizardShell, Typography } from '@dryui/theme-wizard';
	import SkipTheme from '$lib/components/SkipTheme.svelte';
</script>

<WizardShell>
	<Typography onprev={() => goto('/theme/colour')} onnext={() => goto('/theme/shape')} />

	{#snippet footer()}
		<SkipTheme />
	{/snippet}
</WizardShell>
