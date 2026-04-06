<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CountryOption {
		code: string;
		name: string;
		dialCode: string;
		flag: string;
		region: string;
	}

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
		name: formName,
		onchange,
		class: className,
		...rest
	}: Props = $props();

	const allCountries: CountryOption[] = [
		{
			code: 'AF',
			name: 'Afghanistan',
			dialCode: '+93',
			flag: '\u{1F1E6}\u{1F1EB}',
			region: 'Asia'
		},
		{
			code: 'AR',
			name: 'Argentina',
			dialCode: '+54',
			flag: '\u{1F1E6}\u{1F1F7}',
			region: 'Americas'
		},
		{
			code: 'AU',
			name: 'Australia',
			dialCode: '+61',
			flag: '\u{1F1E6}\u{1F1FA}',
			region: 'Oceania'
		},
		{ code: 'AT', name: 'Austria', dialCode: '+43', flag: '\u{1F1E6}\u{1F1F9}', region: 'Europe' },
		{ code: 'BE', name: 'Belgium', dialCode: '+32', flag: '\u{1F1E7}\u{1F1EA}', region: 'Europe' },
		{ code: 'BR', name: 'Brazil', dialCode: '+55', flag: '\u{1F1E7}\u{1F1F7}', region: 'Americas' },
		{ code: 'CA', name: 'Canada', dialCode: '+1', flag: '\u{1F1E8}\u{1F1E6}', region: 'Americas' },
		{ code: 'CL', name: 'Chile', dialCode: '+56', flag: '\u{1F1E8}\u{1F1F1}', region: 'Americas' },
		{ code: 'CN', name: 'China', dialCode: '+86', flag: '\u{1F1E8}\u{1F1F3}', region: 'Asia' },
		{
			code: 'CO',
			name: 'Colombia',
			dialCode: '+57',
			flag: '\u{1F1E8}\u{1F1F4}',
			region: 'Americas'
		},
		{
			code: 'CZ',
			name: 'Czech Republic',
			dialCode: '+420',
			flag: '\u{1F1E8}\u{1F1FF}',
			region: 'Europe'
		},
		{ code: 'DK', name: 'Denmark', dialCode: '+45', flag: '\u{1F1E9}\u{1F1F0}', region: 'Europe' },
		{ code: 'EG', name: 'Egypt', dialCode: '+20', flag: '\u{1F1EA}\u{1F1EC}', region: 'Africa' },
		{ code: 'FI', name: 'Finland', dialCode: '+358', flag: '\u{1F1EB}\u{1F1EE}', region: 'Europe' },
		{ code: 'FR', name: 'France', dialCode: '+33', flag: '\u{1F1EB}\u{1F1F7}', region: 'Europe' },
		{ code: 'DE', name: 'Germany', dialCode: '+49', flag: '\u{1F1E9}\u{1F1EA}', region: 'Europe' },
		{ code: 'GR', name: 'Greece', dialCode: '+30', flag: '\u{1F1EC}\u{1F1F7}', region: 'Europe' },
		{ code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '\u{1F1ED}\u{1F1F0}', region: 'Asia' },
		{ code: 'IN', name: 'India', dialCode: '+91', flag: '\u{1F1EE}\u{1F1F3}', region: 'Asia' },
		{ code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '\u{1F1EE}\u{1F1E9}', region: 'Asia' },
		{ code: 'IE', name: 'Ireland', dialCode: '+353', flag: '\u{1F1EE}\u{1F1EA}', region: 'Europe' },
		{ code: 'IL', name: 'Israel', dialCode: '+972', flag: '\u{1F1EE}\u{1F1F1}', region: 'Asia' },
		{ code: 'IT', name: 'Italy', dialCode: '+39', flag: '\u{1F1EE}\u{1F1F9}', region: 'Europe' },
		{ code: 'JP', name: 'Japan', dialCode: '+81', flag: '\u{1F1EF}\u{1F1F5}', region: 'Asia' },
		{ code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\u{1F1F0}\u{1F1EA}', region: 'Africa' },
		{
			code: 'KR',
			name: 'South Korea',
			dialCode: '+82',
			flag: '\u{1F1F0}\u{1F1F7}',
			region: 'Asia'
		},
		{ code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '\u{1F1F2}\u{1F1FE}', region: 'Asia' },
		{ code: 'MX', name: 'Mexico', dialCode: '+52', flag: '\u{1F1F2}\u{1F1FD}', region: 'Americas' },
		{
			code: 'NL',
			name: 'Netherlands',
			dialCode: '+31',
			flag: '\u{1F1F3}\u{1F1F1}',
			region: 'Europe'
		},
		{
			code: 'NZ',
			name: 'New Zealand',
			dialCode: '+64',
			flag: '\u{1F1F3}\u{1F1FF}',
			region: 'Oceania'
		},
		{ code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '\u{1F1F3}\u{1F1EC}', region: 'Africa' },
		{ code: 'NO', name: 'Norway', dialCode: '+47', flag: '\u{1F1F3}\u{1F1F4}', region: 'Europe' },
		{ code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '\u{1F1F5}\u{1F1F0}', region: 'Asia' },
		{ code: 'PE', name: 'Peru', dialCode: '+51', flag: '\u{1F1F5}\u{1F1EA}', region: 'Americas' },
		{
			code: 'PH',
			name: 'Philippines',
			dialCode: '+63',
			flag: '\u{1F1F5}\u{1F1ED}',
			region: 'Asia'
		},
		{ code: 'PL', name: 'Poland', dialCode: '+48', flag: '\u{1F1F5}\u{1F1F1}', region: 'Europe' },
		{
			code: 'PT',
			name: 'Portugal',
			dialCode: '+351',
			flag: '\u{1F1F5}\u{1F1F9}',
			region: 'Europe'
		},
		{ code: 'RO', name: 'Romania', dialCode: '+40', flag: '\u{1F1F7}\u{1F1F4}', region: 'Europe' },
		{ code: 'RU', name: 'Russia', dialCode: '+7', flag: '\u{1F1F7}\u{1F1FA}', region: 'Europe' },
		{
			code: 'SA',
			name: 'Saudi Arabia',
			dialCode: '+966',
			flag: '\u{1F1F8}\u{1F1E6}',
			region: 'Asia'
		},
		{ code: 'SG', name: 'Singapore', dialCode: '+65', flag: '\u{1F1F8}\u{1F1EC}', region: 'Asia' },
		{
			code: 'ZA',
			name: 'South Africa',
			dialCode: '+27',
			flag: '\u{1F1FF}\u{1F1E6}',
			region: 'Africa'
		},
		{ code: 'ES', name: 'Spain', dialCode: '+34', flag: '\u{1F1EA}\u{1F1F8}', region: 'Europe' },
		{ code: 'SE', name: 'Sweden', dialCode: '+46', flag: '\u{1F1F8}\u{1F1EA}', region: 'Europe' },
		{
			code: 'CH',
			name: 'Switzerland',
			dialCode: '+41',
			flag: '\u{1F1E8}\u{1F1ED}',
			region: 'Europe'
		},
		{ code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '\u{1F1F9}\u{1F1FC}', region: 'Asia' },
		{ code: 'TH', name: 'Thailand', dialCode: '+66', flag: '\u{1F1F9}\u{1F1ED}', region: 'Asia' },
		{ code: 'TR', name: 'Turkey', dialCode: '+90', flag: '\u{1F1F9}\u{1F1F7}', region: 'Europe' },
		{
			code: 'AE',
			name: 'United Arab Emirates',
			dialCode: '+971',
			flag: '\u{1F1E6}\u{1F1EA}',
			region: 'Asia'
		},
		{
			code: 'GB',
			name: 'United Kingdom',
			dialCode: '+44',
			flag: '\u{1F1EC}\u{1F1E7}',
			region: 'Europe'
		},
		{
			code: 'US',
			name: 'United States',
			dialCode: '+1',
			flag: '\u{1F1FA}\u{1F1F8}',
			region: 'Americas'
		},
		{ code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '\u{1F1FB}\u{1F1F3}', region: 'Asia' }
	];

	const filteredCountries = $derived(
		regions ? allCountries.filter((c) => regions.includes(c.region)) : allCountries
	);

	let searchQuery = $state('');
	let open = $state(false);

	const searchResults = $derived(
		searchQuery
			? filteredCountries.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.dialCode.includes(searchQuery)
				)
			: filteredCountries
	);

	const selectedCountry = $derived(filteredCountries.find((c) => c.code === value));

	function selectCountry(code: string) {
		value = code;
		open = false;
		searchQuery = '';
		onchange?.(code);
	}
</script>

<span data-country-select-wrapper class={className}>
	<div data-part="country-select" {...rest}>
		<button
			type="button"
			data-part="trigger"
			{disabled}
			onclick={() => {
				if (!disabled) open = !open;
			}}
			aria-expanded={open}
			aria-haspopup="listbox"
		>
			{#if selectedCountry}
				<span data-part="flag">{selectedCountry.flag}</span>
				<span data-part="country-name">{selectedCountry.name}</span>
				{#if showDialCode}
					<span data-part="dial-code">{selectedCountry.dialCode}</span>
				{/if}
			{:else}
				<span data-part="placeholder">{placeholder}</span>
			{/if}
		</button>

		{#if open}
			<div data-part="dropdown" role="listbox" aria-label="Countries">
				<input
					type="text"
					data-part="search"
					placeholder="Search countries..."
					bind:value={searchQuery}
					aria-label="Search countries"
				/>
				{#each searchResults as country (country.code)}
					<button
						type="button"
						role="option"
						data-part="option"
						aria-selected={country.code === value}
						data-selected={country.code === value ? '' : undefined}
						onclick={() => selectCountry(country.code)}
					>
						<span data-part="flag">{country.flag}</span>
						<span data-part="country-name">{country.name}</span>
						{#if showDialCode}
							<span data-part="dial-code">{country.dialCode}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if formName}
			<input type="hidden" name={formName} {value} />
		{/if}
	</div>
</span>

<style>
	[data-country-select-wrapper] {
		position: relative;
		display: inline-grid;
		grid-template-columns: minmax(12rem, max-content);
	}

	[data-country-select-wrapper] [data-part='trigger'] {
		all: unset;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2, 0.5rem);
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-md, 0.375rem);
		background: var(--dry-color-bg-raised, #ffffff);
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		cursor: pointer;
		transition:
			border-color var(--dry-duration-fast, 100ms) ease,
			box-shadow var(--dry-duration-fast, 100ms) ease;
	}

	[data-country-select-wrapper] [data-part='trigger']:hover {
		border-color: var(--dry-color-stroke-strong, #cbd5e1);
	}

	[data-country-select-wrapper] [data-part='trigger']:focus-visible {
		border-color: var(--dry-color-stroke-focus);
		box-shadow: 0 0 0 2px var(--dry-color-stroke-focus);
	}

	[data-country-select-wrapper] [data-part='flag'] {
		line-height: 1;
	}

	[data-country-select-wrapper] [data-part='dial-code'] {
		color: var(--dry-color-text-weak, #64748b);
		margin-left: auto;
	}

	[data-country-select-wrapper] [data-part='placeholder'] {
		color: var(--dry-color-text-weak, #94a3b8);
	}

	[data-country-select-wrapper] [data-part='dropdown'] {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 50;
		margin-top: var(--dry-space-1, 0.25rem);
		background: var(--dry-color-bg-raised, #ffffff);
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-md, 0.375rem);
		box-shadow: var(--dry-shadow-lg);
		max-height: 16rem;
		overflow-y: auto;
	}

	[data-country-select-wrapper] [data-part='search'] {
		all: unset;
		display: grid;
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		border-bottom: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		box-sizing: border-box;
	}

	[data-country-select-wrapper] [data-part='option'] {
		all: unset;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2, 0.5rem);
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		cursor: pointer;
		box-sizing: border-box;
		transition: background var(--dry-duration-fast, 100ms) ease;
	}

	[data-country-select-wrapper] [data-part='option']:hover {
		background: var(--dry-color-fill);
	}

	[data-country-select-wrapper] [data-part='option'][data-selected] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
		font-weight: 500;
	}
</style>
