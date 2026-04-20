<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

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
	<Button
		variant="ghost"
		size="icon-sm"
		type="button"
		data-clipboard-button
		aria-label={copied ? 'Copied' : 'Copy'}
		data-state={copied ? 'copied' : 'idle'}
		onclick={copy}
	>
		<span data-clipboard-icon-stack>
			<svg
				data-dry-icon-reveal
				data-hidden={copied || undefined}
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
			</svg>
			<svg
				data-dry-icon-reveal
				data-hidden={!copied || undefined}
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		</span>
	</Button>
</div>

<style>
	[data-clipboard] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-clipboard-icon-stack] {
		display: grid;
		grid-template-columns: 1rem;
		grid-template-rows: 1rem;
		grid-template-areas: 'icon';
		place-items: center;
	}

	[data-clipboard-icon-stack] svg {
		grid-area: icon;
		aspect-ratio: 1;
		place-self: stretch;
	}
</style>
