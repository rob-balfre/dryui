import { createTemplateForComponent } from '../../canvas/src/registry/templates.js';
import type { CanvasCommand, StudioSessionSnapshot } from './types.js';
import { buildSystemPrompt } from './system-prompt.js';

export interface StudioPromptRequest {
	readonly sessionId: string;
	readonly prompt: string;
	readonly systemPrompt: string;
	readonly session: StudioSessionSnapshot | undefined;
}

function inferComponent(prompt: string): string | null {
	const normalized = prompt.toLowerCase();
	const candidates = [
		'Card',
		'Button',
		'Input',
		'Textarea',
		'Slider',
		'Switch',
		'Badge',
		'Dialog',
		'Tooltip',
		'Separator',
		'Flex',
		'Stack'
	];

	return candidates.find((candidate) => normalized.includes(candidate.toLowerCase())) ?? null;
}

function insertNodeCommand(
	component: string,
	session: StudioSessionSnapshot | undefined
): CanvasCommand {
	const parentId = session?.document?.root.id ?? 'root';
	const index = session?.document?.root.children.length ?? 0;

	return {
		type: 'insert-node',
		parentId,
		index,
		node: createTemplateForComponent(component)
	};
}

export function buildPromptRequest(
	sessionId: string,
	prompt: string,
	session: StudioSessionSnapshot | undefined
): StudioPromptRequest {
	return {
		sessionId,
		prompt,
		session,
		systemPrompt: buildSystemPrompt({
			...(session?.document ? { document: session.document } : {}),
			workspaceName: 'DryUI Studio',
			extraInstructions: [
				'Return JSON only.',
				'Prefer a small command list.',
				'If nothing matches, return an empty array.'
			]
		})
	};
}

export function inferPromptCommands(request: StudioPromptRequest): CanvasCommand[] {
	const normalized = request.prompt.trim().toLowerCase();
	if (!normalized) {
		return [];
	}

	if (normalized.includes('undo') || normalized.includes('redo')) {
		return [];
	}

	const component = inferComponent(normalized);
	if (component && /(add|create|insert|make|build|new)/.test(normalized)) {
		return [insertNodeCommand(component, request.session)];
	}

	if (normalized.includes('theme') && normalized.includes('dark')) {
		return [
			{
				type: 'set-theme-var',
				varName: '--dry-color-primary',
				value: '#2647c9'
			}
		];
	}

	return [];
}

export function renderPromptOutput(request: StudioPromptRequest): string {
	return `\`\`\`json\n${JSON.stringify(inferPromptCommands(request), null, 2)}\n\`\`\`\n`;
}
