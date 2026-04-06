import type {
	CanvasWidth,
	CatalogEntry,
	ComponentAction,
	DesignPlacement,
	RearrangeState,
	ViewportSize
} from './types.js';
import { CANVAS_WIDTHS, COMPONENT_MAP } from './types.js';
import {
	analyzeLayoutPatterns,
	formatCSSPosition,
	formatPositionSummary,
	formatSpatialLines,
	getElementCSSContext,
	getPageLayout,
	getSpatialContext
} from './spatial.js';
import { getCatalog } from './catalog.js';

type OutputDetail = 'compact' | 'standard' | 'detailed' | 'forensic';
type Row = { y: number; items: DesignPlacement[] };
type RearrangeChange = {
	section: RearrangeState['sections'][number];
	moved: boolean;
	resized: boolean;
};

function definitionFor(type: DesignPlacement['type']) {
	return COMPONENT_MAP[type];
}

function formatSourceReference(type: DesignPlacement['type']): string {
	const definition = definitionFor(type);
	if (!definition) return type;

	if (definition.sourceKind === 'block') {
		return `${definition.sourceName} block${definition.routePath ? ` (\`${definition.routePath}\`)` : ''}`;
	}

	return `${definition.sourceName}${definition.sourceImport ? ` from \`${definition.sourceImport}\`` : ''}`;
}

function formatStructureReference(type: DesignPlacement['type']): string | null {
	return definitionFor(type)?.structure ?? null;
}

function formatGuidance(type: DesignPlacement['type']): string | null {
	return definitionFor(type)?.guidance ?? null;
}

function formatReferenceFrame(layout: {
	viewport: ViewportSize;
	contentArea: {
		selector: string;
		width: number;
		left: number;
		right: number;
		centerX: number;
	} | null;
}): string {
	let output = '### Reference Frame\n';
	output += `- Viewport: \`${layout.viewport.width}x${layout.viewport.height}px\`\n`;

	if (layout.contentArea) {
		const area = layout.contentArea;
		output += `- Content area: \`${area.width}px\` wide, left edge at \`x=${area.left}\`, right at \`x=${area.right}\` (\`${area.selector}\`)\n`;
		output += `- Pixel -> CSS translation:\n`;
		output += `  - Horizontal position in container: \`element.x - ${area.left}\`\n`;
		output += `  - Width as % of container: \`element.width / ${area.width} x 100\`\n`;
		output += `  - Centered: \`|element.centerX - ${Math.round(area.centerX)}| < 20px\`\n`;
	} else {
		output += `- No distinct content container - elements positioned relative to full viewport\n`;
		output += `- Pixel -> CSS translation:\n`;
		output += `  - Width as % of viewport: \`element.width / ${layout.viewport.width} x 100\`\n`;
	}

	return `${output}\n`;
}

function formatPlacementList(
	placements: readonly DesignPlacement[],
	detailLevel: OutputDetail,
	viewport: ViewportSize
): string {
	const layout = getPageLayout(viewport);
	let output = '### Components\n';

	placements.forEach((placement, index) => {
		const label = COMPONENT_MAP[placement.type]?.label ?? placement.type;
		const rect = {
			x: placement.x,
			y: placement.y,
			width: placement.width,
			height: placement.height
		};
		output += `${index + 1}. **${label}** - \`${Math.round(placement.width)}x${Math.round(placement.height)}px\` at \`(${Math.round(placement.x)}, ${Math.round(placement.y)})\`\n`;

		const context = getSpatialContext(rect);
		const lines = formatSpatialLines(context, {
			includeLeftRight: detailLevel === 'detailed' || detailLevel === 'forensic'
		});
		for (const line of lines) {
			output += `   - ${line}\n`;
		}

		const cssPosition = formatCSSPosition(rect, layout);
		if (cssPosition && !cssPosition.includes('Infinity') && !cssPosition.includes('NaN')) {
			output += `   - CSS: ${cssPosition}\n`;
		}

		output += `   - DryUI: ${formatSourceReference(placement.type)}\n`;

		const guidance = formatGuidance(placement.type);
		if (guidance) {
			output += `   - Guidance: ${guidance}\n`;
		}

		if (detailLevel === 'detailed' || detailLevel === 'forensic') {
			const structure = formatStructureReference(placement.type);
			if (structure) {
				output += `   - Structure: ${structure}\n`;
			}
		}
	});

	return output;
}

function labelFor(type: DesignPlacement['type']): string {
	return COMPONENT_MAP[type]?.label ?? type;
}

function groupRows(placements: readonly DesignPlacement[]): Row[] {
	const rows: Row[] = [];

	for (const placement of placements) {
		const row = rows.find((candidate) => Math.abs(candidate.y - placement.y) < 30);
		if (row) {
			row.items.push(placement);
			continue;
		}

		rows.push({ y: placement.y, items: [placement] });
	}

	rows.sort((a, b) => a.y - b.y);
	rows.forEach((row) => row.items.sort((a, b) => a.x - b.x));

	return rows;
}

function formatRowAnalysis(placements: readonly DesignPlacement[], viewport: ViewportSize): string {
	const rows = groupRows(placements);
	let output = '\n### Layout Analysis\n';

	rows.forEach((row, index) => {
		const labels = row.items.map((placement) => labelFor(placement.type));
		if (row.items.length === 1) {
			const placement = row.items[0];
			const isFullWidth = placement ? placement.width > viewport.width * 0.8 : false;
			output += `- Row ${index + 1} (y~${Math.round(row.y)}): ${labels[0]}${isFullWidth ? ' - full width' : ''}\n`;
			return;
		}

		output += `- Row ${index + 1} (y~${Math.round(row.y)}): ${labels.join(' | ')} - ${row.items.length} items side by side\n`;
	});

	return output;
}

function formatSpacingGaps(
	placements: readonly DesignPlacement[],
	detailLevel: OutputDetail
): string {
	if (placements.length < 2 || (detailLevel !== 'detailed' && detailLevel !== 'forensic')) {
		return '';
	}

	let output = '\n### Spacing & Gaps\n';

	for (let index = 0; index < placements.length - 1; index += 1) {
		const current = placements[index];
		const next = placements[index + 1];
		if (!current || !next) continue;

		const currentLabel = labelFor(current.type);
		const nextLabel = labelFor(next.type);
		const verticalGap = Math.round(next.y - (current.y + current.height));
		const horizontalGap = Math.round(next.x - (current.x + current.width));

		if (Math.abs(current.y - next.y) < 30) {
			output += `- ${currentLabel} -> ${nextLabel}: ${horizontalGap}px horizontal gap\n`;
		} else {
			output += `- ${currentLabel} -> ${nextLabel}: ${verticalGap}px vertical gap\n`;
		}
	}

	if (detailLevel !== 'forensic' || placements.length <= 2) {
		return output;
	}

	output += '\n### All Pairwise Gaps\n';
	for (let index = 0; index < placements.length; index += 1) {
		for (let nextIndex = index + 1; nextIndex < placements.length; nextIndex += 1) {
			const current = placements[index];
			const next = placements[nextIndex];
			if (!current || !next) continue;

			const currentLabel = labelFor(current.type);
			const nextLabel = labelFor(next.type);
			const verticalGap = Math.round(next.y - (current.y + current.height));
			const horizontalGap = Math.round(next.x - (current.x + current.width));
			output += `- ${currentLabel} <-> ${nextLabel}: h=${horizontalGap}px v=${verticalGap}px\n`;
		}
	}

	output += '\n### Z-Order (placement order)\n';
	placements.forEach((placement, index) => {
		output += `${index}. ${labelFor(placement.type)} at (${Math.round(placement.x)}, ${Math.round(placement.y)})\n`;
	});

	return output;
}

function formatSuggestedImplementation(placements: readonly DesignPlacement[]): string {
	let output = '\n### Suggested Implementation\n';

	const counts = new Map<DesignPlacement['type'], number>();
	for (const placement of placements) {
		counts.set(placement.type, (counts.get(placement.type) ?? 0) + 1);
	}

	const emitted = new Set<DesignPlacement['type']>();
	for (const placement of placements) {
		if (emitted.has(placement.type)) continue;
		emitted.add(placement.type);

		const definition = definitionFor(placement.type);
		if (!definition) continue;

		const count = counts.get(placement.type) ?? 1;
		output += `- ${definition.label}${count > 1 ? ` x${count}` : ''}: ${definition.guidance}\n`;

		if (definition.structure) {
			output += `  - Structure: ${definition.structure}\n`;
		}

		if (definition.sourceKind === 'block' && definition.routePath) {
			output += `  - Catalog: \`${definition.routePath}\`\n`;
		} else if (definition.sourceImport) {
			output += `  - Import: \`${definition.sourceImport}\`\n`;
		}

		if (
			count > 1 &&
			['card', 'productCard', 'testimonial', 'feature', 'pricing'].includes(placement.type)
		) {
			output +=
				'  - Layout: use `Grid` or `Stack` to manage repeated items instead of manual absolute positioning.\n';
		}
	}

	for (const placement of placements) {
		if (!placement.note) continue;
		output += `- Note: ${labelFor(placement.type)} - ${placement.note}\n`;
	}

	return output;
}

function formatLayoutPrimitiveSuggestions(placements: readonly DesignPlacement[]): string {
	let output = '\n### DryUI Layout Primitives\n';
	const cards = placements.filter(
		(placement) => placement.type === 'card' || placement.type === 'productCard'
	);
	const sidebar = placements.find((placement) => placement.type === 'sidebar');

	if (sidebar) {
		output += `- Use \`<Sidebar>\` or \`<Grid>\` for the rail-plus-content split. Equivalent CSS: \`grid-template-columns: ${Math.round(sidebar.width)}px 1fr;\`\n`;
	}

	if (cards.length > 1 && cards[0]) {
		output += `- Use \`<Grid>\` for repeated card tiles instead of manual card coordinates. Equivalent CSS: \`grid-template-columns: repeat(${cards.length}, ${Math.round(cards[0].width)}px); gap: 16px;\`\n`;
	}

	if (placements.some((placement) => placement.type === 'navigation')) {
		output +=
			'- Use a sticky `<nav>` for top-of-page chrome. Equivalent CSS: `position: sticky; top: 0; z-index: 50;`\n';
	}

	return output === '\n### DryUI Layout Primitives\n' ? '' : output;
}

function formatParentContext(selector: string): string | null {
	const context = getElementCSSContext(selector);
	if (!context) return null;

	let description = `\`${context.parentDisplay}\``;
	if (context.flexDirection) description += `, flex-direction: \`${context.flexDirection}\``;
	if (context.gridCols) description += `, grid-template-columns: \`${context.gridCols}\``;
	if (context.gap) description += `, gap: \`${context.gap}\``;

	return `Parent: ${description} (\`${context.parentSelector}\`)`;
}

function formatParentDryUIHint(selector: string): string | null {
	const context = getElementCSSContext(selector);
	if (!context) return null;

	if (context.parentDisplay === 'grid') {
		return 'DryUI: prefer `Grid` so the section order is expressed in layout, not raw offsets.';
	}

	if (context.parentDisplay === 'flex' && context.flexDirection === 'column') {
		return 'DryUI: prefer `Stack` for vertical section ordering and spacing instead of manual y-offset changes.';
	}

	if (context.parentDisplay === 'flex') {
		return 'DryUI: prefer `Flex` for row alignment before reaching for manual x/y adjustments.';
	}

	return 'DryUI: consider `Container`, `Stack`, or a catalog block wrapper before hard-coding the section position.';
}

function getRearrangeChanges(state: RearrangeState, detailLevel: OutputDetail): RearrangeChange[] {
	const changes: RearrangeChange[] = [];

	for (const section of state.sections) {
		const moved =
			Math.abs(section.originalRect.x - section.currentRect.x) > 1 ||
			Math.abs(section.originalRect.y - section.currentRect.y) > 1;
		const resized =
			Math.abs(section.originalRect.width - section.currentRect.width) > 1 ||
			Math.abs(section.originalRect.height - section.currentRect.height) > 1;

		if (!moved && !resized && detailLevel !== 'forensic') {
			continue;
		}

		changes.push({ section, moved, resized });
	}

	return changes;
}

export function generateDesignOutput(
	placements: readonly DesignPlacement[],
	viewport: ViewportSize,
	options?: { blankCanvas?: boolean; wireframePurpose?: string },
	detailLevel: OutputDetail = 'standard'
): string {
	if (placements.length === 0 && !options?.wireframePurpose) return '';

	const sorted = [...placements].sort((a, b) => (Math.abs(a.y - b.y) < 20 ? a.x - b.x : a.y - b.y));
	let output = '';
	if (options?.blankCanvas) {
		output += '## Wireframe: New Page\n\n';
		if (options.wireframePurpose) {
			output += `> **Purpose:** ${options.wireframePurpose}\n>\n`;
		}
		output += `> ${placements.length} component${placements.length === 1 ? '' : 's'} placed - this is a standalone wireframe, not related to the current page.\n>\n> This wireframe is a rough sketch for exploring ideas.\n\n`;
	} else {
		output += `## Design Layout\n\n> ${placements.length} component${placements.length === 1 ? '' : 's'} placed\n\n`;
	}

	if (detailLevel === 'compact') {
		output += '### Components\n';
		sorted.forEach((placement, index) => {
			const label = labelFor(placement.type);
			output += `${index + 1}. **${label}** - \`${Math.round(placement.width)}x${Math.round(placement.height)}px\` at \`(${Math.round(placement.x)}, ${Math.round(placement.y)})\`\n`;
		});
		return output.trim();
	}

	if (placements.length === 0) {
		return output.trim();
	}

	output += formatReferenceFrame(getPageLayout(viewport));
	output += formatPlacementList(sorted, detailLevel, viewport);
	output += formatRowAnalysis(sorted, viewport);
	output += formatSpacingGaps(sorted, detailLevel);
	output += formatSuggestedImplementation(sorted);
	if (detailLevel === 'detailed' || detailLevel === 'forensic') {
		output += formatLayoutPrimitiveSuggestions(sorted);
	}

	return output.trim();
}

export function generateRearrangeOutput(
	state: RearrangeState,
	detailLevel: OutputDetail = 'standard',
	viewport?: ViewportSize
): string {
	const changes = getRearrangeChanges(state, detailLevel);
	if (changes.length === 0) return '';

	const effectiveViewport =
		viewport ??
		(typeof window === 'undefined'
			? { width: 0, height: 0 }
			: { width: window.innerWidth, height: window.innerHeight });

	let output = '## Suggested Layout Changes\n\n';

	if (detailLevel !== 'compact') {
		output += formatReferenceFrame(getPageLayout(effectiveViewport));
	}

	if (detailLevel === 'forensic') {
		output += `> Detected at: \`${new Date(state.detectedAt).toISOString()}\`\n`;
		output += `> Total sections: ${state.sections.length}\n\n`;
	}

	output += '**Changes:**\n';

	for (const { section, moved, resized } of changes) {
		const original = section.originalRect;
		const current = section.currentRect;

		if (!moved && !resized) {
			output += `- ${section.label} - unchanged at (${Math.round(current.x)}, ${Math.round(current.y)}) ${Math.round(current.width)}x${Math.round(current.height)}px\n`;
			continue;
		}

		if (detailLevel === 'compact') {
			if (moved && resized) {
				output += `- Suggested: move and resize **${section.label}** to (${Math.round(current.x)}, ${Math.round(current.y)}) ${Math.round(current.width)}x${Math.round(current.height)}px\n`;
			} else if (moved) {
				output += `- Suggested: move **${section.label}** to (${Math.round(current.x)}, ${Math.round(current.y)})\n`;
			} else {
				output += `- Suggested: resize **${section.label}** to ${Math.round(current.width)}x${Math.round(current.height)}px\n`;
			}
			continue;
		}

		if (moved && resized) {
			output += `- Suggested: move and resize **${section.label}**\n`;
		} else if (moved) {
			output += `- Suggested: move **${section.label}**\n`;
		} else {
			output += `- Suggested: resize **${section.label}** from ${Math.round(original.width)}x${Math.round(original.height)}px to ${Math.round(current.width)}x${Math.round(current.height)}px\n`;
		}

		output += `  - Current: ${formatPositionSummary(original)}\n`;
		output += `  - Suggested: ${formatPositionSummary(current)}\n`;

		const currentContext = getSpatialContext(current, effectiveViewport);
		const contextLines = formatSpatialLines(currentContext, {
			includeLeftRight: detailLevel === 'detailed' || detailLevel === 'forensic'
		});
		if (contextLines.length > 0) {
			output += `  - Spatial: ${contextLines[0]}\n`;
			for (let index = 1; index < contextLines.length; index += 1) {
				output += `    ${contextLines[index]}\n`;
			}
		}

		const cssPosition = formatCSSPosition(current, getPageLayout(effectiveViewport));
		if (cssPosition) {
			output += `  - CSS: ${cssPosition}\n`;
		}

		const parentContext = formatParentContext(section.selector);
		if (parentContext) {
			output += `  - ${parentContext}\n`;
		}
		const dryuiHint = formatParentDryUIHint(section.selector);
		if (dryuiHint) {
			output += `  - ${dryuiHint}\n`;
		}

		output += `  - Selector: \`${section.selector}\`\n`;
		if (section.note) output += `  - Note: ${section.note}\n`;

		if (detailLevel === 'detailed' || detailLevel === 'forensic') {
			const identifier = section.className
				? `${section.tagName}.${section.className.split(' ')[0]}`
				: section.tagName;
			if (identifier !== section.selector) {
				output += `  - Element: \`${identifier}\`\n`;
			}
			if (section.role) output += `  - Role: \`${section.role}\`\n`;
			if (detailLevel === 'forensic' && section.textSnippet) {
				output += `  - Text: "${section.textSnippet}"\n`;
			}
		}

		if (detailLevel === 'forensic') {
			output += `  - Original rect: \`{ x: ${Math.round(original.x)}, y: ${Math.round(original.y)}, w: ${Math.round(original.width)}, h: ${Math.round(original.height)} }\`\n`;
			output += `  - Current rect: \`{ x: ${Math.round(current.x)}, y: ${Math.round(current.y)}, w: ${Math.round(current.width)}, h: ${Math.round(current.height)} }\`\n`;
		}
	}

	if (detailLevel !== 'compact') {
		const patterns = analyzeLayoutPatterns(
			changes
				.filter((change) => change.moved || change.resized)
				.map((change) => change.section.currentRect)
		);
		if (patterns.length > 0) {
			output += '\n### Layout Summary\n';
			for (const pattern of patterns) {
				output += `- ${pattern}\n`;
			}
		}
	}

	if (detailLevel !== 'compact' && state.sections.length > 1) {
		output += '\n### All Sections (current positions)\n';
		const sortedSections = [...state.sections].sort((a, b) =>
			Math.abs(a.currentRect.y - b.currentRect.y) < 20
				? a.currentRect.x - b.currentRect.x
				: a.currentRect.y - b.currentRect.y
		);

		for (const section of sortedSections) {
			const changed =
				Math.abs(section.currentRect.x - section.originalRect.x) > 1 ||
				Math.abs(section.currentRect.y - section.originalRect.y) > 1 ||
				Math.abs(section.currentRect.width - section.originalRect.width) > 1 ||
				Math.abs(section.currentRect.height - section.originalRect.height) > 1;
			output += `- ${section.label}: \`${Math.round(section.currentRect.width)}x${Math.round(section.currentRect.height)}px\` at \`(${Math.round(section.currentRect.x)}, ${Math.round(section.currentRect.y)})\`${changed ? ' <- suggested' : ''}\n`;
		}
	}

	return output.trim();
}

// ─── Sketch Brief (new layout mode output) ──────────────────────────────────

export interface SketchBriefOptions {
	placements: DesignPlacement[];
	route: string;
	canvasWidth: CanvasWidth;
	recipeName?: string;
}

export interface EditAnnotation {
	selector: string;
	note: string;
}

export interface EditBriefOptions {
	actions: ComponentAction[];
	annotations: EditAnnotation[];
	currentUrl: string;
	canvasWidth: CanvasWidth;
}

const CANVAS_LABELS = Object.fromEntries(CANVAS_WIDTHS.map((w) => [w.value, w.label])) as Record<
	CanvasWidth,
	string
>;

function canvasLabel(width: CanvasWidth): string {
	return CANVAS_LABELS[width];
}

function describeWidth(placementWidth: number, canvasWidth: number): string {
	const ratio = placementWidth / canvasWidth;
	if (ratio > 0.9) return 'full width';
	if (ratio >= 0.45 && ratio <= 0.55) return '~half width';
	if (ratio >= 0.3 && ratio <= 0.37) return '~third width';
	return `~${Math.round(ratio * 100)}% width`;
}

function sketchGroupRows(placements: DesignPlacement[]): Row[] {
	const rows: Row[] = [];
	for (const placement of placements) {
		const existing = rows.find((row) => Math.abs(row.y - placement.y) <= 40);
		if (existing) {
			existing.items.push(placement);
		} else {
			rows.push({ y: placement.y, items: [placement] });
		}
	}
	rows.sort((a, b) => a.y - b.y);
	for (const row of rows) row.items.sort((a, b) => a.x - b.x);
	return rows;
}

function findCatalogEntry(
	catalog: CatalogEntry[],
	componentType: string
): CatalogEntry | undefined {
	const lower = componentType.toLowerCase();
	return catalog.find(
		(e) => e.name.toLowerCase() === lower || e.tags.some((t) => t.toLowerCase() === lower)
	);
}

function formatLayoutSketch(
	placements: DesignPlacement[],
	canvasWidth: CanvasWidth,
	catalog: CatalogEntry[]
): string {
	if (placements.length === 0) return '';
	const rows = sketchGroupRows(placements);
	let out = '### Layout sketch\n\n';
	for (const row of rows) {
		if (row.items.length === 1) {
			const p = row.items[0];
			if (!p) continue;
			const widthDesc = describeWidth(p.width, canvasWidth);
			const posDesc = row.y === 0 || row.y < 80 ? 'top' : '';
			const spatial = posDesc ? `${widthDesc}, ${posDesc}` : widthDesc;
			out += `- **${p.type}** — ${spatial}\n`;
			const entry = findCatalogEntry(catalog, p.type);
			if (entry) {
				out += `  - import: \`${entry.importPath}\`\n`;
				if (entry.structure) out += `  - structure: \`${entry.structure.split('\n')[0]}\`\n`;
			}
			if (p.text) out += `  - text: "${p.text}"\n`;
			if (p.note) out += `  - note: ${p.note}\n`;
		} else {
			out += `- Row (${row.items.length} items, in a row):\n`;
			for (const p of row.items) {
				const widthDesc = describeWidth(p.width, canvasWidth);
				out += `  - **${p.type}** — ${widthDesc}, in a row\n`;
				const entry = findCatalogEntry(catalog, p.type);
				if (entry) {
					out += `    - import: \`${entry.importPath}\`\n`;
					if (entry.structure) out += `    - structure: \`${entry.structure.split('\n')[0]}\`\n`;
				}
				if (p.text) out += `    - text: "${p.text}"\n`;
				if (p.note) out += `    - note: ${p.note}\n`;
			}
		}
	}
	return out;
}

function formatCompositionHints(placements: DesignPlacement[]): string {
	const rows = sketchGroupRows(placements);
	const hints: string[] = [];
	for (const row of rows) {
		if (row.items.length < 3) continue;
		const typeCounts = new Map<string, number>();
		for (const item of row.items) typeCounts.set(item.type, (typeCounts.get(item.type) ?? 0) + 1);
		for (const [type, count] of typeCounts) {
			if (count >= 3) hints.push(`${count}× **${type}** in a row — wrap with \`<Grid>\``);
		}
	}
	if (hints.length === 0) return '';
	let out = '### Composition hints\n\n';
	for (const hint of hints) out += `- ${hint}\n`;
	return out;
}

const LAYOUT_PRIMITIVES_FOOTER = `### DryUI layout primitives

- \`<Stack>\` — vertical flex column with consistent gap
- \`<Flex>\` — horizontal flex row with alignment control
- \`<Grid>\` — responsive grid for repeated items or two-column layouts
- \`<Container>\` — centered max-width content wrapper
`;

function routeFilePath(route: string): string {
	const clean = route.replace(/^\//, '').replace(/\/$/, '');
	return clean ? `src/routes/${clean}/+page.svelte` : `src/routes/+page.svelte`;
}

export function generateSketchBrief(options: SketchBriefOptions): string {
	const { placements, route, canvasWidth, recipeName } = options;
	const catalog = getCatalog();
	const label = canvasLabel(canvasWidth);
	let out = `## New page: ${route}\n\n**Designed at:** ${canvasWidth}px (${label})\n`;
	if (recipeName) out += `**Recipe base:** ${recipeName}\n`;
	out += `**Route file:** \`${routeFilePath(route)}\`\n\n`;
	out += formatLayoutSketch(placements, canvasWidth, catalog);
	const hints = formatCompositionHints(placements);
	if (hints) out += '\n' + hints;
	out += '\n' + LAYOUT_PRIMITIVES_FOOTER;
	return out.trim();
}

export function generateEditBrief(options: EditBriefOptions): string {
	const { actions, annotations, currentUrl, canvasWidth } = options;
	const catalog = getCatalog();
	const label = canvasLabel(canvasWidth);
	let path = currentUrl;
	try {
		path = new URL(currentUrl).pathname;
	} catch {}
	let out = `## Feedback: Page modifications at ${path}\n\n**Viewport:** ${canvasWidth}px (${label})\n\n`;
	if (actions.length > 0) {
		out += '### Component Actions\n\n';
		for (const action of actions) {
			if (action.kind === 'swap') {
				out += `- **swap** \`${action.targetSelector}\`: ${action.fromComponent} → ${action.toComponent}\n`;
				out += `  - reason: ${action.reason}\n`;
				const entry = findCatalogEntry(catalog, action.toComponent);
				if (entry) out += `  - import: \`${entry.importPath}\`\n`;
			} else if (action.kind === 'delete') {
				out += `- **delete** \`${action.targetSelector}\`: remove ${action.component}\n`;
			} else if (action.kind === 'refine') {
				out += `- **refine** \`${action.targetSelector}\` (${action.component}): ${action.comment}\n`;
			}
		}
		out += '\n';
	}
	if (annotations.length > 0) {
		out += '### Annotations\n\n';
		for (const annotation of annotations)
			out += `- \`${annotation.selector}\`: ${annotation.note}\n`;
	}
	return out.trim();
}
