<script lang="ts">
	import { goto } from '$app/navigation';
	import { WizardShell, BrandColor } from '@dryui/theme-wizard';
	import SkipTheme from '$lib/components/SkipTheme.svelte';
</script>

<WizardShell>
	<BrandColor onprev={() => goto('/theme')} onnext={() => goto('/theme/typography')} />

	{#snippet footer()}
		<SkipTheme />
	{/snippet}
</WizardShell>
