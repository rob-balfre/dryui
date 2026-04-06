// Shared formatting functions for spec data.
// Used by both @dryui/mcp and @dryui/cli.

import type {
	ComponentDef,
	DataAttributeDef,
	ForwardedPropsDef,
	PartDef,
	PropDef,
	Spec
} from './spec-types.js';

export const DIR_OVERRIDES: Readonly<Record<string, string>> = {
	QRCode: 'qr-code'
};

export function componentDir(name: string): string {
	return DIR_OVERRIDES[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function pad(str: string, width: number): string {
	return str.length >= width ? str : str + ' '.repeat(width - str.length);
}

export function indent(text: string, spaces: number): string {
	const prefix = ' '.repeat(spaces);
	return text
		.split('\n')
		.map((line) => prefix + line)
		.join('\n');
}

export function getSubpathImport(name: string, def: ComponentDef): string | null {
	if (def.import !== '@dryui/ui') return null;
	return `import { ${name} } from '${def.import}/${componentDir(name)}'`;
}

export function findComponent(
	query: string,
	components: Record<string, ComponentDef>
): { name: string; def: ComponentDef } | null {
	const exact = components[query];
	if (exact) return { name: query, def: exact };
	const lower = query.toLowerCase();
	for (const [name, def] of Object.entries(components)) {
		if (name.toLowerCase() === lower) return { name, def };
	}
	return null;
}

export function formatProp(propName: string, propDef: PropDef, width: number): string {
	const flags: string[] = [propDef.type];
	if (propDef.description) flags.push(`description: ${propDef.description}`);
	if (propDef.acceptedValues?.length) flags.push(`accepted: ${propDef.acceptedValues.join(', ')}`);
	if (propDef.default !== undefined) flags.push(`default: ${propDef.default}`);
	if (propDef.required) flags.push('required');
	if (propDef.bindable) flags.push('bindable');
	if (propDef.note) flags.push(`note: ${propDef.note}`);
	return `  ${pad(propName, width + 2)}${flags.join(' | ')}`;
}

export function formatCssVars(cssVars: Record<string, string>): string[] {
	const entries = Object.entries(cssVars);
	if (entries.length === 0) return ['  none'];
	const maxLen = Math.max(...entries.map(([name]) => name.length));
	return entries.map(([name, description]) => `  ${pad(name, maxLen + 2)}${description}`);
}

export function formatDataAttributes(dataAttributes: DataAttributeDef[]): string[] {
	if (dataAttributes.length === 0) return ['  none'];
	const width = Math.max(...dataAttributes.map((attr) => attr.name.length));
	return dataAttributes.map((attr) => {
		const meta = [
			attr.description,
			attr.values?.length ? `values: ${attr.values.join(', ')}` : null
		]
			.filter(Boolean)
			.join(' | ');
		return meta ? `  ${pad(attr.name, width + 2)}${meta}` : `  ${attr.name}`;
	});
}

export function formatA11yNotes(notes?: string[]): string[] {
	if (!notes?.length) return ['  none'];
	return notes.map((note) => `  - ${note}`);
}

export function formatForwardedProps(forwardedProps?: ForwardedPropsDef | null): string[] {
	if (!forwardedProps) return ['  none'];

	const lines = [`  ${forwardedProps.note}`];
	if (forwardedProps.examples?.length) {
		lines.push(`  examples: ${forwardedProps.examples.join(', ')}`);
	}
	if (forwardedProps.omitted?.length) {
		lines.push(`  omits: ${forwardedProps.omitted.join(', ')}`);
	}
	return lines;
}

export function formatPart(name: string, partName: string, partDef: PartDef): string[] {
	const lines: string[] = [`  ${name}.${partName}`];
	const props = Object.entries(partDef.props ?? {});
	if (props.length === 0) {
		lines.push('    Props: none');
	} else {
		const maxLen = Math.max(...props.map(([propName]) => propName.length));
		for (const [propName, propDef] of props) {
			lines.push(`  ${formatProp(propName, propDef, maxLen).trimStart()}`);
		}
	}

	if (partDef.forwardedProps) {
		lines.push('    Native props:');
		for (const detail of formatForwardedProps(partDef.forwardedProps)) {
			lines.push(`  ${detail.trimStart()}`);
		}
	}

	return lines;
}

export function formatStructure(name: string, def: ComponentDef): string[] {
	if (!def.structure?.tree.length) {
		return ['  none'];
	}

	const lines = def.structure.tree.map((node) => `  ${node}`);
	if (def.structure.note) {
		lines.push(`  note: ${def.structure.note}`);
	}
	return lines;
}

export function formatCompound(name: string, def: ComponentDef): string {
	const lines: string[] = [];
	lines.push(`${name} — ${def.description}`);
	lines.push(`Category: ${def.category} | Tags: ${def.tags.join(', ')}`);
	lines.push(`Root import: import { ${name} } from '${def.import}'`);
	const subpath = getSubpathImport(name, def);
	if (subpath) lines.push(`Subpath import: ${subpath}`);
	const hasRoot = Boolean(def.parts?.Root);
	lines.push(
		hasRoot
			? `Compound: yes (use ${name}.Root, not ${name})`
			: `Namespace: yes (parts are used directly; no ${name}.Root wrapper)`
	);
	if (hasRoot) {
		lines.push('');
		lines.push('Required structure:');
		lines.push(...formatStructure(name, def));
	} else if (def.structure?.note) {
		lines.push('');
		lines.push(`Note: ${def.structure.note}`);
	}
	if (def.parts) {
		lines.push('');
		lines.push('Parts:');
		for (const [partName, partDef] of Object.entries(def.parts)) {
			lines.push(...formatPart(name, partName, partDef));
		}
	}
	lines.push('');
	lines.push('CSS Variables:');
	lines.push(...formatCssVars(def.cssVars));
	lines.push('');
	lines.push('Data Attributes:');
	lines.push(...formatDataAttributes(def.dataAttributes));
	lines.push('');
	lines.push('Accessibility:');
	lines.push(...formatA11yNotes(def.a11y));
	if (def.example) {
		lines.push('');
		lines.push('Example:');
		lines.push(indent(def.example, 2));
	}
	return lines.join('\n');
}

export function formatSimple(name: string, def: ComponentDef): string {
	const lines: string[] = [];
	lines.push(`${name} — ${def.description}`);
	lines.push(`Category: ${def.category} | Tags: ${def.tags.join(', ')}`);
	lines.push(`Root import: import { ${name} } from '${def.import}'`);
	const subpath = getSubpathImport(name, def);
	if (subpath) lines.push(`Subpath import: ${subpath}`);
	lines.push('');
	lines.push('Props:');
	if (def.props && Object.keys(def.props).length > 0) {
		const propEntries = Object.entries(def.props);
		const maxLen = Math.max(...propEntries.map(([p]) => p.length));
		for (const [propName, propDef] of propEntries) {
			lines.push(formatProp(propName, propDef, maxLen));
		}
	} else {
		lines.push('  none');
	}
	lines.push('');
	lines.push('Native props:');
	lines.push(...formatForwardedProps(def.forwardedProps));
	lines.push('');
	lines.push('CSS Variables:');
	lines.push(...formatCssVars(def.cssVars));
	lines.push('');
	lines.push('Data Attributes:');
	lines.push(...formatDataAttributes(def.dataAttributes));
	lines.push('');
	lines.push('Accessibility:');
	lines.push(...formatA11yNotes(def.a11y));
	if (def.example) {
		lines.push('');
		lines.push('Example:');
		lines.push(indent(def.example, 2));
	}
	return lines.join('\n');
}

