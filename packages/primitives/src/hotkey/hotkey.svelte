<script lang="ts">
	import { matchesEvent, parseKeys } from './hotkey.js';

	interface Props {
		keys: string;
		handler: () => void;
		enabled?: boolean;
		preventDefault?: boolean;
	}

	let { keys, handler, enabled = true, preventDefault = true }: Props = $props();

	const parsed = $derived.by(() => parseKeys(keys));

	function handleKeydown(event: KeyboardEvent) {
		if (!enabled) return;
		if (!matchesEvent(event, parsed)) return;

		if (preventDefault) {
			event.preventDefault();
		}

		handler();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if false}{/if}
