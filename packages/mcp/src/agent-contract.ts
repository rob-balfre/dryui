import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiSurface, type AiPromptBundle, type AiSurfaceEntry } from './ai-surface.js';
import {
	componentKind,
	findComponent,
	getBindableProps,
	getRequiredParts,
	getSubpathImport
} from './spec-formatters.js';
import type {
	ComponentDef,
	CompositionAntiPatternDef,
	CompositionRecipeDef,
	PartDef,
	PropDef,
	Spec
} from './spec-types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = resolve(__dirname, 'spec.json');
export const agentContractJsonPath = resolve(__dirname, 'agent-contract.v1.json');
export const agentContractSchemaPath = resolve(__dirname, 'agent-contract.v1.schema.json');

export interface AgentPropSignature {
	readonly signature: string;
	readonly required: boolean;
	readonly bindable: boolean;
	readonly default?: string;
	readonly values?: readonly string[];
	readonly description?: string;
	readonly note?: string;
}

export interface AgentPartContract {
	readonly props: Record<string, AgentPropSignature>;
	readonly forwards?: string;
}

export interface AgentAntiPattern {
	readonly pattern: string;
	readonly reason: string;
	readonly fix: string;
}

export interface AgentComponentContract {
	readonly name: string;
	readonly description: string;
	readonly category: string;
	readonly tags: readonly string[];
	readonly kind: 'simple' | 'compound' | 'namespaced';
	readonly import: {
		readonly package: string;
		readonly statement: string;
		readonly subpathStatement?: string;
	};
	readonly requiredParts: readonly string[];
	readonly bindableProps: readonly string[];
	readonly props?: Record<string, AgentPropSignature>;
	readonly parts?: Record<string, AgentPartContract>;
	readonly structure?: readonly string[];
	readonly usage: string;
	readonly accessibility: readonly string[];
	readonly antiPatterns: readonly AgentAntiPattern[];
	readonly rules: readonly string[];
	readonly checks: readonly string[];
}

export interface AgentRecipeContract {
	readonly name: string;
	readonly description: string;
	readonly tags: readonly string[];
	readonly components: readonly string[];
	readonly snippet: string;
}

export interface AgentContractV1 {
	readonly schema: 'DryUIAgentContractV1';
	readonly version: 1;
	readonly package: {
		readonly name: string;
		readonly version: string;
	};
	readonly source: {
		readonly spec: string;
		readonly aiSurface: string;
		readonly composition: string;
	};
	readonly ai: {
		readonly tools: readonly AiSurfaceEntry[];
		readonly prompts: readonly AiSurfaceEntry[];
		readonly cliCommands: readonly AiSurfaceEntry[];
		readonly promptBundles: readonly AiPromptBundle[];
	};
	readonly themeImports: {
		readonly default: string;
		readonly dark: string;
	};
	readonly validation: {
		readonly checks: readonly string[];
		readonly repairLoop: readonly string[];
	};
	readonly components: Record<string, AgentComponentContract>;
	readonly recipes: Record<string, AgentRecipeContract>;
}

interface AgentContractArtifacts {
	readonly contract: AgentContractV1;
	readonly contractJson: string;
	readonly schemaJson: string;
}

function readSpec(): Spec {
	return JSON.parse(readFileSync(specPath, 'utf8')) as Spec;
}

function formatPropSignature(propName: string, prop: PropDef): AgentPropSignature {
	const flags = [prop.type];
	if (prop.required) flags.push('required');
	if (prop.bindable) flags.push('bindable');
	if (prop.default !== undefined) flags.push(`default:${prop.default}`);
	if (prop.acceptedValues?.length) flags.push(`values:${prop.acceptedValues.join('|')}`);

	return {
		signature: `${propName}: ${flags.join(' | ')}`,
		required: Boolean(prop.required),
		bindable: Boolean(prop.bindable),
		...(prop.default !== undefined ? { default: prop.default } : {}),
		...(prop.acceptedValues?.length ? { values: prop.acceptedValues } : {}),
		...(prop.description ? { description: prop.description } : {}),
		...(prop.note ? { note: prop.note } : {})
	};
}

function formatProps(
	props: Record<string, PropDef> | undefined
): Record<string, AgentPropSignature> {
	if (!props) return {};
	return Object.fromEntries(
		Object.entries(props).map(([propName, prop]) => [propName, formatPropSignature(propName, prop)])
	);
}

function formatForwards(part: PartDef): string | undefined {
	if (!part.forwardedProps) return undefined;
	const examples = part.forwardedProps.examples?.length
		? ` Examples: ${part.forwardedProps.examples.join(', ')}.`
		: '';
	return `${part.forwardedProps.note}${examples}`;
}

function formatParts(
	parts: Record<string, PartDef> | undefined
): Record<string, AgentPartContract> {
	if (!parts) return {};
	return Object.fromEntries(
		Object.entries(parts).map(([partName, part]) => {
			const value: AgentPartContract = { props: formatProps(part.props) };
			const forwards = formatForwards(part);
			if (forwards) {
				return [partName, { ...value, forwards }];
			}
			return [partName, value];
		})
	);
}

function findAntiPatterns(spec: Spec, componentName: string): AgentAntiPattern[] {
	const composition = spec.composition?.components;
	if (!composition) return [];

	for (const entry of Object.values(composition)) {
		if (entry.component !== componentName) continue;
		return entry.antiPatterns.map((antiPattern: CompositionAntiPatternDef) => ({
			pattern: antiPattern.pattern,
			reason: antiPattern.reason,
			fix: antiPattern.fix
		}));
	}

	return [];
}

function componentRules(name: string, def: ComponentDef): string[] {
	const rules = [
		`Import ${name} from ${def.import}.`,
		'Use documented props and DryUI CSS variables before custom markup or inline styles.'
	];

	if (def.compound) {
		rules.push(`Use ${name} compound parts; do not render <${name}> as a standalone element.`);
		const requiredParts = getRequiredParts(name, def);
		if (requiredParts.length) {
			rules.push(
				`Include required parts: ${requiredParts.map((part) => `${name}.${part}`).join(', ')}.`
			);
		}
	}

	if (def.a11y?.length) {
		rules.push('Preserve the accessibility notes in this contract.');
	}

	return rules;
}

function componentChecks(name: string): string[] {
	return [
		`Use the DryUI skill or generated component contract when ${name} context is needed`,
		'Run package-level validation for changed files',
		'Svelte MCP svelte-autofixer on edited Svelte code'
	];
}

function buildComponentContract(
	spec: Spec,
	name: string,
	def: ComponentDef
): AgentComponentContract {
	const subpathStatement = getSubpathImport(name, def) ?? undefined;
	const props = formatProps(def.props);
	const parts = formatParts(def.parts);

	return {
		name,
		description: def.description,
		category: def.category,
		tags: def.tags,
		kind: componentKind(def),
		import: {
			package: def.import,
			statement: `import { ${name} } from '${def.import}'`,
			...(subpathStatement ? { subpathStatement } : {})
		},
		requiredParts: getRequiredParts(name, def),
		bindableProps: getBindableProps(def),
		usage: def.example,
		accessibility: def.a11y ?? [],
		antiPatterns: findAntiPatterns(spec, name),
		rules: componentRules(name, def),
		checks: componentChecks(name),
		...(Object.keys(props).length ? { props } : {}),
		...(Object.keys(parts).length ? { parts } : {}),
		...(def.structure?.tree.length ? { structure: def.structure.tree } : {})
	};
}

function buildRecipeContract(recipe: CompositionRecipeDef): AgentRecipeContract {
	return {
		name: recipe.name,
		description: recipe.description,
		tags: recipe.tags,
		components: recipe.components,
		snippet: recipe.snippet
	};
}

function normalizeAi(spec: Spec): AgentContractV1['ai'] {
	return {
		tools: spec.ai?.tools ?? aiSurface.tools,
		prompts: spec.ai?.prompts ?? aiSurface.prompts,
		cliCommands: spec.ai?.cliCommands ?? aiSurface.cliCommands,
		promptBundles: spec.ai?.promptBundles ?? aiSurface.promptBundles
	};
}

function buildAgentContractV1(): AgentContractV1 {
	const spec = readSpec();
	const components = Object.fromEntries(
		Object.entries(spec.components)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([name, def]) => [name, buildComponentContract(spec, name, def)])
	);
	const recipes = Object.fromEntries(
		Object.entries(spec.composition?.recipes ?? {})
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([name, recipe]) => [name, buildRecipeContract(recipe)])
	);

	return {
		schema: 'DryUIAgentContractV1',
		version: 1,
		package: {
			name: spec.package,
			version: spec.version
		},
		source: {
			spec: 'packages/mcp/src/spec.json',
			aiSurface: 'packages/mcp/src/ai-surface.ts',
			composition: 'packages/mcp/src/composition-data.ts'
		},
		ai: normalizeAi(spec),
		themeImports: spec.themeImports,
		validation: {
			checks: [
				'Run package-level validation for changed files',
				'Svelte MCP svelte-autofixer on edited Svelte code',
				'bun run --filter @dryui/ui build when editing packages/ui Svelte sources'
			],
			repairLoop: [
				'Generate task-specific context with the DryUI skill or generated component contract.',
				'Write real Svelte using @dryui/ui components.',
				'Run package-level validation plus Svelte MCP svelte-autofixer.',
				'Repair diagnostics until generated checks pass.'
			]
		},
		components,
		recipes
	};
}

function stringArraySchema(): Record<string, unknown> {
	return { type: 'array', items: { type: 'string' } };
}

function buildSchema(): Record<string, unknown> {
	return {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'DryUI agent contract v1',
		type: 'object',
		additionalProperties: false,
		required: [
			'schema',
			'version',
			'package',
			'source',
			'ai',
			'themeImports',
			'validation',
			'components',
			'recipes'
		],
		properties: {
			schema: { const: 'DryUIAgentContractV1' },
			version: { const: 1 },
			package: { $ref: '#/$defs/package' },
			source: { $ref: '#/$defs/source' },
			ai: { $ref: '#/$defs/ai' },
			themeImports: { $ref: '#/$defs/themeImports' },
			validation: { $ref: '#/$defs/validation' },
			components: {
				type: 'object',
				additionalProperties: { $ref: '#/$defs/component' }
			},
			recipes: {
				type: 'object',
				additionalProperties: { $ref: '#/$defs/recipe' }
			}
		},
		$defs: {
			package: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'version'],
				properties: {
					name: { type: 'string' },
					version: { type: 'string' }
				}
			},
			source: {
				type: 'object',
				additionalProperties: false,
				required: ['spec', 'aiSurface', 'composition'],
				properties: {
					spec: { type: 'string' },
					aiSurface: { type: 'string' },
					composition: { type: 'string' }
				}
			},
			aiEntry: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'description'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' }
				}
			},
			promptBundle: {
				type: 'object',
				additionalProperties: false,
				required: [
					'id',
					'title',
					'description',
					'targets',
					'dependencies',
					'defaultPrompt',
					'docsAllowlist',
					'componentScopes',
					'rules',
					'checks',
					'source'
				],
				properties: {
					id: { type: 'string' },
					title: { type: 'string' },
					description: { type: 'string' },
					targets: {
						type: 'array',
						items: { enum: ['cli', 'mcp', 'docs', 'skill', 'llms'] }
					},
					dependencies: stringArraySchema(),
					defaultPrompt: { type: 'string' },
					docsAllowlist: stringArraySchema(),
					componentScopes: stringArraySchema(),
					rules: stringArraySchema(),
					checks: stringArraySchema(),
					source: { type: 'string' }
				}
			},
			ai: {
				type: 'object',
				additionalProperties: false,
				required: ['tools', 'prompts', 'cliCommands', 'promptBundles'],
				properties: {
					tools: { type: 'array', items: { $ref: '#/$defs/aiEntry' } },
					prompts: { type: 'array', items: { $ref: '#/$defs/aiEntry' } },
					cliCommands: { type: 'array', items: { $ref: '#/$defs/aiEntry' } },
					promptBundles: { type: 'array', items: { $ref: '#/$defs/promptBundle' } }
				}
			},
			themeImports: {
				type: 'object',
				additionalProperties: false,
				required: ['default', 'dark'],
				properties: {
					default: { type: 'string' },
					dark: { type: 'string' }
				}
			},
			validation: {
				type: 'object',
				additionalProperties: false,
				required: ['checks', 'repairLoop'],
				properties: {
					checks: stringArraySchema(),
					repairLoop: stringArraySchema()
				}
			},
			propSignature: {
				type: 'object',
				additionalProperties: false,
				required: ['signature', 'required', 'bindable'],
				properties: {
					signature: { type: 'string' },
					required: { type: 'boolean' },
					bindable: { type: 'boolean' },
					default: { type: 'string' },
					values: stringArraySchema(),
					description: { type: 'string' },
					note: { type: 'string' }
				}
			},
			part: {
				type: 'object',
				additionalProperties: false,
				required: ['props'],
				properties: {
					props: {
						type: 'object',
						additionalProperties: { $ref: '#/$defs/propSignature' }
					},
					forwards: { type: 'string' }
				}
			},
			antiPattern: {
				type: 'object',
				additionalProperties: false,
				required: ['pattern', 'reason', 'fix'],
				properties: {
					pattern: { type: 'string' },
					reason: { type: 'string' },
					fix: { type: 'string' }
				}
			},
			component: {
				type: 'object',
				additionalProperties: false,
				required: [
					'name',
					'description',
					'category',
					'tags',
					'kind',
					'import',
					'requiredParts',
					'bindableProps',
					'usage',
					'accessibility',
					'antiPatterns',
					'rules',
					'checks'
				],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					category: { type: 'string' },
					tags: stringArraySchema(),
					kind: { enum: ['simple', 'compound', 'namespaced'] },
					import: {
						type: 'object',
						additionalProperties: false,
						required: ['package', 'statement'],
						properties: {
							package: { type: 'string' },
							statement: { type: 'string' },
							subpathStatement: { type: 'string' }
						}
					},
					requiredParts: stringArraySchema(),
					bindableProps: stringArraySchema(),
					props: {
						type: 'object',
						additionalProperties: { $ref: '#/$defs/propSignature' }
					},
					parts: {
						type: 'object',
						additionalProperties: { $ref: '#/$defs/part' }
					},
					structure: stringArraySchema(),
					usage: { type: 'string' },
					accessibility: stringArraySchema(),
					antiPatterns: { type: 'array', items: { $ref: '#/$defs/antiPattern' } },
					rules: stringArraySchema(),
					checks: stringArraySchema()
				}
			},
			recipe: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'description', 'tags', 'components', 'snippet'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					tags: stringArraySchema(),
					components: stringArraySchema(),
					snippet: { type: 'string' }
				}
			}
		}
	};
}

export function buildAgentContractArtifacts(): AgentContractArtifacts {
	const contract = buildAgentContractV1();
	return {
		contract,
		contractJson: JSON.stringify(contract, null, 2),
		schemaJson: JSON.stringify(buildSchema(), null, 2)
	};
}

export async function writeAgentContractArtifacts(): Promise<void> {
	const artifacts = buildAgentContractArtifacts();
	await writeFile(agentContractJsonPath, artifacts.contractJson);
	await writeFile(agentContractSchemaPath, artifacts.schemaJson);
}

export function findAgentComponent(
	contract: AgentContractV1,
	query: string
): AgentComponentContract | null {
	const specLike = Object.fromEntries(
		Object.entries(contract.components).map(([name, component]) => [
			name,
			{
				import: component.import.package,
				description: component.description,
				category: component.category,
				tags: [...component.tags],
				compound: component.kind !== 'simple',
				cssVars: {},
				dataAttributes: [],
				example: component.usage
			} satisfies ComponentDef
		])
	);
	const result = findComponent(query, specLike);
	return result ? (contract.components[result.name] ?? null) : null;
}

function renderList(title: string, values: readonly string[]): string[] {
	if (values.length === 0) return [title, '  none'];
	return [title, ...values.map((value) => `  - ${value}`)];
}

function renderAntiPatterns(component: AgentComponentContract): string[] {
	if (component.antiPatterns.length === 0) return ['Anti-patterns:', '  none recorded'];
	return [
		'Anti-patterns:',
		...component.antiPatterns.map(
			(antiPattern) =>
				`  - Avoid ${antiPattern.pattern}: ${trimSentenceEnd(antiPattern.reason)}. Use ${antiPattern.fix}.`
		)
	];
}

function trimSentenceEnd(value: string): string {
	return value.replace(/[.!?]+$/u, '');
}

function renderPropSummary(component: AgentComponentContract): string[] {
	if (component.props) {
		return ['Props:', ...Object.values(component.props).map((prop) => `  - ${prop.signature}`)];
	}

	if (component.parts) {
		const lines = ['Parts:'];
		for (const [partName, part] of Object.entries(component.parts)) {
			lines.push(`  - ${component.name}.${partName}`);
			for (const prop of Object.values(part.props)) {
				lines.push(`    - ${prop.signature}`);
			}
			if (part.forwards) lines.push(`    - ${part.forwards}`);
		}
		return lines;
	}

	return ['Props:', '  none'];
}

export function renderComponentPrompt(
	contract: AgentContractV1,
	query: string,
	options: { verbose?: boolean } = {}
): string | null {
	const component = findAgentComponent(contract, query);
	if (!component) return null;

	const lines = [
		`DryUI component prompt: ${component.name}`,
		'',
		'Instruction:',
		`  Build real Svelte 5 using ${component.name} from @dryui/ui. Keep output copy-pasteable source, not a custom DSL.`,
		'',
		'Import:',
		`  ${component.import.statement}`
	];

	if (component.import.subpathStatement) {
		lines.push(`  ${component.import.subpathStatement}`);
	}

	lines.push(
		'',
		'Usage:',
		'```svelte',
		component.usage,
		'```',
		'',
		...renderList('Required parts:', component.requiredParts),
		'',
		...renderList('Bindable props:', component.bindableProps),
		'',
		...renderList('Rules:', component.rules),
		'',
		...renderAntiPatterns(component),
		'',
		...renderList('Validation steps:', component.checks)
	);

	if (options.verbose) {
		lines.push(
			'',
			...renderPropSummary(component),
			'',
			...renderList('Accessibility:', component.accessibility)
		);
	}

	return lines.join('\n');
}
