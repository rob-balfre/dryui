<script lang="ts">
	import type { InspectorControl, InspectorNode } from '../studio-data';
	import { Badge, Card, Tabs } from '@dryui/ui';
	import CssVarEditor from './CssVarEditor.svelte';
	import PropControl from './PropControl.svelte';

	interface Props {
		inspector: InspectorNode | null;
		onControlChange: (control: InspectorControl, value: string | boolean) => void;
	}

	let { inspector, onControlChange }: Props = $props();
	let activeTab = $state<'props' | 'style' | 'theme' | 'children'>('props');

	function updateControl(control: InspectorControl, value: string | boolean) {
		onControlChange(control, value);
	}
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">Inspector</Badge>
					<h2>{inspector?.title ?? 'Nothing selected'}</h2>
				</div>
				<p>
					{inspector?.summary ??
						'Select a node on the canvas to edit its props, layout, and CSS variables.'}
				</p>
			</Card.Header>
		</div>

		<div class="panel-body">
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List>
					<Tabs.Trigger value="props">Props</Tabs.Trigger>
					<Tabs.Trigger value="style">Style</Tabs.Trigger>
					<Tabs.Trigger value="theme">Theme</Tabs.Trigger>
					<Tabs.Trigger value="children">Children</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="props">
					<div class="field-stack">
						{#if inspector && inspector.props.length > 0}
							{#each inspector.props as control (control.scope + ':' + control.key)}
								<PropControl {control} onChange={updateControl} />
							{/each}
						{:else}
							<p class="muted-copy">This node has no editable documented props.</p>
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="style">
					<div class="field-stack">
						{#if inspector}
							{#each inspector.styles as control (control.scope + ':' + control.key)}
								<PropControl {control} onChange={updateControl} />
							{/each}
						{:else}
							<p class="muted-copy">Select a node to adjust its layout styles.</p>
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="theme">
					<div class="field-stack">
						{#if inspector && inspector.cssVars.length > 0}
							{#each inspector.cssVars as control (control.scope + ':' + control.key)}
								<CssVarEditor {control} onChange={updateControl} />
							{/each}
						{:else}
							<p class="muted-copy">This node does not expose component-scoped CSS variables.</p>
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="children">
					<div class="field-stack">
						{#if inspector && inspector.children.length > 0}
							{#each inspector.children as child (child.id)}
								<div class="child-row">
									<span>{child.label ?? child.component}</span>
									<Badge variant="soft" color="gray" size="sm">{child.component}</Badge>
								</div>
							{/each}
						{:else}
							<p class="muted-copy">This node has no nested children.</p>
						{/if}
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2 {
		margin: 0;
	}

	.panel-header p,
	.muted-copy {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.field-stack {
		display: grid;
		gap: var(--dry-space-3);
		margin-top: var(--dry-space-4);
	}

	.child-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}
</style>
