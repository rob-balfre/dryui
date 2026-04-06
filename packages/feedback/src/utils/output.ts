import type { Annotation, DesignPlacement, OutputDetail, RearrangeState, Rect } from '../types.js';
import {
	generateDesignOutput as generateLayoutDesignOutput,
	generateRearrangeOutput as generateLayoutRearrangeOutput
} from '../layout-mode/output.js';

export const OUTPUT_DETAIL_OPTIONS: Array<{ value: OutputDetail; label: string }> = [
	{ value: 'compact', label: 'Compact' },
	{ value: 'standard', label: 'Standard' },
	{ value: 'detailed', label: 'Detailed' },
	{ value: 'forensic', label: 'Forensic' }
];

export interface GenerateOutputOptions {
	designPlacements?: DesignPlacement[];
	rearrangeState?: RearrangeState | null;
	blankCanvas?: boolean;
	wireframePurpose?: string;
}

function viewportSummary(): string {
	if (typeof window === 'undefined') return 'unknown';
	return `${window.innerWidth}x${window.innerHeight}`;
}

function browserLocationHref(): string | null {
	if (typeof window !== 'undefined' && window.location?.href) {
		return window.location.href;
	}

	if (typeof location !== 'undefined' && location.href) {
		return location.href;
	}

	return null;
}

function formatRect(rect: Rect): string {
	return `${Math.round(rect.width)}x${Math.round(rect.height)} at (${Math.round(rect.x)}, ${Math.round(rect.y)})`;
}

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

function uniqueEntries(entries: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const entry of entries) {
		const normalized = normalizeWhitespace(entry);
		if (!normalized) continue;

		const key = normalized.toLowerCase();
		if (seen.has(key)) continue;

		seen.add(key);
		result.push(normalized);
	}

	return result;
}

function splitEntries(value: string, separator: RegExp): string[] {
	return uniqueEntries(value.split(separator));
}

function normalizeKeyValueEntry(value: string): string {
	const normalized = normalizeWhitespace(value.replace(/[;,]+$/, ''));
	const match = normalized.match(/^([\w-]+)\s*([=:])\s*(.+)$/);
	if (!match) {
		return normalized;
	}

	const [, key, , rawValue] = match;
	return `${key}: ${normalizeWhitespace(rawValue ?? '')}`;
}

function splitAccessibilityEntries(value: string): string[] {
	const normalized = value.trim();
	let entries = splitEntries(normalized, /[\n;]+/);

	if (entries.length <= 1) {
		entries = splitEntries(normalized, /,\s*(?=[a-z][\w-]*\s*[=:])/i);
	}

	if (entries.length <= 1 && normalized.includes(',')) {
		entries = splitEntries(normalized, /,\s*/);
	}

	return uniqueEntries(entries.map(normalizeKeyValueEntry));
}

function splitNearbyElements(value: string): string[] {
	return splitEntries(value, /[\n;,]+/);
}

function splitComputedStyles(value: string): string[] {
	const normalized = value.replace(/[{}]/g, ' ');
	return uniqueEntries(normalized.split(/[\n;]+/).map((entry) => normalizeKeyValueEntry(entry)));
}

function formatListSection(label: string, entries: string[]): string[] {
	if (entries.length === 0) {
		return [];
	}

	if (entries.length === 1) {
		return [`**${label}:** ${entries[0]}`];
	}

	return [`**${label} (${entries.length}):**`, ...entries.map((entry) => `- ${entry}`)];
}

function formatFullPathSection(fullPath: string): string[] {
	const normalizedPath = normalizeWhitespace(fullPath);
	if (!normalizedPath) {
		return [];
	}

	const segments = fullPath.includes('>')
		? fullPath
				.split(/\s*>\s*/)
				.map(normalizeWhitespace)
				.filter(Boolean)
		: [];

	if (segments.length <= 1) {
		return [`**Full path:** ${normalizedPath}`];
	}

	return [
		`**Full path:** ${segments.join(' > ')}`,
		`**Path depth:** ${segments.length}`,
		`**Immediate parent:** ${segments.at(-2)}`,
		`**Target node:** ${segments.at(-1)}`
	];
}

function formatFeedbackHeader(pathname: string, detail: OutputDetail): string {
	let header = `## Page Feedback: ${pathname}\n`;
	if (detail === 'forensic') {
		header += `\n**Environment:**\n`;
		header += `- Viewport: ${viewportSummary()}\n`;
		const href = browserLocationHref();
		if (href) {
			header += `- URL: ${href}\n`;
		}
		if (typeof navigator !== 'undefined') {
			header += `- User Agent: ${navigator.userAgent}\n`;
		}
		if (typeof window !== 'undefined') {
			header += `- Timestamp: ${new Date().toISOString()}\n`;
			header += `- Device Pixel Ratio: ${window.devicePixelRatio}\n`;
		}
		header += `\n`;
		return header;
	}

	if (detail !== 'compact') {
		header += `**Viewport:** ${viewportSummary()}\n`;
	}

	header += `\n`;
	return header;
}

export function generateFeedbackOutput(
	annotations: Annotation[],
	pathname: string,
	detail: OutputDetail
): string {
	if (annotations.length === 0) {
		return '';
	}

	if (detail === 'compact') {
		return (
			formatFeedbackHeader(pathname, detail) +
			annotations
				.map((annotation, index) => {
					const selectedText = annotation.selectedText
						? ` (re: "${annotation.selectedText.slice(0, 30)}${annotation.selectedText.length > 30 ? '...' : ''}")`
						: '';
					const sourceFile = annotation.sourceFile ? ` (${annotation.sourceFile})` : '';
					return `${index + 1}. ${annotation.element}${sourceFile}: ${annotation.comment}${selectedText}`;
				})
				.join('\n')
		);
	}

	const sections = annotations.map((annotation, index) => {
		const lines: string[] = [];
		lines.push(`### ${index + 1}. ${annotation.element}`);
		lines.push(`**Location:** ${annotation.elementPath}`);

		if (annotation.sourceFile) lines.push(`**Source:** ${annotation.sourceFile}`);
		if (annotation.svelteComponent) lines.push(`**Svelte:** ${annotation.svelteComponent}`);
		if (annotation.svelteComponents && annotation.svelteComponents !== annotation.svelteComponent) {
			lines.push(`**Svelte components:** ${annotation.svelteComponents}`);
		}
		if (annotation.reactComponents) lines.push(`**React:** ${annotation.reactComponents}`);
		if (annotation.dryuiComponent) lines.push(`**DryUI:** ${annotation.dryuiComponent}`);

		if (detail === 'detailed' || detail === 'forensic') {
			if (annotation.cssClasses) lines.push(`**Classes:** ${annotation.cssClasses}`);
			if (annotation.boundingBox)
				lines.push(`**Bounding box:** ${formatRect(annotation.boundingBox)}`);
			if (annotation.selectedText) lines.push(`**Selected text:** ${annotation.selectedText}`);
			if (annotation.nearbyText && !annotation.selectedText) {
				lines.push(`**Context:** ${annotation.nearbyText.slice(0, 140)}`);
			}
			if (annotation.isMultiSelect) lines.push(`**Selection:** Multi-select`);
			if (annotation.elementBoundingBoxes?.length) {
				lines.push(`**Selection targets:** ${annotation.elementBoundingBoxes.length} elements`);
			}
		}

		if (detail === 'forensic') {
			if (annotation.accessibility) {
				lines.push(
					...formatListSection('Accessibility', splitAccessibilityEntries(annotation.accessibility))
				);
			}
			if (annotation.nearbyElements) {
				lines.push(
					...formatListSection('Nearby elements', splitNearbyElements(annotation.nearbyElements))
				);
			}
			if (annotation.nearbyText) lines.push(`**Nearby text:** ${annotation.nearbyText}`);
			if (annotation.computedStyles) {
				lines.push(
					...formatListSection('Computed styles', splitComputedStyles(annotation.computedStyles))
				);
			}
			if (annotation.fullPath) {
				lines.push(...formatFullPathSection(annotation.fullPath));
			}
			lines.push(
				`**Annotation at:** ${annotation.x.toFixed(1)}% from left, ${Math.round(annotation.y)}px from top`
			);
			if (annotation.thread?.length) {
				lines.push(`**Thread messages:** ${annotation.thread.length}`);
			}
			if (annotation.status) lines.push(`**Status:** ${annotation.status}`);
			if (annotation.resolvedBy) lines.push(`**Resolved by:** ${annotation.resolvedBy}`);
			if (annotation.resolvedAt) lines.push(`**Resolved at:** ${annotation.resolvedAt}`);
			if (annotation.resolutionNote)
				lines.push(`**Resolution note:** ${annotation.resolutionNote}`);
			if (annotation.intent) lines.push(`**Intent:** ${annotation.intent}`);
			if (annotation.severity) lines.push(`**Severity:** ${annotation.severity}`);
		}

		lines.push(`**Feedback:** ${annotation.comment}`);
		return lines.join('\n');
	});

	return formatFeedbackHeader(pathname, detail) + sections.join('\n\n---\n\n');
}

function getViewportSize(): { width: number; height: number } {
	if (typeof window === 'undefined') {
		return { width: 0, height: 0 };
	}

	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

export function generateDesignOutput(
	placements: DesignPlacement[],
	detail: OutputDetail,
	options: Pick<GenerateOutputOptions, 'blankCanvas' | 'wireframePurpose'> = {}
): string {
	return generateLayoutDesignOutput(placements, getViewportSize(), options, detail);
}

export function generateRearrangeOutput(state: RearrangeState, detail: OutputDetail): string {
	return generateLayoutRearrangeOutput(state, detail, getViewportSize());
}

export function generateOutput(
	annotations: Annotation[],
	pathname: string,
	detail: OutputDetail,
	options: GenerateOutputOptions = {}
): string {
	const sections: string[] = [];

	if (annotations.length > 0) {
		sections.push(generateFeedbackOutput(annotations, pathname, detail));
	}

	const designOutput = generateDesignOutput(options.designPlacements ?? [], detail, {
		blankCanvas: options.blankCanvas,
		wireframePurpose: options.wireframePurpose
	});
	if (designOutput) {
		sections.push(designOutput);
	}

	if (options.rearrangeState) {
		const rearrangeOutput = generateRearrangeOutput(options.rearrangeState, detail);
		if (rearrangeOutput) {
			sections.push(rearrangeOutput);
		}
	}

	if (sections.length === 0) {
		return '';
	}

	return sections.join('\n\n');
}
