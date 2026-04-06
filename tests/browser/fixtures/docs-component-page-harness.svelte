<script lang="ts">
	type Tab = 'overview' | 'styling-hooks';

	interface ComponentPageData {
		name: string;
		kind: 'primitive' | 'component' | 'namespace';
		sourceUrl: string;
		quickStartCode: string;
		related?: unknown;
	}

	let { data }: { data: ComponentPageData } = $props();
	let activeTab = $state<Tab>('overview');

	const title = $derived(data.name);
	const showConfigurator = $derived(
		data.name !== 'MultiCitySearchForm' && data.kind !== 'namespace'
	);
</script>

<section data-testid="docs-component-page">
	<h1>{title}</h1>

	{#if showConfigurator}
		<h2>{title} Configurator</h2>
		<section>
			<h3>Variants</h3>
			<p>Description</p>
			<p>Accessibility</p>
			<p>Related Components</p>
			<button type="button">Show code</button>
			<a href={data.sourceUrl}>Source</a>
		</section>
	{/if}

	{#if data.name === 'DateRangePicker'}
		<section>
			<p>@dryui/ui</p>
			<p>With Presets</p>
		</section>
	{/if}

	{#if data.name === 'Typography'}
		<section>
			<p>Namespace parts are used directly</p>
			<p>Typography.Heading</p>
		</section>
	{/if}

	{#if data.name === 'Reveal'}
		<section>
			<p>Slide Up</p>
		</section>
	{/if}

	{#if data.name === 'MultiCitySearchForm'}
		<p>No interactive examples are published for this component yet.</p>
	{/if}

	{#if data.name === 'Dialog'}
		<div role="tablist" aria-label="Dialog sections">
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'overview'}
				onclick={() => (activeTab = 'overview')}
			>
				Overview
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'styling-hooks'}
				onclick={() => (activeTab = 'styling-hooks')}
			>
				Styling Hooks
			</button>
		</div>

		{#if activeTab === 'styling-hooks'}
			<section>
				<h3>Data Attributes</h3>
				<p>open</p>
				<p>closed</p>
			</section>
		{/if}
	{/if}
</section>
