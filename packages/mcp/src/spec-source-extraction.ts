import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export type PropShape = {
	type: string;
	default?: string;
	required?: boolean;
	bindable?: boolean;
	acceptedValues?: string[];
	description?: string;
	note?: string;
};

export type DataAttributeShape = {
	name: string;
	description?: string;
	values?: string[];
};

export type ForwardedPropsShape = {
	baseType: string;
	via: 'rest';
	element?: string;
	examples?: string[];
	omitted?: string[];
	note: string;
};

export type PartShape = {
	props: Record<string, PropShape>;
	forwardedProps?: ForwardedPropsShape | null;
};

export interface PropMetadataResolver {
	descriptionForProp(
		componentName: string,
		propName: string,
		partName?: string
	): string | undefined;
	noteForProp(componentName: string, propName: string, partName?: string): string | undefined;
}

const BINDABLE_MAP: Record<string, string[]> = {
	'input/input.svelte': ['value'],
	'textarea/textarea.svelte': ['value'],
	'number-input/number-input.svelte': ['value'],
	'slider/slider.svelte': ['value'],
	'phone-input/phone-input.svelte': ['value'],
	'pin-input/pin-input-root.svelte': ['value'],
	'rating/rating.svelte': ['value'],
	'radio-group/radio-group.svelte': ['value'],
	'radio-group/radio-group-root.svelte': ['value'],
	'toggle/toggle.svelte': ['pressed'],
	'checkbox/checkbox.svelte': ['checked'],
	'switch/switch.svelte': ['checked'],
	'tags-input/tags-input-root.svelte': ['value'],
	'file-upload/file-upload-root.svelte': ['files'],
	'toggle-group/toggle-group-root.svelte': ['value'],
	'color-picker/color-picker-root.svelte': ['value', 'alpha'],
	'select/select-root.svelte': ['open', 'value'],
	'combobox/combobox-root.svelte': ['open', 'value'],
	'popover/popover-root.svelte': ['open'],
	'date-picker/datepicker-root.svelte': ['open', 'value'],
	'float-button/float-button-root.svelte': ['open'],
	'rich-text-editor/rich-text-editor-root.svelte': ['value'],
	'tour/tour-root.svelte': ['active'],
	'transfer/transfer-root.svelte': ['sourceItems', 'targetItems'],
	'calendar/calendar-root.svelte': ['value'],
	'carousel/carousel-root.svelte': ['activeIndex'],
	'date-field/date-field-root.svelte': ['value'],
	'date-time-input/date-time-input.svelte': ['value'],
	'date-range-picker/date-range-picker-root.svelte': ['open', 'startDate', 'endDate'],
	'hover-card/hover-card-root.svelte': ['open'],
	'image-comparison/image-comparison.svelte': ['position'],
	'link-preview/link-preview-root.svelte': ['open'],
	'listbox/listbox-root.svelte': ['value'],
	'notification-center/notification-center-root.svelte': ['items', 'open'],
	'range-calendar/range-calendar-root.svelte': ['startDate', 'endDate'],
	'chip-group/chip-group-root.svelte': ['value'],
	'segmented-control/segmented-control-root.svelte': ['value'],
	'sidebar/sidebar-root.svelte': ['collapsed'],
	'stepper/stepper-root.svelte': ['activeStep'],
	'table-of-contents/table-of-contents-root.svelte': ['activeId'],
	'time-input/time-input.svelte': ['value'],
	'tree/tree-root.svelte': ['selectedItem']
};

const ELEMENT_NAME_MAP: Record<string, string> = {
	HTMLAnchorAttributes: 'a',
	HTMLButtonAttributes: 'button',
	HTMLInputAttributes: 'input',
	HTMLSelectAttributes: 'select',
	HTMLTextAreaAttributes: 'textarea',
	HTMLCanvasElement: 'canvas',
	HTMLDListElement: 'dl',
	HTMLDivElement: 'div',
	HTMLHeadingElement: 'h*',
	HTMLElement: 'element',
	HTMLLIElement: 'li',
	HTMLOListElement: 'ol',
	HTMLParagraphElement: 'p',
	HTMLQuoteElement: 'blockquote',
	HTMLSpanElement: 'span',
	HTMLTableCellElement: 'td',
	HTMLTableElement: 'table',
	HTMLTableRowElement: 'tr',
	HTMLTableSectionElement: 'tbody',
	HTMLTimeElement: 'time',
	HTMLUListElement: 'ul',
	SVGSVGElement: 'svg'
};

const FORWARDED_PROP_EXAMPLES: Record<string, string[]> = {
	a: ['href', 'target', 'rel'],
	blockquote: ['id', 'style', 'aria-label'],
	button: ['type', 'disabled', 'name'],
	canvas: ['width', 'height', 'aria-label'],
	div: ['id', 'style', 'role'],
	dl: ['id', 'style', 'role'],
	element: ['id', 'class', 'aria-label'],
	'h*': ['id', 'style', 'aria-label'],
	input: ['name', 'autocomplete', 'inputmode'],
	li: ['id', 'role', 'value'],
	ol: ['id', 'style', 'aria-labelledby'],
	p: ['id', 'style', 'aria-describedby'],
	select: ['name', 'multiple', 'autocomplete'],
	span: ['id', 'style', 'aria-label'],
	table: ['id', 'style', 'aria-describedby'],
	tbody: ['id', 'style', 'aria-describedby'],
	td: ['colspan', 'rowspan', 'headers'],
	textarea: ['name', 'rows', 'placeholder'],
	time: ['datetime', 'id', 'aria-label'],
	tr: ['id', 'aria-selected', 'role'],
	ul: ['id', 'style', 'aria-labelledby']
};

export function collectDataAttributes(source: string): string[] {
	const attrs = new Set<string>();

	for (const match of source.matchAll(/\b(data-[\w-]+)(?=[=\s>\]'])/g)) {
		const attr = match[1];
		if (attr) attrs.add(attr);
	}

	return [...attrs].sort();
}

function parseInterface(source: string, name: string): Record<string, PropShape> {
	const marker = `export interface ${name}`;
	const idx = source.indexOf(marker);
	if (idx === -1) return {};

	const braceStart = source.indexOf('{', idx);
	if (braceStart === -1) return {};

	let depth = 0;
	let end = braceStart;
	for (let i = braceStart; i < source.length; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}

	const body = source.slice(braceStart + 1, end);
	const props: Record<string, PropShape> = {};

	for (const entry of splitInterfaceProps(body)) {
		const match = entry.match(/^(?:readonly\s+)?(\w+)(\?)?:\s*(.+)$/s);
		if (!match) continue;

		const propName = match[1];
		const optional = Boolean(match[2]);
		const rawType = match[3];
		if (!propName || !rawType) continue;

		props[propName] = {
			type: normalizeParsedPropType(rawType, optional),
			required: !optional
		};
	}

	return props;
}

function normalizeParsedPropType(rawType: string, optional: boolean): string {
	let type = rawType
		.replace(/^\|\s*/, '')
		.replace(/;$/, '')
		.trim();
	if (optional) type = type.replace(/\s*\|\s*undefined$/, '').trim();
	if (type.startsWith('Snippet<')) type = type.replace(/\s+/g, ' ');
	return type;
}

function splitInterfaceProps(body: string): string[] {
	const props: string[] = [];
	const lines = body.split('\n');
	let buffer = '';
	let depth = 0;
	let quote: "'" | '"' | null = null;

	function pushBuffer() {
		const trimmed = buffer.trim().replace(/;$/, '').trim();
		if (trimmed) props.push(trimmed);
		buffer = '';
		depth = 0;
		quote = null;
	}

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? '';
		const nextTrimmed = lines
			.slice(index + 1)
			.find((candidate) => candidate.trim())
			?.trim();
		const trimmed = line.trim();

		if (!buffer) {
			if (!trimmed) continue;
			if (depth !== 0) continue;

			const match = trimmed.match(/^(?:readonly\s+)?(\w+)(\?)?:\s*(.*)$/);
			if (!match) continue;

			buffer = `${match[1]}${match[2] ?? ''}: ${match[3]}`;
		} else {
			buffer += `\n${line}`;
		}

		for (let i = 0; i < line.length; i += 1) {
			const char = line[i];
			const prev = i > 0 ? line[i - 1] : null;

			if ((char === "'" || char === '"') && prev !== '\\') {
				quote = quote === char ? null : (quote ?? (char as "'" | '"'));
				continue;
			}

			if (quote) continue;

			if (char === '{' || char === '(' || char === '[' || char === '<') depth += 1;
			else if (char === '}' || char === ')' || char === ']' || (char === '>' && prev !== '=')) {
				depth = Math.max(0, depth - 1);
			}
		}

		if (!buffer) continue;

		const lineEndsProp = !/[<([&|,:=?]$/.test(trimmed) && !/^[|&]/.test(nextTrimmed ?? '');
		if (depth === 0 && lineEndsProp) {
			pushBuffer();
		}
	}

	if (buffer) pushBuffer();

	return props;
}

function parseInterfaceBaseType(source: string, name: string): string | null {
	const marker = `export interface ${name}`;
	const idx = source.indexOf(marker);
	if (idx === -1) return null;

	const braceStart = source.indexOf('{', idx);
	if (braceStart === -1) return null;

	const header = source.slice(idx, braceStart);
	const match = header.match(/extends\s+(.+)$/s);
	return match?.[1]?.trim() ?? null;
}

function parseTypeAliasBaseType(source: string, name: string): string | null {
	const match = new RegExp(`export type ${name}\\s*=\\s*([^;]+);`).exec(source);
	return match?.[1]?.trim() ?? null;
}

function extractAcceptedValues(rawType: string): string[] | undefined {
	const unionParts = rawType
		.split('|')
		.map((part) => part.trim())
		.filter(Boolean);
	if (unionParts.length < 2) return undefined;

	const values: string[] = [];
	for (const part of unionParts) {
		const quoted = part.match(/^'([^']+)'$/);
		if (quoted?.[1]) {
			values.push(quoted[1]);
			continue;
		}

		if (/^-?\d+(\.\d+)?$/.test(part) || part === 'true' || part === 'false' || part === 'null') {
			values.push(part);
			continue;
		}

		const normalized = part.replace(/\s+/g, '');
		if (normalized === '(string&{})' || normalized === '(number&{})') continue;
		if (normalized === 'string' || normalized === 'number') continue;

		return undefined;
	}

	return values.length > 0 ? values : undefined;
}

function tagNameForBaseType(baseType: string): string | undefined {
	if (ELEMENT_NAME_MAP[baseType]) return ELEMENT_NAME_MAP[baseType];

	const htmlAttributesMatch = baseType.match(/HTMLAttributes<(\w+)>/);
	if (htmlAttributesMatch?.[1] && ELEMENT_NAME_MAP[htmlAttributesMatch[1]]) {
		return ELEMENT_NAME_MAP[htmlAttributesMatch[1]];
	}

	const svgAttributesMatch = baseType.match(/SVGAttributes<(\w+)>/);
	if (svgAttributesMatch?.[1] && ELEMENT_NAME_MAP[svgAttributesMatch[1]]) {
		return ELEMENT_NAME_MAP[svgAttributesMatch[1]];
	}

	return undefined;
}

function describeForwardedProps(baseType: string | null): ForwardedPropsShape | null {
	if (!baseType || !(baseType.includes('HTML') || baseType.includes('SVG'))) return null;

	let normalized = baseType.trim();
	let omitted: string[] = [];

	const omitMatch = normalized.match(/^Omit<(.+?),\s*(.+)>$/);
	if (omitMatch?.[1]) {
		normalized = omitMatch[1].trim();
		omitted = [...(omitMatch[2]?.matchAll(/'([^']+)'/g) ?? [])]
			.map((match) => match[1])
			.filter((value): value is string => Boolean(value));
	}

	const element = tagNameForBaseType(normalized);
	const examples = element ? (FORWARDED_PROP_EXAMPLES[element] ?? []) : [];
	const target = element ? `<${element}>` : baseType.includes('SVG') ? 'native SVG' : 'native HTML';

	return {
		baseType: baseType.trim(),
		via: 'rest',
		...(element ? { element } : {}),
		...(examples.length > 0 ? { examples } : {}),
		...(omitted.length > 0 ? { omitted } : {}),
		note: `Forwards ${target} attributes via rest props.`
	};
}

function enrichProps(
	props: Record<string, PropShape>,
	componentName: string,
	partName: string | undefined,
	source: string | undefined,
	sourcePath: string | undefined,
	metadata?: PropMetadataResolver
): Record<string, PropShape> {
	for (const [propName, prop] of Object.entries(props)) {
		if (source) {
			prop.type = resolvePropTypeReference(prop.type, source, sourcePath);
		}

		const acceptedValues = extractAcceptedValues(prop.type);
		if (acceptedValues) {
			prop.acceptedValues = acceptedValues;
		}

		const description = metadata?.descriptionForProp(componentName, propName, partName);
		if (description) {
			prop.description = description;
		}

		const note = metadata?.noteForProp(componentName, propName, partName);
		if (note) {
			prop.note = note;
		}
	}

	return props;
}

function resolvePropTypeReference(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): string {
	const trimmed = typeExpression.trim();
	if (!trimmed) return trimmed;

	const indexedMatch = trimmed.match(/^(\w+)\[['"]([^'"]+)['"]\]$/);
	if (indexedMatch?.[1] && indexedMatch[2]) {
		const props = resolvePropsFromTypeExpression(indexedMatch[1], source, sourcePath, stack);
		return props[indexedMatch[2]]?.type ?? trimmed;
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return trimmed;

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}:prop-type`;
	if (stack.has(visitKey)) return trimmed;

	stack.add(visitKey);

	try {
		const aliasType = parseTypeAliasBaseType(source, typeName);
		if (aliasType) {
			return resolvePropTypeReference(aliasType, source, sourcePath, stack);
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return trimmed;

		return resolvePropTypeReference(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

function resolveTypeAliasToInterface(
	source: string,
	name: string,
	componentName: string,
	partName: string | undefined,
	sourcePath: string | undefined,
	metadata?: PropMetadataResolver
): Record<string, PropShape> {
	const aliasType = parseTypeAliasBaseType(source, name);
	if (!aliasType) return {};

	const firstType = aliasType.split(/[&|]/)[0]?.trim();
	if (!firstType) return {};

	const identMatch = firstType.match(/^(\w+)$/);
	if (identMatch?.[1]) {
		return enrichProps(
			parseInterface(source, identMatch[1]),
			componentName,
			partName,
			source,
			sourcePath,
			metadata
		);
	}

	return {};
}

function splitTopLevel(input: string, separator: string): string[] {
	const parts: string[] = [];
	let start = 0;
	let angleDepth = 0;
	let parenDepth = 0;
	let bracketDepth = 0;
	let braceDepth = 0;
	let quote: "'" | '"' | null = null;

	for (let i = 0; i < input.length; i += 1) {
		const char = input[i];
		const prev = input[i - 1];

		if ((char === "'" || char === '"') && prev !== '\\') {
			quote = quote === char ? null : (quote ?? (char as "'" | '"'));
			continue;
		}

		if (quote) continue;

		if (char === '<') angleDepth += 1;
		else if (char === '>') angleDepth = Math.max(0, angleDepth - 1);
		else if (char === '(') parenDepth += 1;
		else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
		else if (char === '[') bracketDepth += 1;
		else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
		else if (char === '{') braceDepth += 1;
		else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
		else if (
			char === separator &&
			angleDepth === 0 &&
			parenDepth === 0 &&
			bracketDepth === 0 &&
			braceDepth === 0
		) {
			parts.push(input.slice(start, i).trim());
			start = i + 1;
		}
	}

	parts.push(input.slice(start).trim());
	return parts.filter(Boolean);
}

function unwrapGeneric(typeExpression: string, genericName: string): string | null {
	const prefix = `${genericName}<`;
	if (!typeExpression.startsWith(prefix) || !typeExpression.endsWith('>')) {
		return null;
	}

	return typeExpression.slice(prefix.length, -1).trim();
}

function parseQuotedPropNames(typeExpression: string): string[] {
	return [...typeExpression.matchAll(/'([^']+)'/g)]
		.map((match) => match[1])
		.filter((value): value is string => Boolean(value));
}

function resolveImportPath(specifier: string, sourcePath?: string): string | null {
	if (!sourcePath || !specifier.startsWith('.')) return null;

	const basePath = resolve(dirname(sourcePath), specifier);
	const candidates = /\.[a-z]+$/i.test(basePath)
		? [
				basePath,
				basePath.replace(/\.js$/i, '.ts'),
				basePath.replace(/\.js$/i, '.tsx'),
				basePath.replace(/\.mjs$/i, '.ts'),
				basePath.replace(/\.mjs$/i, '.tsx')
			]
		: [
				basePath,
				`${basePath}.ts`,
				`${basePath}.tsx`,
				`${basePath}.js`,
				join(basePath, 'index.ts'),
				join(basePath, 'index.tsx'),
				join(basePath, 'index.js')
			];

	return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function resolveImportedTypeSource(
	source: string,
	typeName: string,
	sourcePath?: string
): { exportedName: string; source: string; sourcePath: string } | null {
	if (!sourcePath) return null;

	for (const match of source.matchAll(
		/(?:import\s+(?:type\s+)?|export\s+type\s+)\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
	)) {
		const bindings = match[1];
		const specifier = match[2];
		if (!bindings || !specifier) continue;

		for (const binding of bindings.split(',')) {
			const normalized = binding.trim().replace(/^type\s+/, '');
			if (!normalized) continue;

			const bindingMatch = normalized.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
			if (!bindingMatch?.[1]) continue;

			const importedName = bindingMatch[1];
			const localName = bindingMatch[2] ?? importedName;
			if (localName !== typeName) continue;

			const importPath = resolveImportPath(specifier, sourcePath);
			if (!importPath) return null;

			return {
				exportedName: importedName,
				source: readFileSync(importPath, 'utf8'),
				sourcePath: importPath
			};
		}
	}

	return null;
}

function resolvePropsFromTypeExpression(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): Record<string, PropShape> {
	const trimmed = typeExpression.trim();
	if (!trimmed) return {};

	const intersections = splitTopLevel(trimmed, '&');
	if (intersections.length > 1) {
		return intersections.reduce<Record<string, PropShape>>((merged, part) => {
			Object.assign(merged, resolvePropsFromTypeExpression(part, source, sourcePath, stack));
			return merged;
		}, {});
	}

	const omitInner = unwrapGeneric(trimmed, 'Omit');
	if (omitInner) {
		const [targetType, omittedProps] = splitTopLevel(omitInner, ',');
		const props = resolvePropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
		for (const propName of parseQuotedPropNames(omittedProps ?? '')) {
			delete props[propName];
		}
		return props;
	}

	const pickInner = unwrapGeneric(trimmed, 'Pick');
	if (pickInner) {
		const [targetType, pickedProps] = splitTopLevel(pickInner, ',');
		const props = resolvePropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
		const selected = new Set(parseQuotedPropNames(pickedProps ?? ''));
		return Object.fromEntries(Object.entries(props).filter(([propName]) => selected.has(propName)));
	}

	const partialInner = unwrapGeneric(trimmed, 'Partial');
	if (partialInner) {
		const props = resolvePropsFromTypeExpression(partialInner, source, sourcePath, stack);
		for (const value of Object.values(props)) {
			value.required = false;
		}
		return props;
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return {};

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}`;
	if (stack.has(visitKey)) return {};

	stack.add(visitKey);

	try {
		const props = parseInterface(source, typeName);
		const baseType =
			parseInterfaceBaseType(source, typeName) ?? parseTypeAliasBaseType(source, typeName);

		if (Object.keys(props).length > 0 || baseType) {
			return {
				...(baseType ? resolvePropsFromTypeExpression(baseType, source, sourcePath, stack) : {}),
				...props
			};
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return {};

		return resolvePropsFromTypeExpression(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

function resolveForwardedPropsFromTypeExpression(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): ForwardedPropsShape | null {
	const trimmed = typeExpression.trim();
	if (!trimmed) return null;

	const direct = describeForwardedProps(trimmed);
	if (direct) return direct;

	const intersections = splitTopLevel(trimmed, '&');
	if (intersections.length > 1) {
		for (const part of intersections) {
			const resolved = resolveForwardedPropsFromTypeExpression(part, source, sourcePath, stack);
			if (resolved) return resolved;
		}
	}

	for (const genericName of ['Omit', 'Pick', 'Partial', 'Readonly']) {
		const inner = unwrapGeneric(trimmed, genericName);
		if (!inner) continue;

		const [targetType] = splitTopLevel(inner, ',');
		return resolveForwardedPropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return null;

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}:forwarded`;
	if (stack.has(visitKey)) return null;

	stack.add(visitKey);

	try {
		const baseType =
			parseInterfaceBaseType(source, typeName) ?? parseTypeAliasBaseType(source, typeName);
		if (baseType) {
			return resolveForwardedPropsFromTypeExpression(baseType, source, sourcePath, stack);
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return null;

		return resolveForwardedPropsFromTypeExpression(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

export function parsePropContract(
	source: string,
	name: string,
	componentName: string,
	partName?: string,
	metadata?: PropMetadataResolver,
	sourcePath?: string
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	let props = parseInterface(source, name);

	if (Object.keys(props).length === 0) {
		props = resolveTypeAliasToInterface(
			source,
			name,
			componentName,
			partName,
			sourcePath,
			metadata
		);
	} else {
		props = enrichProps(props, componentName, partName, source, sourcePath, metadata);
	}

	return {
		props,
		forwardedProps: describeForwardedProps(
			parseInterfaceBaseType(source, name) ?? parseTypeAliasBaseType(source, name)
		)
	};
}

export function parseCompoundParts(source: string, name: string): string[] | null {
	const match = new RegExp(`export const ${name}:\\s*\\{`).exec(source);
	if (!match) return null;

	const start = (match.index ?? 0) + match[0].length - 1;
	let depth = 0;
	let end = start;
	for (let i = start; i < source.length; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}

	const body = source.slice(start + 1, end);
	const parts: string[] = [];
	for (const line of body.split('\n')) {
		const partMatch = line.trim().match(/^(\w+):\s*typeof\s+/);
		if (partMatch?.[1]) parts.push(partMatch[1]);
	}

	return parts.length > 0 ? parts : null;
}

export function partPropInterfaceNames(componentName: string, partName: string): string[] {
	const names = [`${componentName}${partName}Props`];
	if (partName !== 'Root') names.push(`${partName}Props`);

	const partWords = partName.match(/[A-Z][a-z]*/g) ?? [];
	for (let i = 1; i <= partWords.length; i++) {
		const prefix = partWords.slice(0, i).join('');
		if (componentName.endsWith(prefix)) {
			const remainder = partWords.slice(i).join('');
			if (remainder) {
				const deduped = `${componentName}${remainder}Props`;
				if (!names.includes(deduped)) names.push(deduped);
			}
		}
	}

	const compWords = componentName.match(/[A-Z][a-z]*/g) ?? [];
	for (let i = 1; i <= Math.min(compWords.length, partWords.length); i++) {
		if (compWords.slice(0, i).join('') === partWords.slice(0, i).join('')) {
			const remainder = partWords.slice(i).join('');
			if (remainder) {
				const prefixed = `${componentName}${remainder}Props`;
				if (!names.includes(prefixed)) names.push(prefixed);
			}
		}
	}

	return names;
}

export function parsePartContract(
	source: string,
	componentName: string,
	partName: string,
	sourcePath?: string,
	metadata?: PropMetadataResolver
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	for (const ifaceName of partPropInterfaceNames(componentName, partName)) {
		const props = resolvePropsFromTypeExpression(ifaceName, source, sourcePath);
		const baseType =
			parseInterfaceBaseType(source, ifaceName) ?? parseTypeAliasBaseType(source, ifaceName);
		if (Object.keys(props).length > 0 || baseType) {
			return {
				props: enrichProps(props, componentName, partName, source, sourcePath, metadata),
				forwardedProps:
					(baseType
						? resolveForwardedPropsFromTypeExpression(baseType, source, sourcePath)
						: null) ?? describeForwardedProps(baseType)
			};
		}
	}

	return { props: {}, forwardedProps: null };
}

export function parseDefaults(svelteSource: string): Record<string, string> {
	const defaults: Record<string, string> = {};
	const propsMatch = svelteSource.match(/let\s*\{([^}]+)\}[^=]*=\s*\$props\(\)/s);
	if (!propsMatch?.[1]) return defaults;

	for (const match of propsMatch[1].matchAll(/(\w+)\s*=\s*([^,\n}]+)/g)) {
		const name = match[1]?.trim();
		let value = match[2]?.trim();
		if (!name || !value || name === 'class' || name === 'className') continue;

		const bindable = value.match(/^\$bindable\(([^)]*)\)$/);
		if (bindable) value = bindable[1]?.trim() || '';
		if (!value) continue;

		defaults[name] = value;
	}
	return defaults;
}

export function findBindableProps(dir: string, part: string): string[] {
	const all: string[] = [];
	const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

	for (const [filePath, props] of Object.entries(BINDABLE_MAP)) {
		if (!filePath.startsWith(`${dir}/`)) continue;
		const fileName = filePath.split('/')[1] ?? '';
		if (
			fileName.includes(partKebab) ||
			(part === 'Root' && (fileName.includes('-root') || fileName === `${dir}.svelte`))
		) {
			all.push(...props);
		}
	}

	return all;
}

export function findBindablePropsSimple(dir: string): string[] {
	const all: string[] = [];
	for (const [filePath, props] of Object.entries(BINDABLE_MAP)) {
		if (filePath.startsWith(`${dir}/`)) all.push(...props);
	}
	return all;
}
