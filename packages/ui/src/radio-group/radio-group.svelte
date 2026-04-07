<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createId } from '@dryui/primitives';
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

	const fallbackName = createId('dryui-radio');
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

	[data-radio-group-item] {
		/* Label styling */
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: var(--dry-space-8);
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
		cursor: pointer;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		padding: var(--dry-space-1) 0;
		min-height: 48px;
		user-select: none;

		&[data-disabled] {
			color: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
		}

		/* Custom radio input */
		& input[type='radio'] {
			appearance: none;
			-webkit-appearance: none;
			height: var(--dry-space-8);
			min-height: var(--dry-space-8);
			border: 2px solid var(--dry-color-stroke-strong);
			border-radius: var(--dry-radius-full);
			background: var(--dry-color-bg-raised);
			margin: 0;
			cursor: pointer;
			position: relative;
			transition:
				border-color var(--dry-duration-fast) var(--dry-ease-default),
				background-color var(--dry-duration-fast) var(--dry-ease-default),
				transform var(--dry-duration-fast) var(--dry-ease-default);

			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%) scale(0);
				height: 8px;
				aspect-ratio: 1;
				border-radius: var(--dry-radius-full);
				background: var(--dry-color-on-brand);
				transition: transform var(--dry-duration-fast) var(--dry-ease-default);
			}

			&:hover:not(:disabled) {
				border-color: var(--dry-color-stroke-selected);
			}

			&:active:not(:disabled) {
				transform: scale(0.96);
			}

			&:focus-visible {
				outline: 2px solid var(--dry-color-stroke-focus);
				outline-offset: 2px;
			}

			&:checked {
				background: var(--dry-color-fill-selected);
				border-color: var(--dry-color-stroke-selected);
				box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);

				&::after {
					transform: translate(-50%, -50%) scale(1);
				}

				&:hover:not(:disabled) {
					background: var(--dry-color-fill-selected);
					border-color: var(--dry-color-stroke-selected);
				}
			}

			&:disabled {
				background: var(--dry-color-fill-disabled);
				border-color: var(--dry-color-stroke-disabled);
				opacity: 1;
				cursor: not-allowed;
			}
		}
	}
</style>
