<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import { CountrySelect as UiCountrySelect } from '../../../packages/ui/src/country-select/index.js';
	import PrimitiveCountrySelect from '../../../packages/primitives/src/country-select/country-select.svelte';

	let {
		variant = 'ui',
		initialValue = 'US'
	}: {
		variant?: 'ui' | 'primitive';
		initialValue?: string;
	} = $props();

	let value = $state('');

	$effect(() => {
		value = initialValue;
	});
</script>

<div data-testid="bound-value">{value}</div>

{#if variant === 'ui'}
	<UiCountrySelect bind:value aria-label="Country" name="country" showDialCode />
{:else}
	<PrimitiveCountrySelect bind:value aria-label="Country" name="country" showDialCode />
{/if}
