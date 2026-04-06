<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CountryInfo {
		code: string;
		name: string;
		dialCode: string;
		flag: string;
		format?: string;
	}

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

	const defaultCountries: CountryInfo[] = [
		{
			code: 'US',
			name: 'United States',
			dialCode: '+1',
			flag: '\u{1F1FA}\u{1F1F8}',
			format: '### ### ####'
		},
		{
			code: 'GB',
			name: 'United Kingdom',
			dialCode: '+44',
			flag: '\u{1F1EC}\u{1F1E7}',
			format: '#### ######'
		},
		{
			code: 'CA',
			name: 'Canada',
			dialCode: '+1',
			flag: '\u{1F1E8}\u{1F1E6}',
			format: '### ### ####'
		},
		{
			code: 'AU',
			name: 'Australia',
			dialCode: '+61',
			flag: '\u{1F1E6}\u{1F1FA}',
			format: '### ### ###'
		},
		{
			code: 'DE',
			name: 'Germany',
			dialCode: '+49',
			flag: '\u{1F1E9}\u{1F1EA}',
			format: '### #######'
		},
		{
			code: 'FR',
			name: 'France',
			dialCode: '+33',
			flag: '\u{1F1EB}\u{1F1F7}',
			format: '# ## ## ## ##'
		},
		{
			code: 'IT',
			name: 'Italy',
			dialCode: '+39',
			flag: '\u{1F1EE}\u{1F1F9}',
			format: '### ### ####'
		},
		{
			code: 'ES',
			name: 'Spain',
			dialCode: '+34',
			flag: '\u{1F1EA}\u{1F1F8}',
			format: '### ## ## ##'
		},
		{
			code: 'BR',
			name: 'Brazil',
			dialCode: '+55',
			flag: '\u{1F1E7}\u{1F1F7}',
			format: '## ##### ####'
		},
		{
			code: 'IN',
			name: 'India',
			dialCode: '+91',
			flag: '\u{1F1EE}\u{1F1F3}',
			format: '##### #####'
		},
		{
			code: 'CN',
			name: 'China',
			dialCode: '+86',
			flag: '\u{1F1E8}\u{1F1F3}',
			format: '### #### ####'
		},
		{
			code: 'JP',
			name: 'Japan',
			dialCode: '+81',
			flag: '\u{1F1EF}\u{1F1F5}',
			format: '## #### ####'
		},
		{
			code: 'KR',
			name: 'South Korea',
			dialCode: '+82',
			flag: '\u{1F1F0}\u{1F1F7}',
			format: '## #### ####'
		},
		{
			code: 'MX',
			name: 'Mexico',
			dialCode: '+52',
			flag: '\u{1F1F2}\u{1F1FD}',
			format: '## #### ####'
		},
		{
			code: 'RU',
			name: 'Russia',
			dialCode: '+7',
			flag: '\u{1F1F7}\u{1F1FA}',
			format: '### ### ## ##'
		},
		{
			code: 'SA',
			name: 'Saudi Arabia',
			dialCode: '+966',
			flag: '\u{1F1F8}\u{1F1E6}',
			format: '## ### ####'
		},
		{
			code: 'AE',
			name: 'United Arab Emirates',
			dialCode: '+971',
			flag: '\u{1F1E6}\u{1F1EA}',
			format: '## ### ####'
		},
		{
			code: 'SG',
			name: 'Singapore',
			dialCode: '+65',
			flag: '\u{1F1F8}\u{1F1EC}',
			format: '#### ####'
		},
		{
			code: 'NL',
			name: 'Netherlands',
			dialCode: '+31',
			flag: '\u{1F1F3}\u{1F1F1}',
			format: '# ########'
		},
		{
			code: 'SE',
			name: 'Sweden',
			dialCode: '+46',
			flag: '\u{1F1F8}\u{1F1EA}',
			format: '## ### ## ##'
		}
	];

	const countries = $derived(countriesProp ?? defaultCountries);
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
