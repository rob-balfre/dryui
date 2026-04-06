<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
		dismissible?: boolean;
		onDismiss?: () => void;
	}

	let { children, dismissible = false, onDismiss, ...rest }: Props = $props();
</script>

<span {...rest}>
	{@render children()}
	{#if dismissible}
		<button type="button" aria-label="Dismiss" onclick={onDismiss}>
			<svg
				width="14"
				height="14"
				viewBox="0 0 14 14"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M11 3L3 11M3 3L11 11"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	{/if}
</span>
