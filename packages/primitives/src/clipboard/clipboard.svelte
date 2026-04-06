<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		value: string;
		timeout?: number;
		children: Snippet<[{ copied: boolean; copy: () => void }]>;
	}

	let { value, timeout = 2000, children, ...rest }: Props = $props();

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

<div data-copied={copied || undefined} {...rest}>
	{@render children({ copied, copy })}
</div>
