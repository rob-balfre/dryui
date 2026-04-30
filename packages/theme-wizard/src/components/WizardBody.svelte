<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Text } from '@dryui/ui/text';

	interface Props extends HTMLAttributes<HTMLElement> {
		title: string;
		subtitle?: string;
		children: Snippet;
	}

	let { title, subtitle, children, ...rest }: Props = $props();
</script>

<main data-wizard-body {...rest}>
	<h1 data-wizard-step-heading>{title}</h1>
	{#if subtitle}
		<Text as="p" color="muted">{subtitle}</Text>
	{/if}
	{@render children()}
</main>

<style>
	[data-wizard-body] {
		display: grid;
		gap: var(--dry-space-10);
		align-content: start;
		padding-block: var(--dry-space-10);
		padding-inline: var(--dry-space-6);
		overflow-y: auto;
		color: var(--dry-color-text-strong);
		background-color: var(--dry-color-bg-base);
		transition: background-color var(--dry-duration-slow, 0.4s) var(--dry-ease-out, ease);
	}

	[data-wizard-step-heading] {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: var(--dry-font-weight-bold, 700);
		line-height: var(--dry-type-heading-1-leading, 1.2);
		letter-spacing: 0.02em;
	}
</style>
