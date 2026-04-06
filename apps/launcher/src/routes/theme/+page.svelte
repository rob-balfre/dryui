<script lang="ts">
	import { goto } from '$app/navigation';
	import { WizardShell, PersonalityStep } from '@dryui/theme-wizard';
	import SkipTheme from '$lib/components/SkipTheme.svelte';
</script>

<WizardShell>
	<PersonalityStep onnext={() => goto('/theme/colour')} />

	{#snippet footer()}
		<SkipTheme />
	{/snippet}
</WizardShell>
