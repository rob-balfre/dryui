<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		children: Snippet;
	}

	let { class: className, label, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={label} data-combobox-group class={className} {...rest}>
	<div role="presentation" data-part="group-label">
		{label}
	</div>
	{@render children()}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-combobox-group] [data-part='group-label'] {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size);
		font-weight: 600;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	[data-combobox-group] + [data-combobox-group] {
		border-top: 1px solid var(--dry-color-stroke-weak);
		margin-top: var(--dry-space-1);
		padding-top: var(--dry-space-1);
	}
</style>
