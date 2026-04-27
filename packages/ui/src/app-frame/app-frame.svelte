<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, actions, children, class: className, ...rest }: Props = $props();
</script>

<div data-app-frame class={className} {...rest}>
	<div data-part="chrome" aria-hidden="true">
		<div data-part="dots">
			<span data-part="dot" data-tone="close"></span>
			<span data-part="dot" data-tone="min"></span>
			<span data-part="dot" data-tone="max"></span>
		</div>
		<span data-part="title">{title ?? ''}</span>
		{#if actions}
			<div data-part="actions">
				{@render actions()}
			</div>
		{/if}
	</div>
	<div data-part="content">
		{@render children()}
	</div>
</div>

<style>
	[data-app-frame] {
		block-size: var(--dry-app-frame-block-size, auto);
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-block-size: var(--dry-app-frame-min-block-size, 0);
		border: 1px solid var(--dry-app-frame-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-app-frame-radius, var(--dry-radius-xl));
		background: var(--dry-app-frame-bg, var(--dry-color-bg-base));
		overflow: var(--dry-app-frame-overflow, clip);
		transition:
			background-color var(--dry-app-frame-transition, 0s) ease,
			border-color var(--dry-app-frame-transition, 0s) ease;
	}

	[data-part='chrome'] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto;
		align-items: center;
		padding: var(--dry-app-frame-chrome-padding, var(--dry-space-3) var(--dry-space-4));
		border-block-end: 1px solid var(--dry-app-frame-border, var(--dry-color-stroke-weak));
		background: var(--dry-app-frame-chrome-bg, var(--dry-color-bg-raised));
		transition:
			background-color var(--dry-app-frame-transition, 0s) ease,
			border-color var(--dry-app-frame-transition, 0s) ease;
	}

	[data-part='chrome'] > * {
		grid-row: 1;
		grid-column: 1;
	}

	[data-part='dots'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		gap: var(--dry-space-1_5);
		align-items: center;
		justify-self: start;
	}

	[data-part='dot'] {
		display: block;
		block-size: var(--dry-app-frame-dot-size, 0.75rem);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-stroke-weak);
		transition: background-color var(--dry-app-frame-transition, 0s) ease;
	}

	[data-part='dot'][data-tone='close'] {
		background: var(--dry-app-frame-dot-close, #ff5f56);
	}

	[data-part='dot'][data-tone='min'] {
		background: var(--dry-app-frame-dot-min, #ffbd2e);
	}

	[data-part='dot'][data-tone='max'] {
		background: var(--dry-app-frame-dot-max, #27c93f);
	}

	[data-part='title'] {
		display: block;
		justify-self: center;
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, 0.875rem);
		font-weight: 500;
		line-height: var(
			--dry-app-frame-title-line-height,
			calc(var(--dry-type-small-size, 0.875rem) * 1.2)
		);
		min-block-size: var(
			--dry-app-frame-title-line-height,
			calc(var(--dry-type-small-size, 0.875rem) * 1.2)
		);
		letter-spacing: 0.01em;
		text-align: center;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		pointer-events: none;
	}

	[data-part='actions'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: end;
	}

	[data-part='content'] {
		display: grid;
		padding: var(--dry-app-frame-content-padding, 0);
		min-block-size: 0;
		overflow: var(--dry-app-frame-content-overflow, visible);
	}

	@media (prefers-reduced-motion: reduce) {
		[data-app-frame],
		[data-part='chrome'],
		[data-part='dot'] {
			transition: none;
		}
	}
</style>
