import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { Spec } from './spec-types.js';
import { runAsk, type AskScope, type AskListKind } from './tools/ask.js';
import { runCheck, runCheckStructured } from './tools/check.js';
import { toolErrorResponse } from './tools/tool-error.js';

const require = createRequire(import.meta.url);
const pkg: unknown = require('../package.json');
const version =
	typeof pkg === 'object' && pkg !== null && 'version' in pkg ? String(pkg.version) : '0.0.0';
const specPath = new URL('./spec.json', import.meta.url);

type RuntimeSpec = Spec & Record<string, unknown>;

function loadRuntimeSpec(): RuntimeSpec {
	return JSON.parse(readFileSync(specPath, 'utf-8')) as RuntimeSpec;
}

let cachedSpec: RuntimeSpec | null = null;
function getSpec(): RuntimeSpec {
	if (!cachedSpec) {
		cachedSpec = loadRuntimeSpec();
	}
	return cachedSpec;
}

const server = new McpServer({ name: '@dryui/mcp', version }, { instructions: '' });

const ASK_SCOPES = ['component', 'recipe', 'list', 'setup'] as const satisfies readonly AskScope[];
const ASK_KINDS = ['component', 'token'] as const satisfies readonly AskListKind[];

const ASK_DESC = [
	'Collapse DryUI discovery into a single scope-driven tool.\n\n',
	'Input: a query plus an explicit scope.\n',
	'- `component`: full component reference, anti-patterns, and adoption context\n',
	'- `recipe`: composition recipes only, filtered away from component matches\n',
	'- `list`: components and tokens in one response, optionally filtered by `kind`\n',
	'- `setup`: project detection plus inline install plan\n\n',
	'Output: TOON with `kind`, `matches`, and `next[]` steering toward `check`.'
].join('');

server.tool(
	'ask',
	ASK_DESC,
	{
		query: z.string().describe('Search query or component name. Can be empty for list/setup.'),
		scope: z.enum(ASK_SCOPES).describe('Discovery scope: component, recipe, list, or setup.'),
		kind: z.enum(ASK_KINDS).optional().describe('Optional list filter: component or token.'),
		cwd: z
			.string()
			.optional()
			.describe(
				'Target project directory for setup and component install-plan lookups. Required in monorepos — without it the MCP server falls back to its own working directory, which may point at the wrong workspace.'
			)
	},
	async ({ query, scope, kind, cwd }) => {
		try {
			const text = runAsk(
				getSpec(),
				{
					query,
					scope,
					...(kind ? { kind } : {})
				},
				cwd ? { cwd } : {}
			);
			return { content: [{ type: 'text', text }] };
		} catch (error) {
			return toolErrorResponse(error);
		}
	}
);

const CHECK_DESC = [
	'Collapse DryUI validation into a single path-driven tool.\n\n',
	'Input: optional `path`.\n',
	'- no path: workspace scan\n',
	'- `.svelte` file: component review (contract + a11y)\n',
	'- `.css` file: theme diagnosis (tokens + contrast + pairings)\n',
	'- directory: workspace scan scoped to that directory\n\n',
	'Output: unified TOON with `issues`, aggregates, and `next[]` steering back toward `ask`.'
].join('');

server.tool(
	'check',
	CHECK_DESC,
	{
		path: z
			.string()
			.optional()
			.describe('Optional file or directory path. Omit for a workspace-wide scan.'),
		cwd: z
			.string()
			.optional()
			.describe(
				'Target project directory for workspace scans and relative path resolution. Required in monorepos — without it the MCP server falls back to its own working directory, which may point at the wrong workspace.'
			)
	},
	async ({ path, cwd }) => {
		try {
			const input = {
				...(path ? { path } : {})
			};
			const result = runCheckStructured(getSpec(), input, cwd ? { cwd } : {});
			// Two content blocks: humans read the TOON summary, agents parse the
			// fenced JSON for repair loops. Clients that only surface the first
			// block still see the human output.
			const diagnosticsJson = JSON.stringify(
				{ summary: result.summary, diagnostics: result.diagnostics },
				null,
				2
			);
			return {
				content: [
					{ type: 'text', text: result.text },
					{ type: 'text', text: `\`\`\`json dryui-diagnostics\n${diagnosticsJson}\n\`\`\`` }
				]
			};
		} catch (error) {
			return toolErrorResponse(error);
		}
	}
);

function safeRun(runner: () => string): string {
	try {
		return runner();
	} catch (error) {
		const response = toolErrorResponse(error);
		return response.content[0]?.text ?? 'error';
	}
}

server.registerPrompt(
	'dryui-ask',
	{
		title: 'DryUI Ask',
		description: 'Discover the right DryUI component, recipe, list, or setup guidance',
		argsSchema: {
			query: z.string().describe('Search query or component name'),
			scope: z.enum(ASK_SCOPES),
			kind: z.enum(ASK_KINDS).optional()
		}
	},
	async ({ query, scope, kind }) => ({
		messages: [
			{
				role: 'user',
				content: {
					type: 'text',
					text: `Use DryUI ask scope "${scope}" for: ${query || '(empty query)'}`
				}
			},
			{
				role: 'assistant',
				content: {
					type: 'text',
					text: safeRun(() =>
						runAsk(getSpec(), {
							query,
							scope,
							...(kind ? { kind } : {})
						})
					)
				}
			}
		]
	})
);

server.registerPrompt(
	'dryui-check',
	{
		title: 'DryUI Check',
		description: 'Validate a DryUI component, theme file, directory, or workspace',
		argsSchema: {
			path: z.string().optional().describe('Optional file or directory path')
		}
	},
	async ({ path }) => ({
		messages: [
			{
				role: 'user',
				content: {
					type: 'text',
					text: `Run DryUI check${path ? ` for ${path}` : ' for the current workspace'}`
				}
			},
			{
				role: 'assistant',
				content: {
					type: 'text',
					text: safeRun(() => runCheck(getSpec(), path ? { path } : {}))
				}
			}
		]
	})
);

const transport = new StdioServerTransport();
await server.connect(transport);
