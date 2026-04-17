<script lang="ts">
	import { Check, Pencil, Eraser, MoveUpRight, Type, Move, Send, PowerOff } from 'lucide-svelte';
	import { AGENTS, type SubmissionAgent, type Tool } from '../types.js';

	interface Props {
		active: boolean;
		tool: Tool;
		hasDrawings: boolean;
		hidden: boolean;
		submitting: boolean;
		sent: boolean;
		agent: SubmissionAgent;
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
		ontoggle,
		ontoolchange,
		onagentchange,
		onsubmit
	}: Props = $props();

	const AGENT_LABEL: Record<SubmissionAgent, string> = {
		codex: 'Codex',
		claude: 'Claude',
		gemini: 'Gemini',
		off: 'Off'
	};

	function cycleAgent() {
		onagentchange(AGENTS[(AGENTS.indexOf(agent) + 1) % AGENTS.length] ?? 'codex');
	}

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

	<button
		class="tool-btn agent-btn"
		data-agent={agent}
		onclick={cycleAgent}
		title={`Dispatch to ${AGENT_LABEL[agent]} on submit — click to change`}
		aria-label={`Dispatch target: ${AGENT_LABEL[agent]}. Click to change.`}
	>
		{#if agent === 'codex'}
			<svg
				class="agent-icon"
				viewBox="0 0 24 24"
				fill="currentColor"
				fill-rule="evenodd"
				aria-hidden="true"
				width="16"
				height="16"
			>
				<path
					clip-rule="evenodd"
					d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"
				/>
			</svg>
		{:else if agent === 'claude'}
			<svg
				class="agent-icon"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
				width="16"
				height="16"
			>
				<path
					d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
				/>
			</svg>
		{:else if agent === 'gemini'}
			<svg
				class="agent-icon"
				viewBox="0 0 24 24"
				fill="currentColor"
				fill-rule="evenodd"
				aria-hidden="true"
				width="16"
				height="16"
			>
				<path
					d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"
				/>
			</svg>
		{:else}
			<PowerOff size={16} />
		{/if}
		<span class="agent-label">{AGENT_LABEL[agent]}</span>
	</button>

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
	}

	.agent-btn[data-agent='codex'] {
		color: hsl(200 75% 62%);
	}

	.agent-btn[data-agent='codex']:hover {
		background: hsl(200 45% 22%);
		color: hsl(200 85% 74%);
	}

	.agent-btn[data-agent='claude'] {
		color: hsl(25 100% 65%);
	}

	.agent-btn[data-agent='claude']:hover {
		background: hsl(25 45% 22%);
		color: hsl(25 100% 75%);
	}

	.agent-btn[data-agent='gemini'] {
		color: hsl(265 75% 68%);
	}

	.agent-btn[data-agent='gemini']:hover {
		background: hsl(265 35% 22%);
		color: hsl(265 85% 78%);
	}

	.agent-btn[data-agent='off'] {
		color: hsl(220 10% 55%);
	}

	.agent-btn[data-agent='off']:hover {
		background: hsl(220 12% 22%);
		color: hsl(220 10% 75%);
	}
</style>
