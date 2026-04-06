<script lang="ts">
	type PaletteItem = 'Accordion' | 'Card' | 'Slider';

	const paletteItems: PaletteItem[] = ['Accordion', 'Card', 'Slider'];

	let search = $state('');
	let selectedComponent = $state<PaletteItem | null>(null);
	let prompt = $state('');
	let transcript = $state<string[]>([]);
	let previewMessage = $state<string | null>(null);
	let previewComponent = $state<PaletteItem | null>(null);
	let trackingEnabled = $state(false);
	let selectedTheme = $state<'light' | 'dark'>('light');

	let filteredItems = $derived(
		paletteItems.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
	);

	function setTheme(theme: 'light' | 'dark') {
		selectedTheme = theme;
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('dryui-studio-theme', theme);
	}

	function startPreview(command: string) {
		prompt = command;
		transcript = [...transcript, command];

		previewComponent = command.toLowerCase().includes('card') ? 'Card' : 'Button';
		previewMessage = `Prepared a preview that inserts ${previewComponent}`;
	}

	function applyPreview() {
		if (!previewComponent) return;
		selectedComponent = previewComponent;
		previewMessage = `Applied preview: Insert ${previewComponent} into the live canvas.`;
	}

	function toggleTracking() {
		trackingEnabled = !trackingEnabled;
		if (trackingEnabled) {
			transcript = [...transcript, 'Live tracking enabled'];
		}
	}

	function selectPaletteItem(item: PaletteItem) {
		selectedComponent = item;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const item = event.dataTransfer?.getData('text/plain') as PaletteItem | undefined;
		if (item) {
			selectedComponent = item;
		}
	}
</script>

<section>
	<label>
		Search components
		<input aria-label="Search components" bind:value={search} placeholder="Search components" />
	</label>

	<div role="list" aria-label="Component palette">
		{#each filteredItems as item (item)}
			<button
				type="button"
				draggable="true"
				ondragstart={(event) => event.dataTransfer?.setData('text/plain', item)}
				onclick={() => selectPaletteItem(item)}
			>
				{item}
			</button>
		{/each}
	</div>

	<div
		role="region"
		data-studio-canvas-viewport
		ondragover={(event) => event.preventDefault()}
		ondrop={handleDrop}
	>
		<p>{selectedComponent ? `Selected: ${selectedComponent}` : 'Selected: none'}</p>
	</div>

	<button type="button" onclick={() => setTheme('dark')}>Dark</button>
	<button type="button" onclick={() => setTheme('light')}>Light</button>

	<label>
		Prompt
		<textarea aria-label="Prompt" bind:value={prompt} placeholder="Prompt"></textarea>
	</label>

	<button type="button" onclick={() => startPreview(prompt || 'Add button')}>Send</button>

	{#if previewMessage}
		<p>{previewMessage}</p>
		<p>{`Insert ${previewComponent} into the live canvas`}</p>
		<button type="button" onclick={applyPreview}>Apply preview</button>
	{/if}

	<button type="button" role="switch" aria-checked={trackingEnabled} onclick={toggleTracking}>
		Webcam
	</button>

	<button type="button" onclick={() => transcript.push('Sample lighting')}
		>Advance calibration</button
	>

	<output data-testid="transcript">{transcript.join('\n')}</output>
</section>
