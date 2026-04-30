<script lang="ts">
	import type { LayoutTool } from './layout-inspector.svelte';

	interface Props {
		kind?: LayoutTool;
	}

	let { kind = 'box' }: Props = $props();
</script>

<div class="layout-box-preview" data-layout-kind={kind} aria-hidden="true">
	{#if kind === 'box'}
		<span data-slot="box"></span>
	{:else if kind === 'centered'}
		{#each { length: 9 } as _, i (i)}
			<span data-slot={i === 4 ? 'center' : 'space'}></span>
		{/each}
	{:else if kind === 'stack'}
		<span data-slot="stack"></span>
		<span data-slot="stack"></span>
		<span data-slot="stack"></span>
	{:else if kind === 'sidebar'}
		<span data-slot="aside"></span>
		<span data-slot="main"></span>
	{:else if kind === 'holy-grail'}
		<span data-slot="masthead"></span>
		<span data-slot="nav"></span>
		<span data-slot="main"></span>
		<span data-slot="aside"></span>
		<span data-slot="foot"></span>
	{:else if kind === '12-span'}
		{#each { length: 12 } as _, i (i)}
			<span data-slot="span"></span>
		{/each}
	{:else}
		{#each { length: 6 } as _, i (i)}
			<span data-slot="card"></span>
		{/each}
	{/if}
</div>

<style>
	.layout-box-preview {
		position: absolute;
		inset: 16px;
		z-index: 0;
		display: grid;
		gap: 5px;
		color: inherit;
		opacity: 0.7;
		pointer-events: none;
	}

	.layout-box-preview span {
		border: 1px solid currentColor;
		border-radius: 3px;
		background: currentColor;
		opacity: 0.24;
		box-shadow: inset 0 0 0 1px hsl(225 15% 8% / 0.35);
	}

	.layout-box-preview[data-layout-kind='box'] {
		padding: 8%;
	}

	.layout-box-preview[data-layout-kind='box'] span {
		opacity: 0.18;
	}

	.layout-box-preview[data-layout-kind='centered'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-template-rows: repeat(3, minmax(0, 1fr));
	}

	.layout-box-preview[data-layout-kind='centered'] [data-slot='space'] {
		opacity: 0.08;
	}

	.layout-box-preview[data-layout-kind='centered'] [data-slot='center'] {
		opacity: 0.34;
	}

	.layout-box-preview[data-layout-kind='stack'] {
		grid-template-rows: repeat(3, minmax(0, 1fr));
	}

	.layout-box-preview[data-layout-kind='sidebar'] {
		grid-template-columns: minmax(0, 0.35fr) minmax(0, 1fr);
	}

	.layout-box-preview[data-layout-kind='sidebar'] [data-slot='aside'] {
		opacity: 0.34;
	}

	.layout-box-preview[data-layout-kind='holy-grail'] {
		grid-template-columns: minmax(0, 0.5fr) minmax(0, 1fr) minmax(0, 0.55fr);
		grid-template-rows: minmax(0, 0.42fr) minmax(0, 1fr) minmax(0, 0.42fr);
	}

	.layout-box-preview[data-layout-kind='holy-grail'] [data-slot='masthead'] {
		grid-column: 1 / -1;
	}

	.layout-box-preview[data-layout-kind='holy-grail'] [data-slot='foot'] {
		grid-column: 1 / -1;
	}

	.layout-box-preview[data-layout-kind='holy-grail'] [data-slot='main'] {
		opacity: 0.34;
	}

	.layout-box-preview[data-layout-kind='12-span'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
	}

	.layout-box-preview[data-layout-kind='12-span'] span {
		border-radius: 2px;
		opacity: 0.18;
	}

	.layout-box-preview[data-layout-kind='card-grid'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
	}
</style>
