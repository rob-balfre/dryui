import {
	aiAgentSetups,
	type AiAgentSetup,
	type AiInstallStep
} from '../../../../apps/docs/src/lib/ai-setup.js';
import type { AgentId } from '../../../../packages/mcp/src/docs-surface.js';

export type SetupGuideId = AgentId;

export interface SetupGuideSection {
	title: string;
	note?: string;
	code: string;
}

export interface SetupGuide {
	id: SetupGuideId;
	label: string;
	description: string;
	sections: readonly SetupGuideSection[];
	followUp: string;
}

function stepToSection(step: AiInstallStep): SetupGuideSection | null {
	if (!step.code) return null;
	return {
		title: step.title,
		...(step.description ? { note: step.description } : {}),
		code: step.code
	};
}

function fallbackSections(setup: AiAgentSetup): SetupGuideSection[] {
	const sections: SetupGuideSection[] = [];

	if (setup.skill) {
		sections.push({
			title: setup.skill.title.replace(/^\d+\.\s*/, ''),
			note: setup.skill.note,
			code: setup.skill.code
		});
	}

	sections.push({
		title: 'Add the feedback MCP server',
		note: setup.mcp.note,
		code: setup.mcp.code
	});

	return sections;
}

function setupToGuide(setup: AiAgentSetup): SetupGuide {
	const primarySections = setup.installSteps
		? setup.installSteps.flatMap((step) => {
				const section = stepToSection(step);
				return section ? [section] : [];
			})
		: fallbackSections(setup);
	const cliOnlySections =
		setup.cliOnlySteps?.flatMap((step) => {
			const section = stepToSection(step);
			return section ? [section] : [];
		}) ?? [];
	const companionSection = setup.companionMcp
		? [
				{
					title: setup.companionMcp.title,
					note: setup.companionMcp.note,
					code: setup.companionMcp.code
				}
			]
		: [];

	return {
		id: setup.id,
		label: setup.label,
		description: setup.description,
		sections: [...primarySections, ...cliOnlySections, ...companionSection],
		followUp: setup.followUp
	};
}

export const setupGuides: readonly SetupGuide[] = aiAgentSetups.map(setupToGuide);

export const setupGuideIds: readonly SetupGuideId[] = setupGuides.map((guide) => guide.id);

export function getSetupGuide(id: SetupGuideId): SetupGuide {
	const guide = setupGuides.find((entry) => entry.id === id);
	if (!guide) {
		throw new Error(`Unknown setup guide: ${id}`);
	}
	return guide;
}
