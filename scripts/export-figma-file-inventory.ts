import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

interface FigmaNode {
	id: string;
	name: string;
	type: string;
	children?: FigmaNode[];
}

interface FigmaFileResponse {
	name: string;
	lastModified: string;
	editorType: string;
	role: string;
	document: FigmaNode;
}

interface FigmaNodesResponse {
	nodes: Record<
		string,
		| {
				document: FigmaNode | null;
		  }
		| undefined
	>;
}

interface InventoryCanvasChild {
	id: string;
	name: string;
	type: string;
}

interface InventoryCanvas {
	id: string;
	name: string;
	type: string;
	children: InventoryCanvasChild[];
}

interface FigmaInventory {
	generatedAt: string;
	fileKey: string;
	fileName: string;
	lastModified: string;
	editorType: string;
	role: string;
	topLevelCanvasCount: number;
	warnings: string[];
	canvases: InventoryCanvas[];
}

interface CliOptions {
	fileKey: string;
	outDir: string;
	slug?: string;
	includeChildren: boolean;
}

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const DEFAULT_OUT_DIR = resolve(import.meta.dir, '..', 'docs', 'research', 'figma');

function parseArgs(argv: readonly string[]): CliOptions {
	let fileKey = process.env.FIGMA_FILE_KEY;
	let outDir = DEFAULT_OUT_DIR;
	let slug = process.env.FIGMA_FILE_SLUG;
	let includeChildren = true;

	for (let index = 2; index < argv.length; index += 1) {
		const arg = argv[index];
		const value = argv[index + 1];

		if (arg === '--file-key') {
			if (!value) {
				throw new Error('Missing value for --file-key.');
			}
			fileKey = value;
			index += 1;
			continue;
		}

		if (arg === '--out-dir') {
			if (!value) {
				throw new Error('Missing value for --out-dir.');
			}
			outDir = resolve(value);
			index += 1;
			continue;
		}

		if (arg === '--slug') {
			if (!value) {
				throw new Error('Missing value for --slug.');
			}
			slug = value;
			index += 1;
			continue;
		}

		if (arg === '--help') {
			printHelp();
			process.exit(0);
		}

		if (arg === '--top-level-only') {
			includeChildren = false;
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	if (!fileKey) {
		throw new Error('Missing file key. Pass --file-key or set FIGMA_FILE_KEY.');
	}

	return { fileKey, outDir, slug, includeChildren };
}

function printHelp(): void {
	console.log(`Usage:

  bun run scripts/export-figma-file-inventory.ts --file-key <figma-file-key> [--slug <name>] [--out-dir <path>] [--top-level-only]

Environment:

  FIGMA_ACCESS_TOKEN   Required. Personal access token with file_content:read
  FIGMA_FILE_KEY       Optional alternative to --file-key
  FIGMA_FILE_SLUG      Optional alternative to --slug
`);
}

function getAccessToken(): string {
	const token = process.env.FIGMA_ACCESS_TOKEN;
	if (!token) {
		throw new Error('Missing FIGMA_ACCESS_TOKEN.');
	}
	return token;
}

async function fetchFile(
	fileKey: string,
	depth: number,
	token: string
): Promise<FigmaFileResponse> {
	const url = new URL(`${FIGMA_API_BASE}/files/${fileKey}`);
	url.searchParams.set('depth', String(depth));

	const response = await fetch(url, {
		headers: {
			'X-Figma-Token': token
		}
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Figma API ${response.status} for depth=${depth}: ${body}`);
	}

	return (await response.json()) as FigmaFileResponse;
}

async function fetchNodes(
	fileKey: string,
	ids: readonly string[],
	token: string
): Promise<FigmaNodesResponse> {
	const url = new URL(`${FIGMA_API_BASE}/files/${fileKey}/nodes`);
	url.searchParams.set('ids', ids.join(','));
	url.searchParams.set('depth', '1');

	const response = await fetch(url, {
		headers: {
			'X-Figma-Token': token
		}
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Figma API ${response.status} for nodes: ${body}`);
	}

	return (await response.json()) as FigmaNodesResponse;
}

function normalizeCanvases(document: FigmaNode): InventoryCanvas[] {
	return (document.children ?? []).map((canvas) => ({
		id: canvas.id,
		name: canvas.name,
		type: canvas.type,
		children: []
	}));
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function buildInventory(fileKey: string, file: FigmaFileResponse): FigmaInventory {
	const canvases = normalizeCanvases(file.document);

	return {
		generatedAt: new Date().toISOString(),
		fileKey,
		fileName: file.name,
		lastModified: file.lastModified,
		editorType: file.editorType,
		role: file.role,
		topLevelCanvasCount: canvases.length,
		warnings: [],
		canvases
	};
}

function chunk<T>(items: readonly T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}
	return chunks;
}

async function hydrateCanvasChildren(
	inventory: FigmaInventory,
	token: string
): Promise<FigmaInventory> {
	const ids = inventory.canvases.map((canvas) => canvas.id);
	const childrenById = new Map<string, InventoryCanvasChild[]>();

	for (const batch of chunk(ids, 40)) {
		try {
			const response = await fetchNodes(inventory.fileKey, batch, token);
			for (const id of batch) {
				const node = response.nodes[id]?.document;
				childrenById.set(
					id,
					(node?.children ?? []).map((child) => ({
						id: child.id,
						name: child.name,
						type: child.type
					}))
				);
			}
		} catch (error) {
			inventory.warnings.push(
				`Direct child panel fetch stopped early: ${error instanceof Error ? error.message : String(error)}`
			);
			break;
		}
	}

	inventory.canvases = inventory.canvases.map((canvas) => ({
		...canvas,
		children: childrenById.get(canvas.id) ?? []
	}));

	return inventory;
}

function renderMarkdown(inventory: FigmaInventory): string {
	const lines: string[] = [];

	lines.push(`# ${inventory.fileName} inventory`);
	lines.push('');
	lines.push(`- Generated: \`${inventory.generatedAt}\``);
	lines.push(`- File key: \`${inventory.fileKey}\``);
	lines.push(`- Last modified: \`${inventory.lastModified}\``);
	lines.push(`- Editor type: \`${inventory.editorType}\``);
	lines.push(`- Access role: \`${inventory.role}\``);
	lines.push(`- Top-level canvases: \`${inventory.topLevelCanvasCount}\``);

	if (inventory.warnings.length > 0) {
		lines.push('');
		lines.push('## Warnings');
		lines.push('');
		for (const warning of inventory.warnings) {
			lines.push(`- ${warning}`);
		}
	}

	lines.push('');
	lines.push('## Top-level canvases');
	lines.push('');

	for (const canvas of inventory.canvases) {
		lines.push(`- \`${canvas.name}\` (\`${canvas.id}\`)`);
	}

	const canvasesWithChildren = inventory.canvases.filter((canvas) => canvas.children.length > 0);
	if (canvasesWithChildren.length > 0) {
		lines.push('');
		lines.push('## Direct child panels');
		lines.push('');

		for (const canvas of canvasesWithChildren) {
			lines.push(`### ${canvas.name}`);
			lines.push('');
			for (const child of canvas.children) {
				lines.push(`- \`${child.name}\` (\`${child.id}\`, \`${child.type}\`)`);
			}
			lines.push('');
		}
	}

	return `${lines.join('\n').trim()}\n`;
}

async function ensureOutDir(outDir: string): Promise<void> {
	await mkdir(outDir, { recursive: true });
}

async function main(): Promise<void> {
	const options = parseArgs(Bun.argv);
	const token = getAccessToken();

	const file = await fetchFile(options.fileKey, 1, token);
	let inventory = buildInventory(options.fileKey, file);

	if (options.includeChildren) {
		inventory = await hydrateCanvasChildren(inventory, token);
	}

	const slug = options.slug ?? slugify(inventory.fileName);

	await ensureOutDir(options.outDir);

	const jsonPath = resolve(options.outDir, `${slug}.inventory.json`);
	const markdownPath = resolve(options.outDir, `${slug}.inventory.md`);

	await Bun.write(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
	await Bun.write(markdownPath, renderMarkdown(inventory));

	console.log(`Wrote ${jsonPath}`);
	console.log(`Wrote ${markdownPath}`);
}

await main();
