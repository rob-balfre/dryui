<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CountrySelect as PrimitiveCountrySelect } from '@dryui/primitives';

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
</script>

<span data-country-select-wrapper class={className}>
	<PrimitiveCountrySelect
		bind:value
		{regions}
		{showDialCode}
		{disabled}
		{placeholder}
		name={formName}
		{onchange}
		{...rest}
	/>
</span>

<style>
	[data-country-select-wrapper] {
		display: contents;
	}

	[data-country-select-wrapper] [data-part='country-select'] {
		display: inline-grid;
		grid-template-columns: minmax(14rem, max-content);
	}

	[data-country-select-wrapper] [data-part='control'] {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--dry-space-2, 0.5rem);
		min-height: 2.75rem;
		padding-inline: var(--dry-space-3, 0.75rem);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
		box-shadow: var(--dry-shadow-xs);
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background-color 140ms ease;
	}

	[data-country-select-wrapper] [data-part='control'][data-state='open'] {
		border-color: color-mix(
			in srgb,
			var(--dry-color-brand-primary) 52%,
			var(--dry-color-stroke-weak)
		);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--dry-color-brand-primary) 18%, transparent);
	}

	[data-country-select-wrapper] [data-part='control'][data-disabled] {
		opacity: 0.6;
	}

	[data-country-select-wrapper] [data-part='flag'] {
		font-size: 1rem;
		line-height: 1;
	}

	[data-country-select-wrapper] [data-part='input'] {
		border: none;
		outline: none;
		padding: 0;
		background: transparent;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-body-size, var(--dry-text-md-size));
		line-height: var(--dry-type-body-leading, var(--dry-text-md-leading));
	}

	[data-country-select-wrapper] [data-part='input']::placeholder {
		color: var(--dry-color-text-weak);
	}

	[data-country-select-wrapper] [data-part='dial-code'] {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-country-select-wrapper] [data-part='dropdown'] {
		display: grid;
		grid-template-columns: minmax(max(14rem, anchor-size(inline)), max-content);
		gap: var(--dry-space-1, 0.25rem);
		max-height: 18rem;
		padding: var(--dry-space-1, 0.25rem);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: calc(var(--dry-radius-md) + 0.125rem);
		background: var(--dry-color-bg-raised);
		box-shadow: var(--dry-shadow-lg);
		inset: unset;
		margin: 0;
	}

	[data-country-select-wrapper] [data-part='option'] {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--dry-space-2, 0.5rem);
		justify-self: stretch;
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		border: none;
		border-radius: calc(var(--dry-radius-sm) + 0.0625rem);
		background: transparent;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		text-align: left;
		cursor: pointer;
	}

	[data-country-select-wrapper] [data-part='option']::before {
		content: attr(data-flag);
		font-size: 1rem;
		line-height: 1;
	}

	[data-country-select-wrapper] [data-part='option'][data-dial-code]::after {
		content: attr(data-dial-code);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-country-select-wrapper] [data-part='option'][data-highlighted],
	[data-country-select-wrapper] [data-part='option']:hover {
		background: color-mix(in srgb, var(--dry-color-brand-primary) 12%, var(--dry-color-bg-raised));
	}

	[data-country-select-wrapper] [data-part='option'][data-state='selected'] {
		background: color-mix(in srgb, var(--dry-color-brand-primary) 18%, var(--dry-color-bg-raised));
		color: var(--dry-color-text-strong);
	}

	[data-country-select-wrapper] [data-part='country-name'] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-country-select-wrapper] [data-part='empty'] {
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}
</style>
