<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { COUNTRY_DATA, type CountryInfo } from '../internal/countries.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		value?: string;
		defaultCountry?: string;
		disabled?: boolean;
		name?: string;
		placeholder?: string;
		countries?: CountryInfo[];
		onchange?: (value: string) => void;
		children?: Snippet;
	}

	let {
		value = $bindable(''),
		defaultCountry = 'US',
		disabled = false,
		name,
		placeholder = 'Phone number',
		countries: countriesProp,
		onchange,
		...rest
	}: Props = $props();

	const countries = $derived(countriesProp ?? COUNTRY_DATA);
	let manualCountryCode = $derived(defaultCountry);

	const orderedCountries = $derived(
		[...countries].sort((left, right) => right.dialCode.length - left.dialCode.length)
	);
	const parsedValue = $derived.by(() => {
		if (!value) {
			return {
				countryCode: manualCountryCode,
				localNumber: ''
			};
		}

		if (value.startsWith('+')) {
			const match = orderedCountries.find((country) => value.startsWith(country.dialCode));
			if (match) {
				return {
					countryCode: match.code,
					localNumber: value.slice(match.dialCode.length).replace(/\D/g, '')
				};
			}
		}

		return {
			countryCode: manualCountryCode,
			localNumber: value.replace(/\D/g, '')
		};
	});

	const selectedCountryCode = $derived(parsedValue.countryCode);
	const localNumber = $derived(parsedValue.localNumber);
	const selectedCountry = $derived(
		countries.find((country) => country.code === selectedCountryCode) ?? countries[0]!
	);

	function updateValue(nextNumber: string, country = selectedCountry) {
		value = nextNumber ? `${country.dialCode}${nextNumber}` : '';
		onchange?.(value);
	}

	function formatNumber(num: string, pattern?: string): string {
		if (!pattern) return num;
		const digits = num.replace(/\D/g, '');
		let result = '';
		let digitIndex = 0;
		for (const char of pattern) {
			if (digitIndex >= digits.length) break;
			if (char === '#') {
				result += digits[digitIndex++];
			} else {
				result += char;
			}
		}
		return result;
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const digits = input.value.replace(/\D/g, '');

		// Format display
		input.value = formatNumber(digits, selectedCountry.format);

		// Update E.164 value
		updateValue(digits);
	}

	function handleCountryChange(e: Event) {
		const nextCode = (e.target as HTMLSelectElement).value;
		manualCountryCode = nextCode;

		const country = countries.find((item) => item.code === nextCode);
		if (!country) return;
		updateValue(localNumber, country);
	}

	const displayNumber = $derived(formatNumber(localNumber, selectedCountry.format));
</script>

<div data-part="phone-input" data-disabled={disabled || undefined} {...rest}>
	<label data-part="country-trigger">
		<span data-part="flag">{selectedCountry.flag}</span>
		<span data-part="dial-code">{selectedCountry.dialCode}</span>
		<span data-part="country-chevron" aria-hidden="true">&#9662;</span>
		<select
			data-part="country-select"
			aria-label="Country code"
			value={selectedCountryCode}
			{disabled}
			onchange={handleCountryChange}
		>
			{#each countries as country (country.code)}
				<option value={country.code}>
					{country.name} ({country.dialCode})
				</option>
			{/each}
		</select>
	</label>

	<input
		type="tel"
		value={displayNumber}
		{placeholder}
		{disabled}
		oninput={handleInput}
		data-part="number-input"
		aria-label="Phone number"
	/>

	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
</div>
