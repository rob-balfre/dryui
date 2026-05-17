#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(here, '../data/component-manifest.json');
const lintManifestPath = resolve(here, '../data/lint-rules.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const lintManifest = JSON.parse(readFileSync(lintManifestPath, 'utf8'));
const components = manifest.components ?? {};
const lintRules = lintManifest.rules ?? {};

function normalize(value) {
	return String(value)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}

function usage() {
	console.log(`DryUI component checker

Usage:
  node skills/dryui-build/scripts/check-component.mjs --list
  node skills/dryui-build/scripts/check-component.mjs --search dialog
  node skills/dryui-build/scripts/check-component.mjs Button
  node skills/dryui-build/scripts/check-component.mjs Button variant=solid size=icon
  node skills/dryui-build/scripts/check-component.mjs Accordion.Root type=single
  node skills/dryui-build/scripts/check-component.mjs --lint dryui/no-width
  node skills/dryui-build/scripts/check-component.mjs --lint-search label

Checks are local and deterministic. They validate component names, part names,
prop names, enum-like prop values, and lint rule ids recorded in the bundled
manifests.`);
}

function sortedEntries(obj) {
	return Object.entries(obj).sort(([left], [right]) => left.localeCompare(right));
}

function normalizedIncludes(value, query) {
	const normalizedValue = normalize(value);
	const normalizedQuery = normalize(query);
	return normalizedQuery.length > 0 && normalizedValue.includes(normalizedQuery);
}

function findComponent(rawName) {
	const wanted = normalize(rawName);
	for (const [name, component] of sortedEntries(components)) {
		if (normalize(name) === wanted || normalize(component.slug) === wanted) {
			return { name, component };
		}
	}
	return null;
}

function findPart(component, rawName) {
	const wanted = normalize(rawName);
	for (const [name, part] of sortedEntries(component.parts ?? {})) {
		if (normalize(name) === wanted) return { name, part };
	}
	return null;
}

function findProp(props, rawName) {
	const wanted = normalize(rawName);
	for (const [name, prop] of sortedEntries(props ?? {})) {
		if (normalize(name) === wanted) return { name, prop };
	}
	return null;
}

function splitTarget(rawTarget) {
	const [componentName, partName, ...extra] = String(rawTarget).split('.');
	if (!componentName || extra.length > 0) return null;
	return { componentName, partName: partName || null };
}

function searchScore(name, component, query) {
	const rawQuery = String(query).trim().toLowerCase();
	const normalizedQuery = normalize(query);
	if (!normalizedQuery) return 0;

	const identityFields = [name, component.slug];
	if (identityFields.some((field) => normalize(field) === normalizedQuery)) return 120;
	if (identityFields.some((field) => normalizedIncludes(field, query))) return 100;

	const discoveryTerms = component.discoveryTerms ?? [];
	if (discoveryTerms.some((term) => normalize(term) === normalizedQuery)) return 95;
	if (discoveryTerms.some((term) => normalizedIncludes(term, query))) return 90;

	if (normalize(component.category) === normalizedQuery) return 85;
	if (normalizedIncludes(component.category, query)) return 80;

	if (normalizedQuery.length <= 3) return 0;

	const detailFields = [
		component.kind,
		component.description,
		...(component.a11y ?? []),
		...Object.keys(component.props ?? {}),
		...Object.keys(component.parts ?? {})
	];
	if (detailFields.some((field) => String(field).toLowerCase().includes(rawQuery))) return 55;
	if (detailFields.some((field) => normalizedIncludes(field, query))) return 45;

	return 0;
}

function searchComponents(query, limit = 25) {
	return sortedEntries(components)
		.map(([name, component]) => ({ name, component, score: searchScore(name, component, query) }))
		.filter((match) => match.score > 0)
		.sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
		.slice(0, limit);
}

function matchingDiscoveryTerms(component, query) {
	return (component.discoveryTerms ?? []).filter((term) => normalizedIncludes(term, query));
}

function formatSearchTerm(rawName) {
	return (
		String(rawName)
			.trim()
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[-_]+/g, ' ')
			.toLowerCase() || 'component'
	);
}

function printList() {
	console.log(`DryUI component manifest: ${manifest.componentCount} components`);
	const byCategory = new Map();
	for (const [name, component] of sortedEntries(components)) {
		const list = byCategory.get(component.category) ?? [];
		list.push(name);
		byCategory.set(component.category, list);
	}
	for (const [category, names] of [...byCategory.entries()].sort(([left], [right]) =>
		left.localeCompare(right)
	)) {
		console.log(`${category}: ${names.join(', ')}`);
	}
}

function printSearch(query) {
	const matches = searchComponents(query);
	if (matches.length === 0) {
		console.error(`No DryUI components matched "${query}".`);
		process.exitCode = 1;
		return;
	}
	const discoveryMatch = matches.some(
		(match) => matchingDiscoveryTerms(match.component, query).length > 0
	);
	if (discoveryMatch) {
		console.log(
			`Existing DryUI components related to "${query}" (check these before creating app-local primitives):`
		);
	} else {
		console.log(`DryUI component matches for "${query}":`);
	}
	for (const { name, component } of matches) {
		console.log(`${name} (${component.category}, ${component.kind}) - ${component.description}`);
		console.log(`  ${component.rootImport}`);
		const terms = matchingDiscoveryTerms(component, query);
		if (terms.length > 0) console.log(`  discovery: ${terms.join(', ')}`);
	}
}

function formatProp(name, prop) {
	const bits = [`${name}: ${prop.type}`];
	if (prop.values) bits.push(`values=${prop.values.join('|')}`);
	if (prop.default !== undefined) bits.push(`default=${prop.default}`);
	if (prop.required) bits.push('required');
	if (prop.bindable) bits.push('bindable');
	return bits.join('; ');
}

function printLookup(name, component, partName, part) {
	const targetName = partName ? `${name}.${partName}` : name;
	console.log(`${targetName} (${component.category}, ${component.kind})`);
	console.log(component.description);
	console.log(component.rootImport);
	console.log(component.subpathImport);

	if (component.parts && !part) {
		console.log(`parts: ${Object.keys(component.parts).join(', ')}`);
	}
	if (component.requiredProps?.length) {
		console.log(`requiredProps: ${component.requiredProps.join(', ')}`);
	}
	if (part?.requiredProps?.length) {
		console.log(`requiredProps: ${part.requiredProps.join(', ')}`);
	}
	if (component.avoidProps?.length) {
		console.log(`avoidProps: ${component.avoidProps.join(', ')}`);
	}
	if (component.discoveryTerms?.length) {
		console.log(`discoveryTerms: ${component.discoveryTerms.join(', ')}`);
	}

	const props = part ? part.props : component.props;
	if (props && Object.keys(props).length > 0) {
		console.log('props:');
		for (const [propName, prop] of sortedEntries(props)) {
			console.log(`  - ${formatProp(propName, prop)}`);
		}
	}

	if (component.cssVars && Object.keys(component.cssVars).length > 0) {
		console.log('cssVars:');
		for (const [name, description] of sortedEntries(component.cssVars)) {
			console.log(`  - ${name}: ${description}`);
		}
	}
	if (component.dataAttributes?.length) {
		console.log(`dataAttributes: ${component.dataAttributes.join(', ')}`);
	}
	if (component.a11y?.length) {
		console.log('a11y:');
		for (const note of component.a11y) console.log(`  - ${note}`);
	}
	if (component.forwardedProps) {
		console.log(`forwardedProps: ${component.forwardedProps.note}`);
		const avoidProps = new Set(component.avoidProps ?? []);
		const examples = (component.forwardedProps.examples ?? []).filter(
			(example) => !avoidProps.has(example)
		);
		if (examples.length) {
			console.log(`forwardedExamples: ${examples.join(', ')}`);
		}
	}
	if (component.quickStartCode) {
		console.log('quickStart:');
		console.log(component.quickStartCode);
	}
}

function parseCheck(raw) {
	const index = raw.indexOf('=');
	if (index < 0) return { name: raw, value: null };
	return { name: raw.slice(0, index), value: raw.slice(index + 1) };
}

function normalizeValue(raw) {
	return String(raw)
		.trim()
		.replace(/^['"]|['"]$/g, '');
}

function checkProps(targetName, props, requiredProps, checks) {
	let ok = true;
	const suppliedProps = new Set(checks.map((raw) => normalize(parseCheck(raw).name)));
	for (const requiredProp of requiredProps ?? []) {
		if (!suppliedProps.has(normalize(requiredProp))) {
			console.error(`${targetName}: missing required prop "${requiredProp}"`);
			ok = false;
		}
	}
	for (const raw of checks) {
		const check = parseCheck(raw);
		const match = findProp(props, check.name);
		if (!match) {
			console.error(`${targetName}: unknown prop "${check.name}"`);
			ok = false;
			continue;
		}
		if (check.value !== null && match.prop.values) {
			const value = normalizeValue(check.value);
			if (!match.prop.values.includes(value)) {
				console.error(
					`${targetName}.${match.name}: invalid value "${value}" (expected ${match.prop.values.join(
						' | '
					)})`
				);
				ok = false;
			}
		}
	}
	if (!ok) process.exitCode = 1;
	else if (checks.length > 0) {
		console.log(`ok ${targetName}: ${checks.join(', ')}`);
	}
}

function suggest(rawName) {
	const query = normalize(rawName);
	const matches = sortedEntries(components)
		.filter(
			([name, component]) =>
				normalize(name).includes(query) || normalize(component.slug).includes(query)
		)
		.slice(0, 8)
		.map(([name]) => name);
	const directMatches = new Set(matches);
	const related = searchComponents(rawName, 8)
		.map((match) => match.name)
		.filter((name) => !directMatches.has(name));
	const suggestions = [...matches, ...related];
	if (suggestions.length === 0) return '';
	return ` Existing related DryUI components: ${suggestions.join(
		', '
	)}. Check these before creating app-local ${formatSearchTerm(rawName)} UI.`;
}

function findLintRule(rawId) {
	const wanted = normalize(rawId);
	for (const [id, rule] of sortedEntries(lintRules)) {
		if (normalize(id) === wanted) return { id, rule };
	}
	return null;
}

function lintRuleMatchesSearch(id, rule, query) {
	const haystack = [id, rule.severity, rule.category, rule.message, rule.suggestedFix ?? '']
		.join(' ')
		.toLowerCase();
	return haystack.includes(query.toLowerCase());
}

function printLintRule(id, rule) {
	console.log(`${id} (${rule.severity}, ${rule.category})`);
	console.log(rule.message);
	if (rule.suggestedFix) console.log(`fix: ${rule.suggestedFix}`);
}

function printLintSearch(query) {
	const matches = sortedEntries(lintRules)
		.filter(([id, rule]) => lintRuleMatchesSearch(id, rule, query))
		.slice(0, 25);
	if (matches.length === 0) {
		console.error(`No DryUI lint rules matched "${query}".`);
		process.exitCode = 1;
		return;
	}
	for (const [id, rule] of matches) printLintRule(id, rule);
}

function suggestLint(rawId) {
	const query = normalize(rawId);
	const matches = sortedEntries(lintRules)
		.filter(([id]) => normalize(id).includes(query))
		.slice(0, 8)
		.map(([id]) => id);
	return matches.length > 0 ? ` Did you mean: ${matches.join(', ')}?` : '';
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
	usage();
} else if (args[0] === '--list') {
	printList();
} else if (args[0] === '--search') {
	if (!args[1]) {
		console.error('Missing search query.');
		process.exitCode = 1;
	} else {
		printSearch(args.slice(1).join(' '));
	}
} else if (args[0] === '--lint') {
	if (!args[1]) {
		console.error('Missing lint rule id.');
		process.exitCode = 1;
	} else {
		const match = findLintRule(args[1]);
		if (!match) {
			console.error(`Unknown DryUI lint rule "${args[1]}".${suggestLint(args[1])}`);
			process.exitCode = 1;
		} else {
			printLintRule(match.id, match.rule);
		}
	}
} else if (args[0] === '--lint-search') {
	if (!args[1]) {
		console.error('Missing lint search query.');
		process.exitCode = 1;
	} else {
		printLintSearch(args.slice(1).join(' '));
	}
} else {
	const target = splitTarget(args[0]);
	if (!target) {
		console.error(`Invalid target "${args[0]}". Use Component or Component.Part.`);
		process.exitCode = 1;
	} else {
		const match = findComponent(target.componentName);
		if (!match) {
			console.error(
				`Unknown DryUI component "${target.componentName}".${suggest(target.componentName)}`
			);
			process.exitCode = 1;
		} else {
			const { name, component } = match;
			let partName = null;
			let part = null;
			if (target.partName) {
				const partMatch = findPart(component, target.partName);
				if (!partMatch) {
					console.error(
						`${name}: unknown part "${target.partName}" (expected ${Object.keys(
							component.parts ?? {}
						).join(', ')})`
					);
					process.exitCode = 1;
				} else {
					partName = partMatch.name;
					part = partMatch.part;
				}
			}

			if (process.exitCode !== 1) {
				if (args.length === 1) {
					printLookup(name, component, partName, part);
				} else if (component.parts && !part) {
					console.error(
						`${name} is compound. Check a part explicitly, for example ${name}.Root. Parts: ${Object.keys(
							component.parts
						).join(', ')}`
					);
					process.exitCode = 1;
				} else {
					checkProps(
						partName ? `${name}.${partName}` : name,
						part ? part.props : component.props,
						part ? part.requiredProps : component.requiredProps,
						args.slice(1)
					);
				}
			}
		}
	}
}
