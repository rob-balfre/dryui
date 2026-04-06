<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		target?: string | HTMLElement | undefined;
		disabled?: boolean | undefined;
		children: Snippet;
	}

	let { target, disabled = false, children }: Props = $props();

	let portalEl = $state<HTMLDivElement>();

	function applyPortalStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('display', disabled ? '' : 'contents');
		});
	}

	$effect(() => {
		if (disabled || !portalEl) return;

		let targetEl: HTMLElement | null;

		if (typeof target === 'string') {
			targetEl = document.querySelector<HTMLElement>(target);
		} else if (target instanceof HTMLElement) {
			targetEl = target;
		} else {
			targetEl = document.body;
		}

		if (!targetEl) return;

		targetEl.appendChild(portalEl);

		return () => {
			if (portalEl && portalEl.parentNode) {
				portalEl.parentNode.removeChild(portalEl);
			}
		};
	});
</script>

<div bind:this={portalEl} data-dry-portal use:applyPortalStyles>
	{@render children()}
</div>
