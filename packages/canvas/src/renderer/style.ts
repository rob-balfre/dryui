import type { LayoutDocument, LayoutNode, PropValue } from '../ast/types.js';

const SPACING_SCALE: Record<string, string> = {
	none: '0',
	xs: 'var(--dry-space-2)',
	sm: 'var(--dry-space-3)',
	md: 'var(--dry-space-4)',
	lg: 'var(--dry-space-6)',
	xl: 'var(--dry-space-8)'
};

function resolveSpacing(value: string | undefined): string | undefined {
	if (!value) {
		return value;
	}

	return SPACING_SCALE[value] ?? value;
}

function declaration(name: string, value: string | number | undefined): string | null {
	if (value === undefined || value === '') {
		return null;
	}

	return `${name}: ${value}`;
}

function serializeCssVars(vars: Record<string, string>): string[] {
	return Object.entries(vars)
		.filter(([, value]) => value !== '')
		.map(([name, value]) => `${name}: ${value}`);
}

function normalizePropValue(value: PropValue): PropValue {
	if (typeof value === 'string') {
		return SPACING_SCALE[value] ?? value;
	}

	if (Array.isArray(value)) {
		return value.map((entry) => normalizePropValue(entry));
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, nestedValue]) => [key, normalizePropValue(nestedValue)])
		);
	}

	return value;
}

export function buildNodeWrapperStyle(node: LayoutNode): string {
	const declarations = [
		declaration('width', node.style.width),
		declaration('height', node.style.height),
		declaration('min-width', node.style.minWidth),
		declaration('min-height', node.style.minHeight),
		declaration('max-width', node.style.maxWidth),
		declaration('max-height', node.style.maxHeight),
		declaration('padding', resolveSpacing(node.style.padding)),
		declaration('margin', resolveSpacing(node.style.margin)),
		declaration('flex-grow', node.style.grow),
		declaration('display', node.component === '__text__' ? 'inline-flex' : undefined),
		...serializeCssVars(node.cssVarOverrides)
	];

	return declarations.filter(Boolean).join('; ');
}

export function buildCanvasThemeStyle(document: LayoutDocument): string {
	return [
		declaration('background', document.canvas.background),
		...serializeCssVars(document.theme.vars)
	]
		.filter(Boolean)
		.join('; ');
}

export function buildComponentProps(node: LayoutNode): Record<string, unknown> {
	const props = Object.fromEntries(
		Object.entries(node.props).map(([key, value]) => [key, normalizePropValue(value)])
	) as Record<string, unknown>;

	switch (node.component) {
		case 'Stack':
			props.gap ??= resolveSpacing(typeof node.style.gap === 'string' ? node.style.gap : undefined);
			break;
		case 'Flex':
			props.gap ??= resolveSpacing(typeof node.style.gap === 'string' ? node.style.gap : undefined);
			props.align ??= node.style.align;
			props.justify ??= node.style.justify;
			break;
		case 'Grid':
			props.gap ??= resolveSpacing(typeof node.style.gap === 'string' ? node.style.gap : undefined);
			props.columns ??= node.style.columns;
			break;
	}

	return props;
}
