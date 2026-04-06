<script lang="ts">
	import {
		DesignMode,
		type DesignPlacement,
		type LayoutModeComponentType
	} from '../../../packages/feedback/src/layout-mode';

	interface Props {
		initialActiveComponent?: LayoutModeComponentType | null;
		initialPlacements?: DesignPlacement[];
	}

	const props: Props = $props();

	function initialActiveComponent(): LayoutModeComponentType | null {
		return props.initialActiveComponent === undefined ? 'card' : props.initialActiveComponent;
	}

	function initialPlacements(): DesignPlacement[] {
		return props.initialPlacements ? [...props.initialPlacements] : [];
	}

	let activeComponent = $state<LayoutModeComponentType | null>(initialActiveComponent());
	let placements = $state<DesignPlacement[]>(initialPlacements());
	let selectedCount = $state(0);

	function handleChange(next: DesignPlacement[]) {
		placements = next;
	}

	function handleSelectionChange(selected: Set<string>) {
		selectedCount = selected.size;
	}
</script>

<DesignMode
	bind:activeComponent
	{placements}
	onChange={handleChange}
	onSelectionChange={handleSelectionChange}
/>

<output data-testid="placements">{placements.length}</output>
<output data-testid="selected">{selectedCount}</output>
<output data-testid="active">{String(activeComponent)}</output>
<output data-testid="first-size"
	>{placements[0]
		? `${Math.round(placements[0].width)} x ${Math.round(placements[0].height)}`
		: ''}</output
>
<output data-testid="first-text">{placements[0]?.text ?? ''}</output>
