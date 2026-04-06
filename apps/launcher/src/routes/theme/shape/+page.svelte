<script lang="ts">
	import { goto } from '$app/navigation';
	import { WizardShell, Shape } from '@dryui/theme-wizard';
	import SkipTheme from '$lib/components/SkipTheme.svelte';
</script>

<WizardShell>
	<Shape onprev={() => goto('/theme/typography')} onnext={() => goto('/theme/preview')} />

	{#snippet footer()}
		<SkipTheme />
	{/snippet}
</WizardShell>
