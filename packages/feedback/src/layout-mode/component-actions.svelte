<script lang="ts">
	import { Button } from '@dryui/ui/button';
	import { Separator } from '@dryui/ui/separator';
	import { Text } from '@dryui/ui/text';

	interface Props {
		component: { name: string; selector: string; props: Record<string, string> };
		position: { x: number; y: number };
		onSwap: () => void;
		onRefine: (comment: string) => void;
		onDelete: () => void;
		onClose: () => void;
	}

	let { component, position, onSwap, onRefine, onDelete, onClose }: Props = $props();

	const propsLabel = $derived(
		Object.entries(component.props)
			.map(([k, v]) => `${k}=${v}`)
			.join(', ')
	);

	function applyPosition(node: HTMLElement, pos: { x: number; y: number }) {
		node.style.setProperty('left', `${pos.x}px`);
		node.style.setProperty('top', `${pos.y}px`);
		return {
			update(newPos: { x: number; y: number }) {
				node.style.setProperty('left', `${newPos.x}px`);
				node.style.setProperty('top', `${newPos.y}px`);
			}
		};
	}

	function trapClicks(node: HTMLElement) {
		function stop(e: Event) {
			e.stopPropagation();
		}
		node.addEventListener('click', stop);
		node.addEventListener('mousedown', stop);
		return {
			destroy() {
				node.removeEventListener('click', stop);
				node.removeEventListener('mousedown', stop);
			}
		};
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="component-actions" data-dryui-feedback use:trapClicks use:applyPosition={position}>
	<div class="vstack-2">
		<div class="vstack-1">
			<Text weight="semibold" size="sm">{component.name}</Text>
			{#if propsLabel}
				<Text size="xs" color="weak">{propsLabel}</Text>
			{/if}
		</div>

		<Separator />

		<div class="vstack-1">
			<Button variant="ghost" size="sm" onclick={onSwap} data-actions-btn>Swap component...</Button>
			<Button variant="ghost" size="sm" onclick={() => onRefine('')} data-actions-btn>
				Refine with note
			</Button>
			<Button variant="ghost" size="sm" color="error" onclick={onDelete} data-actions-btn>
				Delete
			</Button>
		</div>
	</div>
</div>

<style>
	.component-actions {
		position: fixed;
		z-index: 10003;
		display: grid;
		grid-template-columns: minmax(200px, max-content);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-3);
	}

	.vstack-2 {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.vstack-1 {
		display: grid;
		gap: var(--dry-space-1, 0.25rem);
	}

	.component-actions [data-actions-btn] {
		justify-content: flex-start;
	}
</style>
