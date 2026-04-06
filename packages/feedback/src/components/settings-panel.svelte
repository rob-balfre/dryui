<script lang="ts">
	import { Badge } from '@dryui/ui/badge';
	import { Button } from '@dryui/ui/button';
	import { Field } from '@dryui/ui/field';
	import { Input } from '@dryui/ui/input';
	import { Label } from '@dryui/ui/label';
	import { RadioGroup } from '@dryui/ui/radio-group';
	import { SegmentedControl } from '@dryui/ui/segmented-control';
	import { Separator } from '@dryui/ui/separator';
	import { Text } from '@dryui/ui/text';
	import { Toggle } from '@dryui/ui/toggle';
	import { ANNOTATION_COLOR_OPTIONS, DEFAULT_SETTINGS } from '../constants.js';
	import type { ConnectionStatus, FeedbackSettings } from '../types.js';

	function applySwatch(node: HTMLElement, swatch: string) {
		node.style.setProperty('--swatch', swatch);
		return {
			update(s: string) {
				node.style.setProperty('--swatch', s);
			}
		};
	}

	interface Props {
		settings: FeedbackSettings;
		markersVisible?: boolean;
		onChange: (settings: FeedbackSettings) => void;
		onClose: () => void;
		onPause?: () => void;
		onHide?: () => void;
		onLayout?: () => void;
		onRearrange?: () => void;
		onToggleMarkers?: () => void;
		placementCount?: number;
		sectionCount?: number;
		paused?: boolean;
		hidden?: boolean;
		layoutActive?: boolean;
		rearrangeActive?: boolean;
		connectionStatus?: ConnectionStatus;
		endpoint?: string;
		sessionId?: string | null;
	}

	let props: Props = $props();

	const settings = $derived({ ...DEFAULT_SETTINGS, ...props.settings });
	const placementCount = $derived(props.placementCount ?? 0);
	const sectionCount = $derived(props.sectionCount ?? 0);
	const paused = $derived(props.paused ?? false);
	const layoutActive = $derived(props.layoutActive ?? false);
	const rearrangeActive = $derived(props.rearrangeActive ?? false);
	const connectionStatus = $derived(props.connectionStatus ?? 'disconnected');
	const endpoint = $derived(props.endpoint);
	const sessionId = $derived(props.sessionId ?? null);
	const markersVisible = $derived(props.markersVisible ?? true);
	let settingsPage = $state<'main' | 'automations'>('main');

	const connectionTone = $derived(
		connectionStatus === 'connected'
			? 'success'
			: connectionStatus === 'connecting'
				? 'warning'
				: 'info'
	);
	const connectionCopy = $derived(
		connectionStatus === 'connected'
			? 'Connected'
			: connectionStatus === 'connecting'
				? 'Connecting'
				: 'Disconnected'
	);

	function patchSettings(patch: Partial<FeedbackSettings>) {
		props.onChange({ ...settings, ...patch });
	}

	function openSettingsPage(page: 'main' | 'automations') {
		settingsPage = page;
	}
</script>

<div class="settings-surface" data-feedback-settings-panel data-dryui-feedback>
	<div class="vstack-lg">
		<div class="vstack-sm">
			<Text size="lg">Feedback settings</Text>
			<Text size="sm" color="secondary">
				Control output detail, marker behavior, and interaction blocking.
			</Text>
		</div>

		<Separator />

		<div class="settings-panel-container">
			<div class:automations={settingsPage === 'automations'} class="settings-panel-track">
				<section class="settings-page main-page" aria-label="Main settings">
					<div class="vstack-lg">
						<Field.Root>
							<Label>Output detail</Label>
							<div data-testid="settings-output-detail">
								<SegmentedControl.Root value={settings.outputDetail}>
									<SegmentedControl.Item
										value="compact"
										onclick={() => patchSettings({ outputDetail: 'compact' })}
									>
										Compact
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="standard"
										onclick={() => patchSettings({ outputDetail: 'standard' })}
									>
										Standard
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="detailed"
										onclick={() => patchSettings({ outputDetail: 'detailed' })}
									>
										Detailed
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="forensic"
										onclick={() => patchSettings({ outputDetail: 'forensic' })}
									>
										Forensic
									</SegmentedControl.Item>
								</SegmentedControl.Root>
							</div>
							<Field.Description>
								Standard keeps the summary readable. Forensic includes the most context.
							</Field.Description>
						</Field.Root>

						<Field.Root>
							<Label>Annotation color</Label>
							<div class="color-grid">
								<RadioGroup.Root
									orientation="vertical"
									value={settings.annotationColor}
									aria-label="Annotation color"
								>
									{#each ANNOTATION_COLOR_OPTIONS as option (option.value)}
										<RadioGroup.Item
											value={option.value}
											onclick={() => patchSettings({ annotationColor: option.value })}
										>
											<span
												class="color-option"
												data-testid={`settings-color-${option.value}`}
												use:applySwatch={option.swatch}
											>
												<span class="swatch" aria-hidden="true"></span>
												<span>{option.label}</span>
											</span>
										</RadioGroup.Item>
									{/each}
								</RadioGroup.Root>
							</div>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="vstack-sm">
									<Text size="sm" weight="medium">Clear on copy or send</Text>
									<Field.Description
										>Start with a clean slate after exporting annotations.</Field.Description
									>
								</div>
								<Toggle
									data-testid="settings-auto-clear"
									aria-label="Clear on copy or send"
									pressed={settings.autoClearAfterCopy}
									onclick={() => {
										patchSettings({ autoClearAfterCopy: !settings.autoClearAfterCopy });
									}}
								/>
							</div>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="vstack-sm">
									<Text size="sm" weight="medium">Block page interactions</Text>
									<Field.Description
										>Prevent clicks from reaching the app while feedback is active.</Field.Description
									>
								</div>
								<Toggle
									data-testid="settings-block-interactions"
									aria-label="Block page interactions"
									pressed={settings.blockInteractions}
									onclick={() => {
										patchSettings({ blockInteractions: !settings.blockInteractions });
									}}
								/>
							</div>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="vstack-sm">
									<Text size="sm" weight="medium">Detect Svelte component names</Text>
									<Field.Description
										>Include the Svelte component hierarchy when it is available.</Field.Description
									>
								</div>
								<Toggle
									data-testid="settings-svelte-detection"
									aria-label="Detect Svelte component names"
									pressed={settings.svelteDetection}
									onclick={() => {
										patchSettings({ svelteDetection: !settings.svelteDetection });
									}}
								/>
							</div>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="vstack-sm">
									<Text size="sm" weight="medium">Show markers</Text>
									<Field.Description
										>Keep annotation markers visible while feedback mode is active.</Field.Description
									>
								</div>
								<Toggle
									data-testid="settings-markers-visible"
									aria-label="Show markers"
									pressed={markersVisible}
									onclick={() => {
										props.onToggleMarkers?.();
									}}
								/>
							</div>
						</Field.Root>

						<Field.Root>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								data-testid="settings-hide-until-restart"
								onclick={() => {
									props.onHide?.();
								}}
								data-settings-btn-wide
							>
								Hide until restart
							</Button>
							<Field.Description>Hide the toolbar until you open a new tab.</Field.Description>
						</Field.Root>

						<Field.Root>
							<Label>Marker click behavior</Label>
							<div data-testid="settings-marker-behavior">
								<SegmentedControl.Root value={settings.markerClickBehavior}>
									<SegmentedControl.Item
										value="edit"
										onclick={() => patchSettings({ markerClickBehavior: 'edit' })}
									>
										Edit
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="delete"
										onclick={() => patchSettings({ markerClickBehavior: 'delete' })}
									>
										Delete
									</SegmentedControl.Item>
								</SegmentedControl.Root>
							</div>
							<Field.Description
								>Choose whether marker clicks reopen a note or remove it.</Field.Description
							>
						</Field.Root>

						<Field.Root>
							<Label>Theme</Label>
							<div data-testid="settings-theme">
								<SegmentedControl.Root value={settings.theme}>
									<SegmentedControl.Item
										value="dark"
										onclick={() => patchSettings({ theme: 'dark' })}
									>
										Dark
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="light"
										onclick={() => patchSettings({ theme: 'light' })}
									>
										Light
									</SegmentedControl.Item>
									<SegmentedControl.Item
										value="system"
										onclick={() => patchSettings({ theme: 'system' })}
									>
										System
									</SegmentedControl.Item>
								</SegmentedControl.Root>
							</div>
							<Field.Description
								>Match the annotation UI to the surrounding application theme.</Field.Description
							>
						</Field.Root>

						{#if placementCount > 0 || sectionCount > 0}
							<Field.Root>
								<Label>Layout state</Label>
								<Text size="sm" color="secondary">
									{placementCount} placement{placementCount === 1 ? '' : 's'} and {sectionCount} section{sectionCount ===
									1
										? ''
										: 's'} currently staged.
								</Text>
							</Field.Root>
						{/if}

						<Button
							variant="ghost"
							size="sm"
							data-testid="settings-automations-btn"
							onclick={() => openSettingsPage('automations')}
							data-settings-btn-between
						>
							<span>Manage MCP &amp; Webhooks</span>
							<span aria-hidden="true">→</span>
						</Button>

						<div class="hstack-sm" data-settings-action-stack>
							<Button
								variant="outline"
								size="sm"
								data-testid="settings-layout-btn"
								aria-pressed={layoutActive}
								onclick={props.onLayout}
							>
								Layout
							</Button>
							<Button
								variant="outline"
								size="sm"
								data-testid="settings-rearrange-btn"
								aria-pressed={rearrangeActive}
								onclick={props.onRearrange}
							>
								Rearrange
							</Button>
							<Button
								variant="outline"
								size="sm"
								data-testid="settings-pause-btn"
								aria-pressed={paused}
								onclick={props.onPause}
							>
								Pause
							</Button>
						</div>
					</div>
				</section>

				<section class="settings-page automations-page" aria-label="MCP and webhooks">
					<div class="vstack-lg">
						<Button
							variant="ghost"
							size="sm"
							data-testid="settings-back-btn"
							onclick={() => openSettingsPage('main')}
							data-settings-btn-between
						>
							<span aria-hidden="true">←</span>
							<span>Manage MCP &amp; Webhooks</span>
						</Button>

						<Separator />

						<Field.Root>
							<Label>MCP Connection</Label>
							<div class="hstack-sm">
								<Badge
									data-testid="settings-connection-status"
									variant="soft"
									color={connectionTone}
								>
									{connectionCopy}
								</Badge>
								{#if sessionId}
									<Text size="sm" color="secondary">{sessionId}</Text>
								{/if}
							</div>
							<Field.Description>
								{#if endpoint}
									{endpoint}
								{:else}
									Configure an endpoint to let AI agents receive annotations in real time.
								{/if}
							</Field.Description>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="vstack-sm">
									<Text size="sm" weight="medium">Enable webhooks</Text>
									<Field.Description>
										Turn on automatic submission to your configured endpoint. The toggle is disabled
										until a webhook URL is set.
									</Field.Description>
								</div>
								<Toggle
									data-testid="settings-webhooks-enabled"
									aria-label="Enable webhooks"
									pressed={settings.webhooksEnabled}
									disabled={!settings.webhookUrl}
									onclick={() => {
										if (!settings.webhookUrl) return;
										patchSettings({ webhooksEnabled: !settings.webhooksEnabled });
									}}
								/>
							</div>
						</Field.Root>

						<Field.Root>
							<Label>Webhook URL</Label>
							<Input
								type="url"
								value={settings.webhookUrl}
								data-testid="settings-webhook-url"
								placeholder="https://example.com/webhook"
								oninput={(event) => {
									patchSettings({ webhookUrl: (event.currentTarget as HTMLInputElement).value });
								}}
							/>
							<Field.Description
								>Used when webhooks are enabled and the feedback package submits output.</Field.Description
							>
						</Field.Root>
					</div>
				</section>
			</div>
		</div>

		<Separator />

		<Button variant="ghost" size="sm" data-testid="settings-close-btn" onclick={props.onClose}>
			Close
		</Button>
	</div>
</div>

<style>
	.vstack-lg {
		display: grid;
		gap: var(--dry-space-6, 1.5rem);
	}

	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.hstack-sm {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.toggle-row {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: var(--dry-space-4, 1rem);
		align-items: center;
	}

	.settings-surface {
	}

	.settings-panel-container {
		overflow: hidden;
		position: relative;
	}

	.settings-panel-track {
		display: grid;
		grid-template-columns: repeat(2, 100%);
		transition: transform 0.2s ease;
		will-change: transform;
	}

	.settings-panel-track.automations {
		transform: translateX(-50%);
	}

	.settings-page {
		box-sizing: border-box;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.main-page {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(0);
	}

	.automations-page {
		opacity: 0;
		pointer-events: none;
		transform: translateX(24px);
	}

	.settings-panel-track.automations .main-page {
		opacity: 0;
		pointer-events: none;
		transform: translateX(-24px);
	}

	.settings-panel-track.automations .automations-page {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-24px);
	}

	.color-grid {
		gap: 0.75rem;
	}

	.color-option {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
	}

	.swatch {
		aspect-ratio: 1;
		height: 0.875rem;
		border-radius: 9999px;
		background: var(--swatch);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
		flex: none;
	}

	.settings-surface [data-settings-btn-wide] {
		justify-content: flex-start;
	}

	.settings-surface [data-settings-btn-between] {
		justify-content: space-between;
	}

	.settings-surface [data-settings-action-stack] {
		flex-wrap: wrap;
	}
</style>
