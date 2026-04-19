<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Combobox } from '../combobox/index.js';
	import CountrySelectSync from './country-select-sync.svelte';
	import { COUNTRY_DATA, filterCountriesByRegions } from '../internal/countries.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		value?: string;
		regions?: string[];
		showDialCode?: boolean;
		disabled?: boolean;
		placeholder?: string;
		name?: string;
		onchange?: (code: string) => void;
		children?: Snippet;
	}

	let {
		value = $bindable(''),
		regions,
		showDialCode = false,
		disabled = false,
		placeholder = 'Select country',
		name,
		id,
		class: className,
		onchange,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		'aria-describedby': ariaDescribedby,
		'aria-invalid': ariaInvalid,
		'aria-errormessage': ariaErrormessage,
		...rest
	}: Props = $props();

	let open = $state(false);
	let query = $state('');
	let userHasTyped = $state(false);

	const inputProps = $derived(id ? { id } : {});
	const filteredCountries = $derived(filterCountriesByRegions(COUNTRY_DATA, regions));
	const selectedCountry = $derived(filteredCountries.find((country) => country.code === value));
	const selectedName = $derived(selectedCountry?.name ?? '');
	const searchResults = $derived.by(() => {
		if (!userHasTyped) {
			return filteredCountries;
		}

		const trimmed = query.trim();
		if (trimmed === '') {
			return filteredCountries;
		}

		const normalizedQuery = trimmed.toLowerCase();
		return filteredCountries.filter(
			(country) =>
				country.name.toLowerCase().includes(normalizedQuery) ||
				country.code.toLowerCase().includes(normalizedQuery) ||
				country.dialCode.includes(trimmed)
		);
	});

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		query = event.currentTarget.value;
		userHasTyped = true;
	}

	function handleFocus() {
		query = selectedName;
		userHasTyped = false;
	}

	function handleSelect(code: string, name: string) {
		query = name;
		userHasTyped = false;
		onchange?.(code);
	}
</script>

<Combobox.Root bind:open bind:value {disabled} {name}>
	<CountrySelectSync
		{open}
		{query}
		{userHasTyped}
		selectedCode={value}
		{selectedName}
		results={searchResults}
	/>

	<div data-part="country-select" class={className} {...rest}>
		<label
			data-part="control"
			data-state={open ? 'open' : 'closed'}
			data-disabled={disabled ? '' : undefined}
		>
			<span data-part="flag" aria-hidden="true">
				{selectedCountry?.flag ?? '\u{1F30D}'}
			</span>

			<Combobox.Input
				{...inputProps}
				data-part="input"
				{disabled}
				{placeholder}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledby}
				aria-describedby={ariaDescribedby}
				aria-invalid={ariaInvalid}
				aria-errormessage={ariaErrormessage}
				autocomplete="off"
				spellcheck="false"
				onfocus={handleFocus}
				oninput={handleInput}
			/>

			{#if showDialCode && selectedCountry}
				<span data-part="dial-code" aria-hidden="true">{selectedCountry.dialCode}</span>
			{/if}
		</label>

		<Combobox.Content data-part="dropdown">
			{#if searchResults.length === 0}
				<Combobox.Empty data-part="empty">No countries found.</Combobox.Empty>
			{:else}
				{#each searchResults as country, index (country.code)}
					<Combobox.Item
						value={country.code}
						{index}
						data-part="option"
						data-flag={country.flag}
						data-dial-code={showDialCode ? country.dialCode : undefined}
						onclick={() => handleSelect(country.code, country.name)}
					>
						<span data-part="country-name">{country.name}</span>
					</Combobox.Item>
				{/each}
			{/if}
		</Combobox.Content>
	</div>
</Combobox.Root>
