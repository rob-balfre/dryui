import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiSurface, type AiSurfaceEntry } from './ai-surface.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = resolve(__dirname, 'spec.json');
export const contractJsonPath = resolve(__dirname, 'contract.v1.json');
export const contractSchemaPath = resolve(__dirname, 'contract.v1.schema.json');

interface Spec {
	readonly version: string;
	readonly package: string;
	readonly themeImports: {
		readonly default: string;
		readonly dark: string;
	};
	readonly components: Record<string, unknown>;
	readonly composition?: {
		readonly components: Record<string, unknown>;
		readonly recipes: Record<string, unknown>;
	};
	readonly ai?: {
		readonly tools: readonly AiSurfaceEntry[];
		readonly prompts: readonly AiSurfaceEntry[];
		readonly cliCommands: readonly AiSurfaceEntry[];
	};
}

export interface ContractV1 {
	readonly schema: 'DryUIContractV1';
	readonly version: 1;
	readonly package: {
		readonly name: string;
		readonly version: string;
	};
	readonly counts: {
		readonly components: number;
		readonly compositionComponents: number;
		readonly compositionRecipes: number;
		readonly tools: number;
		readonly prompts: number;
		readonly cliCommands: number;
	};
	readonly themeImports: {
		readonly default: string;
		readonly dark: string;
	};
	readonly ai: {
		readonly tools: readonly AiSurfaceEntry[];
		readonly prompts: readonly AiSurfaceEntry[];
		readonly cliCommands: readonly AiSurfaceEntry[];
	};
	readonly components: Record<string, unknown>;
	readonly composition: {
		readonly components: Record<string, unknown>;
		readonly recipes: Record<string, unknown>;
	};
}

export interface ContractArtifacts {
	readonly contract: ContractV1;
	readonly contractJson: string;
	readonly schemaJson: string;
}

function readSpec(): Spec {
	return JSON.parse(readFileSync(specPath, 'utf8')) as Spec;
}

function buildSchema(): Record<string, unknown> {
	return {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'DryUI contract v1',
		type: 'object',
		additionalProperties: false,
		required: [
			'schema',
			'version',
			'package',
			'counts',
			'themeImports',
			'ai',
			'components',
			'composition'
		],
		properties: {
			schema: { const: 'DryUIContractV1' },
			version: { const: 1 },
			package: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'version'],
				properties: {
					name: { type: 'string' },
					version: { type: 'string' }
				}
			},
			counts: {
				type: 'object',
				additionalProperties: false,
				required: [
					'components',
					'compositionComponents',
					'compositionRecipes',
					'tools',
					'prompts',
					'cliCommands'
				],
				properties: {
					components: { type: 'integer', minimum: 0 },
					compositionComponents: { type: 'integer', minimum: 0 },
					compositionRecipes: { type: 'integer', minimum: 0 },
					tools: { type: 'integer', minimum: 0 },
					prompts: { type: 'integer', minimum: 0 },
					cliCommands: { type: 'integer', minimum: 0 }
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
			ai: {
				type: 'object',
				additionalProperties: false,
				required: ['tools', 'prompts', 'cliCommands'],
				properties: {
					tools: { $ref: '#/$defs/aiEntries' },
					prompts: { $ref: '#/$defs/aiEntries' },
					cliCommands: { $ref: '#/$defs/aiEntries' }
				}
			},
			components: {
				type: 'object',
				additionalProperties: { $ref: '#/$defs/componentMetadata' }
			},
			composition: {
				type: 'object',
				additionalProperties: false,
				required: ['components', 'recipes'],
				properties: {
					components: {
						type: 'object',
						additionalProperties: { $ref: '#/$defs/compositionComponent' }
					},
					recipes: {
						type: 'object',
						additionalProperties: { $ref: '#/$defs/compositionRecipe' }
					}
				}
			}
		},
		$defs: {
			aiEntry: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'description'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' }
				}
			},
			aiEntries: {
				type: 'array',
				items: { $ref: '#/$defs/aiEntry' }
			},
			propDef: {
				type: 'object',
				additionalProperties: false,
				required: ['type'],
				properties: {
					type: { type: 'string' },
					required: { type: 'boolean' },
					bindable: { type: 'boolean' },
					default: { type: 'string' },
					acceptedValues: { type: 'array', items: { type: 'string' } },
					description: { type: 'string' },
					note: { type: 'string' }
				}
			},
			dataAttribute: {
				type: 'object',
				additionalProperties: false,
				required: ['name'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					values: { type: 'array', items: { type: 'string' } }
				}
			},
			forwardedProps: {
				type: 'object',
				additionalProperties: false,
				required: ['baseType', 'via', 'note'],
				properties: {
					baseType: { type: 'string' },
					via: { const: 'rest' },
					element: { type: 'string' },
					examples: { type: 'array', items: { type: 'string' } },
					omitted: { type: 'array', items: { type: 'string' } },
					note: { type: 'string' }
				}
			},
			part: {
				type: 'object',
				additionalProperties: false,
				required: ['props'],
				properties: {
					props: { type: 'object', additionalProperties: { $ref: '#/$defs/propDef' } },
					forwardedProps: { anyOf: [{ $ref: '#/$defs/forwardedProps' }, { type: 'null' }] }
				}
			},
			structure: {
				type: 'object',
				additionalProperties: false,
				required: ['tree'],
				properties: {
					tree: { type: 'array', items: { type: 'string' } },
					note: { type: 'string' }
				}
			},
			componentMetadata: {
				type: 'object',
				additionalProperties: false,
				required: [
					'import',
					'description',
					'category',
					'tags',
					'compound',
					'cssVars',
					'dataAttributes',
					'example'
				],
				properties: {
					import: { type: 'string' },
					description: { type: 'string' },
					category: { type: 'string' },
					tags: { type: 'array', items: { type: 'string' } },
					compound: { type: 'boolean' },
					props: { type: 'object', additionalProperties: { $ref: '#/$defs/propDef' } },
					parts: { type: 'object', additionalProperties: { $ref: '#/$defs/part' } },
					forwardedProps: { anyOf: [{ $ref: '#/$defs/forwardedProps' }, { type: 'null' }] },
					groups: {
						type: 'array',
						items: {
							type: 'object',
							additionalProperties: false,
							required: ['name', 'props'],
							properties: {
								name: { type: 'string' },
								props: { type: 'array', items: { type: 'string' } }
							}
						}
					},
					structure: { anyOf: [{ $ref: '#/$defs/structure' }, { type: 'null' }] },
					a11y: { type: 'array', items: { type: 'string' } },
					cssVars: { type: 'object', additionalProperties: { type: 'string' } },
					dataAttributes: { type: 'array', items: { $ref: '#/$defs/dataAttribute' } },
					example: { type: 'string' }
				}
			},
			compositionAlternative: {
				type: 'object',
				additionalProperties: false,
				required: ['rank', 'component', 'useWhen', 'snippet'],
				properties: {
					rank: { type: 'integer', minimum: 0 },
					component: { type: 'string' },
					useWhen: { type: 'string' },
					snippet: { type: 'string' }
				}
			},
			compositionAntiPattern: {
				type: 'object',
				additionalProperties: false,
				required: ['pattern', 'reason', 'fix'],
				properties: {
					pattern: { type: 'string' },
					reason: { type: 'string' },
					fix: { type: 'string' }
				}
			},
			compositionComponent: {
				type: 'object',
				additionalProperties: false,
				required: ['component', 'useWhen', 'alternatives', 'antiPatterns', 'combinesWith'],
				properties: {
					component: { type: 'string' },
					useWhen: { type: 'string' },
					alternatives: { type: 'array', items: { $ref: '#/$defs/compositionAlternative' } },
					antiPatterns: { type: 'array', items: { $ref: '#/$defs/compositionAntiPattern' } },
					combinesWith: { type: 'array', items: { type: 'string' } }
				}
			},
			compositionRecipe: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'description', 'tags', 'components', 'snippet'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					tags: { type: 'array', items: { type: 'string' } },
					components: { type: 'array', items: { type: 'string' } },
					snippet: { type: 'string' }
				}
			}
		}
	};
}

export function buildContractV1(): ContractV1 {
	const spec = readSpec();
	const ai = spec.ai ?? aiSurface;
	return {
		schema: 'DryUIContractV1',
		version: 1,
		package: {
			name: spec.package,
			version: spec.version
		},
		counts: {
			components: Object.keys(spec.components).length,
			compositionComponents: Object.keys(spec.composition?.components ?? {}).length,
			compositionRecipes: Object.keys(spec.composition?.recipes ?? {}).length,
			tools: ai.tools.length,
			prompts: ai.prompts.length,
			cliCommands: ai.cliCommands.length
		},
		themeImports: spec.themeImports,
		ai,
		components: spec.components,
		composition: {
			components: spec.composition?.components ?? {},
			recipes: spec.composition?.recipes ?? {}
		}
	};
}

export function buildContractArtifacts(): ContractArtifacts {
	const contract = buildContractV1();
	return {
		contract,
		contractJson: JSON.stringify(contract, null, 2),
		schemaJson: JSON.stringify(buildSchema(), null, 2)
	};
}

export async function writeContractArtifacts(): Promise<void> {
	const artifacts = buildContractArtifacts();
	await writeFile(contractJsonPath, artifacts.contractJson);
	await writeFile(contractSchemaPath, artifacts.schemaJson);
}
