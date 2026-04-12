<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, setContext } from 'svelte';
	import NavGroupButton from './button/nav-group-button.svelte';

	interface Props {
		label: string;
		count?: number | undefined;
		open?: boolean;
		icon?: Snippet | undefined;
		children: Snippet;
	}

	let { label, count, open = $bindable(false), icon, children }: Props = $props();

	const depth = getContext<number>('navgroup-depth') ?? 0;
	setContext('navgroup-depth', depth + 1);
</script>

<div class="group">
	<NavGroupButton
		{label}
		{count}
		{open}
		{icon}
		onclick={() => {
			open = !open;
		}}
	/>
	<div class="content" class:open>
		<div class="inner" data-depth={depth}>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.group {
		display: grid;
	}

	.content {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dry-duration-fast) var(--dry-ease-default);
	}

	.content.open {
		grid-template-rows: 1fr;
	}

	.inner {
		overflow: hidden;
		display: grid;
		gap: var(--dry-sidebar-group-gap, var(--dry-space-1));
	}

	.inner[data-depth='0'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 16px + var(--dry-space-2));
	}

	.inner[data-depth='1'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 32px + 2 * var(--dry-space-2));
	}

	.inner[data-depth='2'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 48px + 3 * var(--dry-space-2));
	}

	@media (prefers-reduced-motion: reduce) {
		.content {
			transition: none;
		}
	}
</style>
