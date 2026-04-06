<script lang="ts">
	import type { ThemePreference } from '../studio-data';
	import { Badge, Button, Card, Separator } from '@dryui/ui';

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

<header class="toolbar panel">
	<Card.Root>
		<div class="toolbar-inner">
			<Card.Content>
				<div class="brand">
					<Badge variant="solid" color="blue">dryui studio</Badge>
					<div>
						<h1>Visual builder</h1>
						<p>Palette, inspector, AI, webcam, and canvas controls in one workspace.</p>
					</div>
				</div>

				<div class="toolbar-separator">
					<Separator orientation="vertical" />
				</div>

				<div class="status">
					<Badge variant="outline" color="gray">Selected: {selectedLabel}</Badge>
					<Badge variant="outline" color="green">{zoom}% zoom</Badge>
				</div>

				<div class="actions">
					<Button
						type="button"
						variant={themePreference === 'system' ? 'solid' : 'outline'}
						onclick={() => onThemePreferenceChange('system')}
					>
						System
					</Button>
					<Button
						type="button"
						variant={themePreference === 'light' ? 'solid' : 'outline'}
						onclick={() => onThemePreferenceChange('light')}
					>
						Light
					</Button>
					<Button
						type="button"
						variant={themePreference === 'dark' ? 'solid' : 'outline'}
						onclick={() => onThemePreferenceChange('dark')}
					>
						Dark
					</Button>
					<div class="toolbar-separator">
						<Separator orientation="vertical" />
					</div>
					<Button type="button" variant="outline" disabled={!canUndo} onclick={onUndo}>Undo</Button>
					<Button type="button" variant="outline" disabled={!canRedo} onclick={onRedo}>Redo</Button>
					<Button type="button" variant="outline" onclick={onExport}>Export</Button>
					<Button type="button" variant="outline" onclick={onZoomOut}>-</Button>
					<Button type="button" variant="outline" onclick={onResetZoom}>Fit</Button>
					<Button type="button" variant="outline" onclick={onZoomIn}>+</Button>
				</div>
			</Card.Content>
		</div>
	</Card.Root>
</header>

<style>
	.toolbar {
		position: sticky;
		top: var(--dry-space-3);
		z-index: 2;
		box-shadow: var(--studio-shell-shadow);
	}

	.toolbar-inner {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) auto auto;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
		min-width: 0;
	}

	.brand h1 {
		margin: 0;
		font-size: var(--dry-text-lg-size);
		line-height: 1.1;
	}

	.brand p {
		margin: 0;
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-sm-size);
	}

	.status,
	.actions {
		display: flex;
		align-items: center;
		gap: var(--dry-space-2);
		flex-wrap: wrap;
	}

	.toolbar-separator {
		display: flex;
		align-self: stretch;
	}

	@media (max-width: 1200px) {
		.toolbar-inner {
			grid-template-columns: 1fr;
			justify-items: start;
		}
	}
</style>
