<script lang="ts">
	import {
		DesignPalette,
		type CanvasPurpose,
		type LayoutModeComponentType
	} from '../../../packages/feedback/src/layout-mode';

	let open = $state(true);
	let value = $state<LayoutModeComponentType | null>(null);
	let purpose = $state<CanvasPurpose>('replace-current');
	let cleared = $state(0);
	let detected = $state(0);

	function handleClear() {
		cleared += 1;
	}

	function handleDetectSections() {
		detected += 1;
	}
</script>

<DesignPalette
	bind:open
	bind:value
	bind:purpose
	placementCount={2}
	sectionCount={1}
	onDetectSections={handleDetectSections}
	onClear={handleClear}
/>

<output data-testid="open">{String(open)}</output>
<output data-testid="value">{value ?? 'null'}</output>
<output data-testid="purpose">{purpose}</output>
<output data-testid="cleared">{cleared}</output>
<output data-testid="detected">{detected}</output>
