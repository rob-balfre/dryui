<script lang="ts">
	import { parseCommandOutput } from '@dryui/studio-server/command-parser';
	import { Badge, Card } from '@dryui/ui';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import type { GestureEvent, Point3D } from '@dryui/hand-tracking';
	import ChatPanel from './ai/ChatPanel.svelte';
	import { createCommandBridge } from './ai/command-bridge';
	import { createChatStore } from './ai/chat-store.svelte';
	import { createStudioWsClient } from './ai/ws-client';
	import { mapGestureToStudioMutation } from './gesture-adapter';
	import ComponentPalette from './panels/ComponentPalette.svelte';
	import LayersPanel from './panels/LayersPanel.svelte';
	import PropertyInspector from './panels/PropertyInspector.svelte';
	import ThemeEditor from './panels/ThemeEditor.svelte';
	import WebcamPanel from './panels/WebcamPanel.svelte';
	import CanvasPreview from './preview/CanvasPreview.svelte';
	import { createMessages } from './studio-data';
	import { createStudioState, type StudioStateSnapshot } from './studio-state.svelte';
	import StudioToolbar from './toolbar/StudioToolbar.svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const HAND_TRACKING_WIDTH = 320;
	const HAND_TRACKING_HEIGHT = 240;
	const PALETTE_DRAG_MIME = 'application/vnd.dryui.palette-item+json';
	const studio = createStudioState();
	const chat = createChatStore(createMessages());
	const commandBridge = createCommandBridge(studio.bus);
	let sessionId = $state<string | null>(null);
	let pendingPrompt = $state<string | null>(null);
	let streamedOutput = $state('');
	const wsClient = createStudioWsClient({
		onStatusChange: (status) => {
			chat.setStatus(status);
		},
		onMessage: (message) => {
			handleServerMessage(message);
		}
	});

	let snapshot = $state<StudioStateSnapshot>(studio.snapshot());
	let chatState = $state(chat.snapshot());

	function syncStudio(next: StudioStateSnapshot) {
		snapshot = next;
	}

	function syncChat() {
		chatState = chat.snapshot();
	}

	function handleServerMessage(
		message: import('@dryui/studio-server/protocol').StudioServerMessage
	) {
		switch (message.type) {
			case 'welcome':
				sessionId = message.sessionId;
				streamedOutput = '';
				return;
			case 'state':
				sessionId = message.session.id;
				return;
			case 'pty-output':
				streamedOutput += message.chunk;
				return;
			case 'pty-exit':
				finalizeServerPreview();
				return;
			case 'command-applied':
				if (!pendingPrompt) {
					return;
				}

				appendServerPreview(
					pendingPrompt,
					[message.command],
					'Prepared a preview from the studio server response.'
				);
				pendingPrompt = null;
				streamedOutput = '';
				return;
			case 'error':
				chat.appendAssistant(message.message);
				pendingPrompt = null;
				streamedOutput = '';
				return;
			default:
				return;
		}
	}

	function appendServerPreview(
		prompt: string,
		commands: import('@dryui/canvas').CanvasCommand[],
		assistantMessage: string
	) {
		const preview = commandBridge.buildPreviewFromCommands(prompt, commands, assistantMessage);
		if (!preview) {
			chat.appendAssistant(
				'The studio server returned a command bundle that could not be safely previewed.'
			);
			chat.clearPreview();
			return;
		}

		chat.appendAssistant(preview.assistantMessage);
		chat.setPreview(preview);
	}

	function finalizeServerPreview() {
		if (!pendingPrompt) {
			streamedOutput = '';
			return;
		}

		try {
			const parsed = parseCommandOutput(streamedOutput);
			appendServerPreview(
				pendingPrompt,
				parsed.commands,
				'Prepared a preview from the studio server response.'
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Unable to parse the studio server response.';
			chat.appendAssistant(message);
			chat.clearPreview();
		} finally {
			pendingPrompt = null;
			streamedOutput = '';
		}
	}

	function startPaletteDrag(event: DragEvent, item: import('./studio-data').PaletteItem) {
		studio.selectPaletteItem(item);
		event.dataTransfer?.setData(PALETTE_DRAG_MIME, JSON.stringify({ component: item.component }));
		event.dataTransfer?.setData('text/plain', item.component);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'copy';
		}
	}

	function handleCanvasDrop(component: string) {
		studio.insertPaletteComponent(component);
	}

	function resolveHoveredNodeId(cursor: Point3D | null): string | null {
		if (typeof document === 'undefined' || !cursor) {
			return null;
		}

		const viewport = document.querySelector<HTMLElement>('[data-studio-canvas-viewport]');
		if (!viewport) {
			return null;
		}

		const rect = viewport.getBoundingClientRect();
		const screenX = rect.left + (cursor.x / HAND_TRACKING_WIDTH) * rect.width;
		const screenY = rect.top + (cursor.y / HAND_TRACKING_HEIGHT) * rect.height;
		const elements = document.elementsFromPoint(screenX, screenY);
		const target = elements
			.find(
				(element) => element instanceof HTMLElement && element.hasAttribute('data-studio-node-id')
			)
			?.closest<HTMLElement>('[data-studio-node-id]');

		return target?.dataset.studioNodeId ?? null;
	}

	function handleGesture(event: GestureEvent) {
		const hoveredNodeId = resolveHoveredNodeId(event.cursor);
		const enrichedEvent: GestureEvent = {
			...event,
			details: {
				...event.details,
				...(hoveredNodeId ? { nodeId: hoveredNodeId } : {})
			}
		};

		const result = mapGestureToStudioMutation(enrichedEvent, {
			hoveredNodeId: hoveredNodeId ?? studio.bus.selection.hoveredNodeId,
			selectedNodeId: studio.bus.selection.activeNodeId,
			zoom: snapshot.zoom
		});

		if (hoveredNodeId !== studio.bus.selection.hoveredNodeId) {
			studio.setHoveredNode(hoveredNodeId);
		}

		if (
			result.hoveredNodeId !== undefined &&
			result.hoveredNodeId !== studio.bus.selection.hoveredNodeId
		) {
			studio.setHoveredNode(result.hoveredNodeId);
		}

		if (typeof result.nextZoom === 'number' && result.nextZoom !== snapshot.zoom) {
			studio.setZoom(result.nextZoom);
		}

		for (const command of result.commands) {
			if (command.type === 'select-node' && studio.bus.selection.activeNodeId === command.nodeId) {
				continue;
			}

			if (command.type === 'deselect-all' && studio.bus.selection.selectedNodeIds.length === 0) {
				continue;
			}

			studio.bus.execute(command, 'gesture');
		}
	}

	onMount(() => {
		const disposeStudio = studio.mount();
		const unsubscribeStudio = studio.subscribe(syncStudio);
		const unsubscribeChat = chat.subscribe(syncChat);

		if (typeof window !== 'undefined') {
			wsClient.connect();
		}

		return () => {
			unsubscribeStudio();
			unsubscribeChat();
			wsClient.disconnect();
			disposeStudio();
		};
	});

	function sendChat(content: string) {
		chat.appendUser(content);

		if (wsClient.status === 'connected' && sessionId) {
			pendingPrompt = content;
			streamedOutput = '';
			chat.clearPreview();
			chat.appendAssistant(
				'Sent the prompt to the studio server. Preparing a preview from the streamed response.'
			);
			wsClient.send({ type: 'prompt', text: content });
			return;
		}

		const preview = commandBridge.buildPreview(content, {
			document: studio.bus.document,
			selectedNodeId: studio.bus.selection.activeNodeId
		});

		if (!preview) {
			chat.appendAssistant(
				`I couldn't derive a safe studio command from "${content}" yet. Try naming a DryUI component, asking for undo or redo, or requesting a size change on the current selection.`
			);
			chat.clearPreview();
			return;
		}

		chat.appendAssistant(preview.assistantMessage);
		chat.setPreview(preview);
	}

	function applyPreview() {
		const preview = chat.preview;
		if (!preview) {
			return;
		}

		const result = commandBridge.applyPreview(preview);
		chat.appendAssistant(result.message);

		if (result.applied) {
			chat.clearPreview();
		}
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === '=' || event.key === '+') {
			studio.zoomIn();
		}
		if (event.key === '-') {
			studio.zoomOut();
		}
	}}
/>

<div class="studio-shell">
	<StudioToolbar
		zoom={snapshot.zoom}
		canUndo={snapshot.canUndo}
		canRedo={snapshot.canRedo}
		selectedLabel={snapshot.selectedLabel}
		themePreference={snapshot.themePreference}
		onThemePreferenceChange={(preference) => studio.setThemePreference(preference)}
		onUndo={() => studio.undo()}
		onRedo={() => studio.redo()}
		onExport={() => studio.exportDocument()}
		onZoomIn={() => studio.zoomIn()}
		onZoomOut={() => studio.zoomOut()}
		onResetZoom={() => studio.resetZoom()}
	/>

	<div class="workspace">
		<aside class="left-rail">
			<ComponentPalette
				items={studio.paletteItems}
				selectedId={snapshot.selectedPaletteId}
				onSelect={(item) => studio.selectPaletteItem(item)}
				onDragStart={startPaletteDrag}
			/>
			<WebcamPanel
				enabled={snapshot.webcamEnabled}
				calibrationStep={snapshot.calibrationStep}
				onToggleEnabled={() => studio.setWebcamEnabled(!snapshot.webcamEnabled)}
				onAdvanceCalibration={() => studio.advanceCalibration()}
				onGesture={handleGesture}
			/>
		</aside>

		<main class="main-rail">
			{#if children}
				<section class="page-slot">
					{@render children()}
				</section>
			{:else}
				<section class="page-slot">
					<Card.Root>
						<Card.Header>
							<Badge variant="outline" color="blue">Welcome</Badge>
							<h2>Workspace ready</h2>
						</Card.Header>
						<Card.Content>
							<p>
								Select a component from the palette to insert it into the live canvas, then tune it
								from the inspector.
							</p>
						</Card.Content>
					</Card.Root>
				</section>
			{/if}

			<CanvasPreview
				document={snapshot.document}
				selectedNodeIds={snapshot.selectedNodeIds}
				hoveredNodeId={snapshot.hoveredNodeId}
				zoom={snapshot.zoom}
				onSelectNode={(nodeId) => studio.selectCanvasNode(nodeId)}
				onClearSelection={() => studio.clearSelection()}
				onDropComponent={handleCanvasDrop}
			/>
		</main>

		<aside class="right-rail">
			<PropertyInspector
				inspector={snapshot.inspector}
				onControlChange={(control, value) => studio.updateNodeControl(control, value)}
			/>
			<LayersPanel
				layers={snapshot.layers}
				onSelect={(nodeId) => studio.selectCanvasNode(nodeId)}
			/>
			<ThemeEditor
				preference={snapshot.themePreference}
				tokens={snapshot.themeTokens}
				onPreferenceChange={(preference) => studio.setThemePreference(preference)}
				onTokenChange={(name, value) => studio.updateThemeToken(name, value)}
			/>
			<ChatPanel
				messages={chatState.messages}
				preview={chatState.preview}
				status={chatState.status}
				onSend={sendChat}
				onApplyPreview={applyPreview}
				onDismissPreview={() => chat.clearPreview()}
			/>
		</aside>
	</div>
</div>

<style>
	.studio-shell {
		position: relative;
		display: grid;
		gap: var(--dry-space-4);
		min-height: 100dvh;
		padding: var(--dry-space-4);
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(320px, 360px) minmax(0, 1fr) minmax(340px, 400px);
		gap: var(--dry-space-4);
		align-items: start;
	}

	.left-rail,
	.right-rail,
	.main-rail {
		display: grid;
		gap: var(--dry-space-4);
		align-content: start;
		min-width: 0;
	}

	.left-rail,
	.right-rail {
		position: sticky;
		top: calc(var(--dry-space-6) + 5.25rem);
	}

	.page-slot h2 {
		margin: 0;
	}

	.page-slot p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	@media (max-width: 1440px) {
		.workspace {
			grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
		}

		.right-rail {
			grid-column: span 2;
			position: static;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}
	}

	@media (max-width: 980px) {
		.workspace,
		.right-rail {
			grid-template-columns: minmax(0, 1fr);
		}

		.left-rail,
		.right-rail {
			position: static;
		}
	}
</style>
