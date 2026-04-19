<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { COUNTRY_DATA, type CountryInfo } from '@dryui/primitives';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		value?: string;
		defaultCountry?: string;
		disabled?: boolean;
		name?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		countries?: CountryInfo[];
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		defaultCountry = 'US',
		disabled = false,
		name: inputName,
		placeholder = 'Phone number',
		size = 'md',
		countries: countriesProp,
		onchange,
		class: className,
		...rest
	}: Props = $props();

	const countries = $derived(countriesProp ?? COUNTRY_DATA);
	let manualCountryCode = $derived(defaultCountry);

	const orderedCountries = $derived(
		[...countries].sort((left, right) => right.dialCode.length - left.dialCode.length)
	);
	const parsedValue = $derived.by(() => {
		if (!value) {
			return { countryCode: manualCountryCode, localNumber: '' };
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
		return { countryCode: manualCountryCode, localNumber: value.replace(/\D/g, '') };
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
		input.value = formatNumber(digits, selectedCountry.format);
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

<div
	class={className}
	data-phone-input
	data-size={size}
	data-disabled={disabled || undefined}
	{...rest}
>
	<label data-phone-trigger>
		<span data-phone-flag>{selectedCountry.flag}</span>
		<span data-phone-dial-code>{selectedCountry.dialCode}</span>
		<span data-phone-chevron aria-hidden="true">&#9662;</span>
		<select
			data-phone-select
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
		data-phone-number-input
		aria-label="Phone number"
	/>

	{#if inputName}
		<input type="hidden" name={inputName} {value} />
	{/if}
</div>

<style>
	[data-phone-input] {
		--dry-phone-input-bg: var(--dry-color-bg-raised);
		--dry-phone-input-border: var(--dry-color-stroke-strong);
		--dry-phone-input-color: var(--dry-color-text-strong);
		--dry-phone-input-radius: var(--dry-radius-md);

		container-type: inline-size;
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		border: 1px solid var(--dry-phone-input-border);
		border-radius: var(--dry-phone-input-radius);
		background: var(--dry-phone-input-bg);
		overflow: hidden;
		box-sizing: border-box;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-phone-input]:focus-within {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
		box-shadow: 0 0 0 1px var(--dry-color-focus-ring);
	}

	[data-phone-input]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-phone-input][data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-phone-trigger] {
		position: relative;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		min-height: 3rem;
		padding: 0 var(--dry-space-3);
		border-right: 1px solid var(--dry-phone-input-border);
		cursor: pointer;
		font-size: var(--dry-type-small-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-weak);
		background: var(--dry-color-fill);
		white-space: nowrap;
		box-sizing: border-box;
	}

	[data-phone-trigger]:focus-within,
	[data-phone-trigger]:hover {
		background: var(--dry-color-stroke-weak);
	}

	[data-phone-select] {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	[data-phone-chevron] {
		font-size: var(--dry-type-tiny-size);
	}

	[data-phone-flag] {
		font-size: 1.125rem;
		line-height: 1;
	}

	[data-phone-number-input] {
		appearance: none;
		border: none;
		margin: 0;
		padding: 0;
		background: none;
		font: inherit;
		color: inherit;
		min-height: 3rem;
		padding: 0 var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-phone-input-color);
		box-sizing: border-box;
	}

	[data-phone-number-input]::placeholder {
		color: var(--dry-color-text-weak);
	}

	/* Size variants */
	[data-phone-input][data-size='sm'] [data-phone-trigger] {
		min-height: 2.5rem;
		padding: 0 var(--dry-space-2);
		font-size: var(--dry-type-tiny-size);
	}

	[data-phone-input][data-size='sm'] [data-phone-number-input] {
		min-height: 2.5rem;
		padding: 0 var(--dry-space-2);
		font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-phone-input][data-size='md'] [data-phone-trigger] {
		min-height: 3rem;
		padding: 0 var(--dry-space-3);
		font-size: var(--dry-type-small-size);
	}

	[data-phone-input][data-size='md'] [data-phone-number-input] {
		min-height: 3rem;
		padding: 0 var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-phone-input][data-size='lg'] [data-phone-trigger] {
		min-height: 3.5rem;
		padding: 0 var(--dry-space-4);
		font-size: var(--dry-type-heading-4-size);
	}

	[data-phone-input][data-size='lg'] [data-phone-number-input] {
		min-height: 3.5rem;
		padding: 0 var(--dry-space-4);
		font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	/* Container query */
	@container (max-width: 200px) {
		[data-phone-trigger] {
			padding-inline: var(--dry-space-1);
		}

		[data-phone-number-input] {
			padding-inline: var(--dry-space-2);
		}
	}
</style>
