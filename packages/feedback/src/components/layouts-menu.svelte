<script lang="ts">
	import {
		AppWindow,
		Square,
		Columns2,
		ScrollText,
		Minus,
		MoveHorizontal,
		RectangleHorizontal,
		X
	} from 'lucide-svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	type LayoutOption = {
		name: string;
		description: string;
		icon: typeof AppWindow;
		selector?: string;
	};

	const LAYOUTS: LayoutOption[] = [
		{
			name: 'AppFrame',
			description: 'Windowed app chrome with traffic-light dots, title, and actions.',
			icon: AppWindow,
			selector: '[data-app-frame]'
		},
		{
			name: 'Container',
			description: 'Centered content wrapper with a max-width and padding.',
			icon: Square
		},
		{
			name: 'Splitter',
			description: 'Resizable split panels with a draggable handle.',
			icon: Columns2
		},
		{
			name: 'ScrollArea',
			description: 'Scrollable viewport with styled scrollbars.',
			icon: ScrollText,
			selector: '[data-scroll-area]'
		},
		{
			name: 'Separator',
			description: 'Visual divider between sections of content.',
			icon: Minus
		},
		{
			name: 'Spacer',
			description: 'Flexible empty space along an axis.',
			icon: MoveHorizontal
		},
		{
			name: 'AspectRatio',
			description: 'Constrains content to a specific aspect ratio.',
			icon: RectangleHorizontal
		}
	];

	const presence = $derived.by(() => {
		const map = new Map<string, number>();
		if (!open || typeof document === 'undefined') return map;
		for (const layout of LAYOUTS) {
			if (!layout.selector) continue;
			const count = document.querySelectorAll(layout.selector).length;
			if (count > 0) map.set(layout.name, count);
		}
		return map;
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onclose();
		}
	}
</script>

{#if open}
	<div
		class="layouts-menu"
		role="dialog"
		aria-label="Layout options"
		onkeydown={handleKeydown}
		tabindex="-1"
	>
		<div class="layouts-header">
			<span class="layouts-title">Layouts on this page</span>
			<button
				class="layouts-close"
				onclick={onclose}
				aria-label="Close layout options"
				type="button"
			>
				<X size={14} />
			</button>
		</div>
		<ul class="layouts-list" role="list">
			{#each LAYOUTS as layout (layout.name)}
				{@const count = presence.get(layout.name)}
				<li class="layouts-item" data-found={count ? '' : undefined}>
					<span class="layouts-icon" aria-hidden="true">
						<layout.icon size={16} />
					</span>
					<span class="layouts-body">
						<span class="layouts-name">
							{layout.name}
							{#if count}
								<span class="layouts-pill" aria-label={`${count} on this page`}>
									×{count}
								</span>
							{/if}
						</span>
						<span class="layouts-desc">{layout.description}</span>
					</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.layouts-menu {
		position: absolute;
		right: 0;
		bottom: calc(100% + 8px);
		min-inline-size: 280px;
		max-inline-size: 320px;
		padding: 8px;
		border-radius: 12px;
		background: hsl(225 15% 15% / 0.95);
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		color: hsl(220 10% 90%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		cursor: default;
	}

	.layouts-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 4px 6px 8px;
		border-block-end: 1px solid hsl(225 15% 22%);
		margin-block-end: 4px;
	}

	.layouts-title {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: hsl(220 10% 70%);
		font-weight: 600;
	}

	.layouts-close {
		display: grid;
		place-items: center;
		padding: 4px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: hsl(220 10% 70%);
		cursor: pointer;
	}

	.layouts-close:hover {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 90%);
	}

	.layouts-list {
		display: grid;
		gap: 2px;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.layouts-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 6px;
		align-items: start;
	}

	.layouts-item[data-found] .layouts-icon {
		background: hsl(25 100% 55% / 0.18);
		color: hsl(25 100% 65%);
	}

	.layouts-icon {
		display: grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
		border-radius: 4px;
		background: hsl(225 15% 22%);
		color: hsl(220 10% 70%);
	}

	.layouts-body {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
	}

	.layouts-name {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: hsl(220 10% 95%);
	}

	.layouts-pill {
		font-size: 10px;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: 999px;
		background: hsl(25 100% 55%);
		color: black;
		font-family: ui-monospace, SFMono-Regular, monospace;
	}

	.layouts-desc {
		font-size: 11px;
		line-height: 1.4;
		color: hsl(220 10% 70%);
	}
</style>
