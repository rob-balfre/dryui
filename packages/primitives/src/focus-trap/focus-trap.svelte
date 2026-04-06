<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createFocusTrap } from '../utils/focus-trap.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		active?: boolean | undefined;
		initialFocus?: string | undefined;
		returnFocus?: boolean | undefined;
		children?: Snippet | undefined;
	}

	let { active = true, initialFocus, returnFocus = true, children, ...rest }: Props = $props();

	let containerEl = $state<HTMLDivElement>();

	const trap = createFocusTrap(() => containerEl ?? null);

	$effect(() => {
		if (active && containerEl) {
			// activate() saves document.activeElement and focuses first focusable
			trap.activate();

			// If initialFocus is provided, override the default first-focusable behavior
			if (initialFocus) {
				const target = containerEl.querySelector<HTMLElement>(initialFocus);
				if (target) {
					target.focus();
				}
			}

			return () => {
				if (returnFocus) {
					// deactivate() restores focus to the element saved during activate()
					trap.deactivate();
				} else {
					// Still remove the keydown listener, but don't restore focus.
					// We call deactivate and then refocus the container to prevent
					// focus jumping. The focus will stay where it naturally goes.
					const current = document.activeElement;
					trap.deactivate();
					// Undo the utility's focus restore if it changed focus
					if (document.activeElement !== current && current instanceof HTMLElement) {
						current.focus();
					}
				}
			};
		}
	});
</script>

<div bind:this={containerEl} {...rest}>
	{#if children}{@render children()}{/if}
</div>
