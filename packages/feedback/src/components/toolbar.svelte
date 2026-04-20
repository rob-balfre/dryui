<script lang="ts">
	import { Dialog } from '@dryui/ui';
	import { Check, Pencil, Eraser, MoveUpRight, Type, Move, Send, PowerOff } from 'lucide-svelte';
	import { AGENTS, type SubmissionAgent, type Tool } from '../types.js';
	import AgentIcon from './agent-icon.svelte';
	import { AGENT_META } from './agent-meta.js';

	interface Props {
		active: boolean;
		tool: Tool;
		hasDrawings: boolean;
		hidden: boolean;
		submitting: boolean;
		sent: boolean;
		agent: SubmissionAgent;
		availableAgents: Array<Exclude<SubmissionAgent, 'off'>>;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onagentchange: (agent: SubmissionAgent) => void;
		onsubmit: () => void;
	}

	let {
		active,
		tool,
		hasDrawings,
		hidden,
		submitting,
		sent,
		agent,
		availableAgents,
		ontoggle,
		ontoolchange,
		onagentchange,
		onsubmit
	}: Props = $props();

	let agentDialogOpen = $state(false);
	const FALLBACK_AGENTS = AGENTS.filter(
		(entry): entry is Exclude<SubmissionAgent, 'off'> => entry !== 'off'
	);

	const chooserAgents = $derived<SubmissionAgent[]>([
		...(availableAgents.length > 0 ? availableAgents : FALLBACK_AGENTS),
		'off'
	]);
	const dialogTitle = $derived(
		availableAgents.length > 0 ? 'Configured dispatch targets' : 'Dispatch target'
	);

	let dragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	const showMoveTool = $derived(hasDrawings || (active && tool === 'move'));
	const showEraserTool = $derived(hasDrawings || (active && tool === 'eraser'));
	const showSubmitButton = $derived(hasDrawings || submitting || sent);

	function handlePointerDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button')) return;
		const toolbar = e.currentTarget as HTMLDivElement;
		dragging = true;
		const rect = toolbar.getBoundingClientRect();
		dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		toolbar.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		const toolbar = e.currentTarget as HTMLDivElement;
		const x = Math.max(
			0,
			Math.min(window.innerWidth - toolbar.offsetWidth, e.clientX - dragOffset.x)
		);
		const y = Math.max(
			0,
			Math.min(window.innerHeight - toolbar.offsetHeight, e.clientY - dragOffset.y)
		);
		toolbar.style.left = `${x}px`;
		toolbar.style.top = `${y}px`;
		toolbar.style.right = 'auto';
		toolbar.style.bottom = 'auto';
	}

	function handlePointerUp() {
		dragging = false;
	}

	function handleToolClick(t: Tool) {
		if (!active || tool !== t) {
			ontoolchange(t);
			if (!active) ontoggle();
		} else {
			ontoggle();
		}
	}

	function chooseAgent(next: SubmissionAgent) {
		onagentchange(next);
		agentDialogOpen = false;
	}
</script>

<div
	class="toolbar"
	data-hidden={hidden || undefined}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	role="toolbar"
	tabindex="-1"
	aria-hidden={hidden}
	aria-label="Feedback drawing tools"
>
	<button
		class="tool-btn"
		data-active={(active && tool === 'pencil') || undefined}
		onclick={() => handleToolClick('pencil')}
		aria-label={active && tool === 'pencil' ? 'Stop drawing' : 'Draw'}
	>
		<Pencil size={18} />
	</button>

	<button
		class="tool-btn"
		data-active={(active && tool === 'arrow') || undefined}
		onclick={() => handleToolClick('arrow')}
		aria-label={active && tool === 'arrow' ? 'Stop arrows' : 'Arrow'}
	>
		<MoveUpRight size={18} />
	</button>

	<button
		class="tool-btn"
		data-active={(active && tool === 'text') || undefined}
		onclick={() => handleToolClick('text')}
		aria-label={active && tool === 'text' ? 'Stop text' : 'Text'}
	>
		<Type size={18} />
	</button>

	{#if showMoveTool}
		<button
			class="tool-btn"
			data-active={(active && tool === 'move') || undefined}
			onclick={() => handleToolClick('move')}
			aria-label={active && tool === 'move' ? 'Stop moving' : 'Move'}
		>
			<Move size={18} />
		</button>
	{/if}

	{#if showEraserTool}
		<button
			class="tool-btn"
			data-active={(active && tool === 'eraser') || undefined}
			onclick={() => handleToolClick('eraser')}
			aria-label={active && tool === 'eraser' ? 'Stop erasing' : 'Erase'}
		>
			<Eraser size={18} />
		</button>
	{/if}

	<Dialog.Root bind:open={agentDialogOpen}>
		<Dialog.Trigger>
			<button
				class="tool-btn agent-btn"
				data-agent={agent}
				title={`Dispatch to ${AGENT_META[agent].label} on submit — click to change`}
				aria-label={`Dispatch target: ${AGENT_META[agent].label}. Click to change.`}
			>
				{#if agent === 'off'}
					<PowerOff size={16} />
				{:else}
					<AgentIcon {agent} size={16} />
				{/if}
				<span class="agent-label">{AGENT_META[agent].shortLabel}</span>
			</button>
		</Dialog.Trigger>

		<Dialog.Content
			--dry-dialog-max-width="min(48rem, calc(100vw - 2rem))"
			--dry-dialog-overflow="visible"
		>
			<Dialog.Header>{dialogTitle}</Dialog.Header>
			<Dialog.Body>
				<div class="agent-dialog-body">
					<p class="agent-dialog-copy">
						Choose where feedback should launch when you submit the next screenshot.
					</p>
					<div class="agent-grid" role="list" aria-label="Dispatch targets">
						{#each chooserAgents as choice (choice)}
							<button
								class="agent-option"
								data-active={choice === agent || undefined}
								data-mode={AGENT_META[choice].mode}
								onclick={() => chooseAgent(choice)}
								type="button"
							>
								<div class="agent-option-head">
									{#if choice === 'off'}
										<span class="agent-option-icon">
											<PowerOff size={18} aria-hidden="true" />
										</span>
									{:else}
										<AgentIcon agent={choice} size={18} />
									{/if}
									<span class="agent-option-label">{AGENT_META[choice].label}</span>
								</div>
								<span class="agent-option-description">{AGENT_META[choice].description}</span>
							</button>
						{/each}
					</div>
				</div>
			</Dialog.Body>
		</Dialog.Content>
	</Dialog.Root>

	{#if showSubmitButton}
		<button
			class="tool-btn submit-btn"
			data-submitting={submitting || undefined}
			data-sent={sent || undefined}
			onclick={onsubmit}
			aria-label={sent ? 'Sent!' : submitting ? 'Sending...' : 'Send feedback'}
		>
			{#if sent}
				<Check size={16} />
				<span class="submit-label">Sent!</span>
			{:else}
				<Send size={16} />
				<span class="submit-label">{submitting ? 'Sending...' : 'Send feedback'}</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	.toolbar {
		--accent: hsl(25 100% 55%);

		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 10000;
		display: grid;
		grid-auto-flow: column;
		gap: 2px;
		padding: 4px;
		border-radius: 12px;
		background: hsl(225 15% 15% / 0.95);
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		cursor: grab;
		user-select: none;
		touch-action: none;
	}

	.toolbar:active {
		cursor: grabbing;
	}

	.toolbar[data-hidden] {
		visibility: hidden;
		pointer-events: none;
	}

	.tool-btn {
		display: grid;
		place-items: center;
		padding: 8px;
		border: 2px solid transparent;
		border-radius: 8px;
		background: transparent;
		color: hsl(220 10% 70%);
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s,
			color 0.15s;
	}

	.tool-btn:hover {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 90%);
	}

	.tool-btn[data-active] {
		background: var(--accent);
		border-color: white;
		color: black;
		box-shadow:
			0 0 0 1px black,
			0 4px 12px hsl(0 0% 0% / 0.35);
	}

	.tool-btn[data-active]:hover {
		background: hsl(25 100% 62%);
		color: black;
	}

	.submit-btn {
		grid-template-columns: auto auto;
		gap: 4px;
		padding-inline-end: 10px;
		color: hsl(145 70% 50%);
	}

	.submit-btn:hover {
		background: hsl(145 70% 25%);
		color: hsl(145 70% 70%);
	}

	.submit-btn[data-submitting] {
		opacity: 0.5;
	}

	.submit-btn[data-sent] {
		background: hsl(145 70% 25%);
		color: hsl(145 70% 70%);
	}

	.submit-label,
	.agent-label {
		font-size: 12px;
		font-weight: 600;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		white-space: nowrap;
	}

	.agent-btn {
		grid-template-columns: auto auto;
		gap: 4px;
		padding-inline-end: 10px;
		color: var(--agent-fg);
	}

	.agent-btn:hover {
		background: var(--agent-bg-hover);
		color: var(--agent-fg-hover);
	}

	.agent-btn[data-agent='codex'] {
		--agent-fg: hsl(200 75% 62%);
		--agent-bg-hover: hsl(200 45% 22%);
		--agent-fg-hover: hsl(200 85% 74%);
	}

	.agent-btn[data-agent='claude'] {
		--agent-fg: hsl(25 100% 65%);
		--agent-bg-hover: hsl(25 45% 22%);
		--agent-fg-hover: hsl(25 100% 75%);
	}

	.agent-btn[data-agent='gemini'] {
		--agent-fg: hsl(265 75% 68%);
		--agent-bg-hover: hsl(265 35% 22%);
		--agent-fg-hover: hsl(265 85% 78%);
	}

	.agent-btn[data-agent='opencode'] {
		--agent-fg: hsl(0 0% 72%);
		--agent-bg-hover: hsl(220 12% 22%);
		--agent-fg-hover: hsl(0 0% 92%);
	}

	.agent-btn[data-agent='copilot'] {
		--agent-fg: hsl(150 55% 62%);
		--agent-bg-hover: hsl(150 30% 22%);
		--agent-fg-hover: hsl(150 60% 74%);
	}

	.agent-btn[data-agent='copilot-vscode'] {
		--agent-fg: hsl(210 86% 70%);
		--agent-bg-hover: hsl(210 40% 22%);
		--agent-fg-hover: hsl(210 92% 82%);
	}

	.agent-btn[data-agent='cursor'] {
		--agent-fg: hsl(208 84% 70%);
		--agent-bg-hover: hsl(208 45% 22%);
		--agent-fg-hover: hsl(208 92% 82%);
	}

	.agent-btn[data-agent='windsurf'] {
		--agent-fg: hsl(177 69% 71%);
		--agent-bg-hover: hsl(177 36% 21%);
		--agent-fg-hover: hsl(177 80% 83%);
	}

	.agent-btn[data-agent='zed'] {
		--agent-fg: hsl(0 0% 92%);
		--agent-bg-hover: hsl(220 12% 22%);
		--agent-fg-hover: hsl(0 0% 100%);
	}

	.agent-btn[data-agent='off'] {
		--agent-fg: hsl(220 10% 55%);
		--agent-bg-hover: hsl(220 12% 22%);
		--agent-fg-hover: hsl(220 10% 75%);
	}

	.agent-dialog-body {
		display: grid;
		gap: 0.875rem;
		container-type: inline-size;
	}

	.agent-dialog-copy {
		margin: 0;
		font-size: 0.95rem;
		color: hsl(220 10% 74%);
	}

	.agent-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.agent-option {
		display: grid;
		gap: 0.5rem;
		padding: 0.875rem;
		border: 1px solid hsl(220 13% 24%);
		border-radius: 14px;
		background: hsl(225 14% 12%);
		color: hsl(220 12% 90%);
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
	}

	.agent-option:hover {
		background: hsl(225 14% 16%);
		border-color: hsl(220 16% 34%);
		transform: translateY(-1px);
	}

	.agent-option[data-active] {
		border-color: hsl(25 100% 55%);
		background: hsl(225 14% 17%);
		box-shadow: 0 0 0 1px hsl(25 100% 55% / 0.35);
	}

	.agent-option[data-mode='off'][data-active] {
		border-color: hsl(220 10% 55%);
		box-shadow: 0 0 0 1px hsl(220 10% 55% / 0.35);
	}

	.agent-option-head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		align-items: center;
		gap: 0.55rem;
	}

	.agent-option-icon {
		display: inline-grid;
		place-items: center;
		color: hsl(220 10% 60%);
	}

	.agent-option-label {
		font-size: 0.95rem;
		font-weight: 600;
	}

	.agent-option-description {
		font-size: 0.82rem;
		line-height: 1.35;
		color: hsl(220 10% 68%);
	}

	@container (max-width: 40rem) {
		.agent-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
