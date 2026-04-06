<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		value: string;
		timeout?: number;
		children: Snippet<[{ copied: boolean; copy: () => void }]>;
	}

	let { value, timeout = 2000, class: className, children, ...rest }: Props = $props();

	let copied = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	function copy() {
		navigator.clipboard.writeText(value).then(() => {
			copied = true;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				copied = false;
			}, timeout);
		});
	}
</script>

<div data-clipboard data-copied={copied || undefined} class={className} {...rest}>
	{@render children({ copied, copy })}
</div>

<style>
	[data-clipboard] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
