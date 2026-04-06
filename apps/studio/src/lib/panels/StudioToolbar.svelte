<script lang="ts">
	import Toolbar from '../toolbar/StudioToolbar.svelte';
	import type { ThemePreference } from '../studio-data';

	interface Props {
		zoom: number;
		canUndo: boolean;
		canRedo: boolean;
		themePreference: ThemePreference;
		selectedLabel: string;
		onThemePreferenceChange: (preference: ThemePreference) => void;
		onUndo: () => void;
		onRedo: () => void;
		onExport: () => void;
		onZoomIn: () => void;
		onZoomOut: () => void;
		onResetZoom: () => void;
	}

	let {
		zoom,
		canUndo,
		canRedo,
		themePreference,
		selectedLabel,
		onThemePreferenceChange,
		onUndo,
		onRedo,
		onExport,
		onZoomIn,
		onZoomOut,
		onResetZoom
	}: Props = $props();
</script>

<Toolbar
	{zoom}
	{canUndo}
	{canRedo}
	{themePreference}
	{selectedLabel}
	{onThemePreferenceChange}
	{onUndo}
	{onRedo}
	{onExport}
	{onZoomIn}
	{onZoomOut}
	{onResetZoom}
/>
