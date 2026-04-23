<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setRadioGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		value = $bindable(''),
		name,
		disabled = false,
		required = false,
		orientation = 'vertical',
		class: className,
		children,
		onkeydown,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const fallbackName = `dryui-radio-${uid}`;
	const groupName = $derived(name ?? fallbackName);

	setRadioGroupCtx({
		get name() {
			return groupName;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get required() {
			return required;
		},
		select(v: string) {
			value = v;
		}
	});

	let el = $state<HTMLDivElement>();

	function getRadioInputs(): HTMLInputElement[] {
		if (!el) return [];
		return Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)'));
	}

	function focusAndSelect(inputs: HTMLInputElement[], index: number) {
		if (inputs.length === 0) return;
		const clamped = ((index % inputs.length) + inputs.length) % inputs.length;
		const input = inputs[clamped]!;
		input.focus();
		input.click();
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		const inputs = getRadioInputs();
		const currentIndex = inputs.indexOf(document.activeElement as HTMLInputElement);

		switch (e.key) {
			case 'ArrowDown':
			case 'ArrowRight': {
				e.preventDefault();
				focusAndSelect(inputs, currentIndex + 1);
				break;
			}
			case 'ArrowUp':
			case 'ArrowLeft': {
				e.preventDefault();
				focusAndSelect(inputs, currentIndex - 1);
				break;
			}
		}

		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	bind:this={el}
	role="radiogroup"
	aria-orientation={orientation}
	data-radio-group-root
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	class={className}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-radio-group-root] {
		display: grid;
		gap: var(--dry-space-4);

		&[data-orientation='horizontal'] {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
		}

		&[data-disabled] {
			color: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
		}
	}
</style>
