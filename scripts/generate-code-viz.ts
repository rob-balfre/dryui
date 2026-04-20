import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';

type WorkspaceKind = 'app' | 'package';

type WorkspaceEntry = {
	absDir: string;
	dir: string;
	kind: WorkspaceKind;
	name: string;
	shortName: string;
	sourceRoots: SourceRoot[];
};

type SourceRoot = {
	absPath: string;
	label: string;
	relPath: string;
};

type SourceFile = {
	absPath: string;
	directoryBucket: string;
	id: string;
	label: string;
	relPath: string;
	relWithinSourceRoot: string;
	sourceRootLabel: string;
	workspaceName: string;
};

type GraphNode = {
	color: string;
	id: string;
	inDegree: number;
	label: string;
	meta: Record<string, number | string>;
	outDegree: number;
	path?: string;
	size: number;
};

type GraphEdge = {
	id: string;
	label?: string;
	source: string;
	target: string;
	weight: number;
	width: number;
};

type Graph = {
	description: string;
	edges: GraphEdge[];
	nodes: GraphNode[];
	title: string;
};

type WorkspaceGraphSummary = {
	directoryBuckets: number;
	directoryEdges: number;
	fileEdges: number;
	sourceFiles: number;
	sourceRoots: string[];
};

type GraphPayload = {
	generatedAt: string;
	packageOptions: Array<{ label: string; value: string }>;
	packages: Record<
		string,
		{
			directoryGraph: Graph;
			fileGraph: Graph;
			summary: WorkspaceGraphSummary;
			workspace: Pick<WorkspaceEntry, 'dir' | 'kind' | 'name' | 'shortName'>;
		}
	>;
	repo: string;
	scanSummary: {
		packageEdges: number;
		scannedFiles: number;
		workspaces: number;
	};
	workspaceGraph: Graph;
};

type MutableNode = {
	color: string;
	id: string;
	label: string;
	meta: Record<string, number | string>;
	path?: string;
};

type MutableEdge = {
	id: string;
	label?: string;
	source: string;
	sourceFiles: Set<string>;
	specifiers: Set<string>;
	target: string;
	weight: number;
};

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const reportsDir = resolve(repoRoot, 'reports');
const outputJsonPath = resolve(reportsDir, 'code-viz.graph.json');
const outputHtmlPath = resolve(reportsDir, 'code-viz.html');
const outputMarkdownPath = resolve(reportsDir, 'code-viz.md');

const SOURCE_EXTENSIONS = ['.ts', '.js', '.svelte', '.mjs', '.cjs', '.json'];
const EXTENSION_ALIASES: Record<string, string[]> = {
	'.cjs': ['.cjs', '.cts', '.ts', '.js'],
	'.js': ['.js', '.ts', '.svelte', '.json'],
	'.json': ['.json'],
	'.mjs': ['.mjs', '.mts', '.ts', '.js'],
	'.svelte': ['.svelte'],
	'.ts': ['.ts', '.js']
};
const IGNORED_DIRS = new Set([
	'.git',
	'.svelte-kit',
	'coverage',
	'dist',
	'node_modules',
	'build',
	'__tests__'
]);
const TEST_FILE_RE = /\.(test|spec)\.(cjs|cts|js|jsx|mjs|mts|svelte|ts|tsx)$/u;
const D_TS_RE = /\.d\.ts$/u;
const IMPORT_RE =
	/\bimport\s+(?:type\s+)?(?:[^'"`]+?\s+from\s*)?['"]([^'"]+)['"]|\bexport\s+(?:type\s+)?[^'"`]+?\s+from\s*['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/gu;
const COLORS = [
	'#b75a30',
	'#467c96',
	'#6d8a5b',
	'#8f5fa8',
	'#9b6b3f',
	'#3d7c6f',
	'#7f5b65',
	'#5968a8',
	'#9a7c2d',
	'#4a6a88'
];

function toPosix(path: string): string {
	return path.split(sep).join('/');
}

function repoRelative(path: string): string {
	return toPosix(relative(repoRoot, path));
}

function shortWorkspaceName(name: string): string {
	return name.replace(/^@dryui\//u, '');
}

function hashString(value: string): number {
	let hash = 0;
	for (const char of value) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return hash;
}

function colorFor(value: string): string {
	return COLORS[hashString(value) % COLORS.length] ?? COLORS[0];
}

function isDirectory(path: string): boolean {
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

function isSourceFile(path: string): boolean {
	if (D_TS_RE.test(path) || TEST_FILE_RE.test(path)) return false;
	return SOURCE_EXTENSIONS.includes(extname(path));
}

function stripExtension(path: string): string {
	const extension = extname(path);
	return extension ? path.slice(0, -extension.length) : path;
}

function resolveCandidatePath(basePath: string): string | null {
	if (isFile(basePath)) return basePath;

	const extension = extname(basePath);
	if (extension) {
		for (const variant of EXTENSION_ALIASES[extension] ?? [extension]) {
			const swapped = `${stripExtension(basePath)}${variant}`;
			if (isFile(swapped)) return swapped;
		}
	}

	for (const candidateExtension of SOURCE_EXTENSIONS) {
		const candidate = `${basePath}${candidateExtension}`;
		if (isFile(candidate)) return candidate;
	}

	if (isDirectory(basePath)) {
		for (const candidateExtension of SOURCE_EXTENSIONS) {
			const candidate = join(basePath, `index${candidateExtension}`);
			if (isFile(candidate)) return candidate;
		}
	}

	return null;
}

function extractSpecifiers(source: string): string[] {
	const specifiers: string[] = [];
	let match: RegExpExecArray | null = null;
	IMPORT_RE.lastIndex = 0;
	while ((match = IMPORT_RE.exec(source)) !== null) {
		const specifier = match[1] ?? match[2] ?? match[3];
		if (specifier) specifiers.push(specifier);
	}
	return specifiers;
}

function matchWorkspaceImport(
	specifier: string,
	workspacesByName: Map<string, WorkspaceEntry>
): WorkspaceEntry | null {
	const workspaceNames = [...workspacesByName.keys()].sort(
		(left, right) => right.length - left.length
	);
	for (const workspaceName of workspaceNames) {
		if (specifier === workspaceName || specifier.startsWith(`${workspaceName}/`)) {
			return workspacesByName.get(workspaceName) ?? null;
		}
	}
	return null;
}

function resolveLocalImport(
	file: SourceFile,
	workspace: WorkspaceEntry,
	specifier: string
): string | null {
	if (specifier.startsWith('./') || specifier.startsWith('../')) {
		return resolveCandidatePath(resolve(dirname(file.absPath), specifier));
	}

	if (specifier === '$lib' || specifier.startsWith('$lib/')) {
		const libRoot = resolve(workspace.absDir, 'src/lib');
		const suffix = specifier === '$lib' ? '' : specifier.slice('$lib/'.length);
		return resolveCandidatePath(resolve(libRoot, suffix));
	}

	return null;
}

function readWorkspaceDirs(baseDir: string): string[] {
	if (!isDirectory(baseDir)) return [];
	return readdirSync(baseDir).filter((entry) => isDirectory(join(baseDir, entry)));
}

async function detectSourceRoots(workspaceDir: string): Promise<SourceRoot[]> {
	const roots: SourceRoot[] = [];
	const primaryRoot = resolve(workspaceDir, 'src');
	if (isDirectory(primaryRoot)) {
		roots.push({
			absPath: primaryRoot,
			label: 'src',
			relPath: repoRelative(primaryRoot)
		});
	}

	for (const child of readWorkspaceDirs(workspaceDir)) {
		const nestedRoot = resolve(workspaceDir, child, 'src');
		if (!isDirectory(nestedRoot)) continue;
		roots.push({
			absPath: nestedRoot,
			label: `${child}/src`,
			relPath: repoRelative(nestedRoot)
		});
	}

	return roots.sort((left, right) => left.relPath.localeCompare(right.relPath));
}

async function collectWorkspaces(): Promise<WorkspaceEntry[]> {
	const entries: WorkspaceEntry[] = [];

	for (const [kind, base] of [
		['package', 'packages'],
		['app', 'apps']
	] as const) {
		const baseDir = resolve(repoRoot, base);
		for (const child of readWorkspaceDirs(baseDir)) {
			const absDir = resolve(baseDir, child);
			const packageJsonPath = resolve(absDir, 'package.json');
			if (!existsSync(packageJsonPath)) continue;
			const raw = await readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(raw) as { name?: string };
			const name = packageJson.name ?? `${base}/${child}`;
			entries.push({
				absDir,
				dir: repoRelative(absDir),
				kind,
				name,
				shortName: shortWorkspaceName(name),
				sourceRoots: await detectSourceRoots(absDir)
			});
		}
	}

	return entries.sort((left, right) => left.name.localeCompare(right.name));
}

function collectSourceFilesForRoot(
	root: SourceRoot,
	workspace: WorkspaceEntry,
	output: SourceFile[]
): void {
	const walk = (dir: string): void => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (IGNORED_DIRS.has(entry.name)) continue;
			const absPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(absPath);
				continue;
			}
			if (!entry.isFile() || !isSourceFile(absPath)) continue;

			const relWithinSourceRoot = toPosix(relative(root.absPath, absPath));
			const firstSegment = relWithinSourceRoot.split('/')[0] ?? basename(relWithinSourceRoot);
			const rootPrefix = root.label === 'src' ? '' : `${root.label}/`;
			const directoryBucket =
				firstSegment && firstSegment.includes('.')
					? `${rootPrefix}${stripExtension(firstSegment)}`
					: `${rootPrefix}${firstSegment}`;

			output.push({
				absPath,
				directoryBucket,
				id: repoRelative(absPath),
				label: `${rootPrefix}${relWithinSourceRoot}`,
				relPath: repoRelative(absPath),
				relWithinSourceRoot,
				sourceRootLabel: root.label,
				workspaceName: workspace.name
			});
		}
	};

	walk(root.absPath);
}

function addEdge(
	map: Map<string, MutableEdge>,
	source: string,
	target: string,
	sourceFile: string,
	specifier: string,
	label?: string
): void {
	const id = `${source}=>${target}`;
	const existing = map.get(id);
	if (existing) {
		existing.weight += 1;
		existing.sourceFiles.add(sourceFile);
		existing.specifiers.add(specifier);
		return;
	}

	map.set(id, {
		id,
		label,
		source,
		sourceFiles: new Set([sourceFile]),
		specifiers: new Set([specifier]),
		target,
		weight: 1
	});
}

function finalizeGraph(
	title: string,
	description: string,
	nodes: MutableNode[],
	edges: MutableEdge[]
): Graph {
	const inDegree = new Map<string, number>();
	const outDegree = new Map<string, number>();

	for (const edge of edges) {
		outDegree.set(edge.source, (outDegree.get(edge.source) ?? 0) + edge.weight);
		inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + edge.weight);
	}

	const finalizedNodes = nodes
		.map((node) => {
			const incoming = inDegree.get(node.id) ?? 0;
			const outgoing = outDegree.get(node.id) ?? 0;
			const activity = incoming + outgoing;
			return {
				color: node.color,
				id: node.id,
				inDegree: incoming,
				label: node.label,
				meta: node.meta,
				outDegree: outgoing,
				path: node.path,
				size: Math.max(18, Math.min(70, 20 + Math.log2(activity + 1) * 10))
			};
		})
		.sort((left, right) => left.label.localeCompare(right.label));

	const finalizedEdges = edges
		.map((edge) => ({
			id: edge.id,
			label: edge.label,
			source: edge.source,
			target: edge.target,
			weight: edge.weight,
			width: Math.max(1.5, Math.min(9, 1 + Math.log2(edge.weight + 1) * 1.8))
		}))
		.sort((left, right) => left.id.localeCompare(right.id));

	return {
		description,
		edges: finalizedEdges,
		nodes: finalizedNodes,
		title
	};
}

function buildDirectoryGraph(
	workspace: WorkspaceEntry,
	files: SourceFile[],
	fileEdges: Map<string, MutableEdge>
): Graph {
	const directoryNodes = new Map<string, MutableNode>();
	const directoryEdges = new Map<string, MutableEdge>();
	const fileById = new Map(files.map((file) => [file.id, file]));

	for (const file of files) {
		if (directoryNodes.has(file.directoryBucket)) continue;
		directoryNodes.set(file.directoryBucket, {
			color: colorFor(file.directoryBucket),
			id: file.directoryBucket,
			label: file.directoryBucket,
			meta: {
				workspace: workspace.shortName
			}
		});
	}

	for (const edge of fileEdges.values()) {
		const sourceFile = fileById.get(edge.source);
		const targetFile = fileById.get(edge.target);
		if (!sourceFile || !targetFile) continue;
		const sourceBucket = sourceFile.directoryBucket;
		const targetBucket = targetFile.directoryBucket;
		if (sourceBucket === targetBucket) continue;
		addEdge(directoryEdges, sourceBucket, targetBucket, sourceFile.id, 'internal');
	}

	for (const node of directoryNodes.values()) {
		const fileCount = files.filter((file) => file.directoryBucket === node.id).length;
		node.meta.fileCount = fileCount;
		node.meta.kind = 'directory';
	}

	return finalizeGraph(
		`${workspace.shortName} directory graph`,
		'Actual imports aggregated by top-level source bucket inside the selected workspace.',
		[...directoryNodes.values()],
		[...directoryEdges.values()]
	);
}

function createHtml(payload: GraphPayload): string {
	const embedded = JSON.stringify(payload).replace(/</gu, '\\u003c');

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DryUI Code Graph</title>
    <script src="https://unpkg.com/cytoscape@3.30.4/dist/cytoscape.min.js"></script>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4efe8;
        --surface: rgba(255, 251, 245, 0.92);
        --surface-strong: #fffaf4;
        --border: rgba(74, 49, 22, 0.16);
        --text: #291c10;
        --muted: #68523d;
        --accent: #b75a30;
        --shadow: 0 16px 36px rgba(72, 48, 25, 0.1);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(228, 176, 116, 0.2), transparent 24%),
          radial-gradient(circle at top right, rgba(157, 202, 215, 0.22), transparent 24%),
          linear-gradient(180deg, #f8f4ed 0%, var(--bg) 100%);
      }

      main {
        width: min(1400px, calc(100vw - 24px));
        margin: 16px auto 28px;
      }

      .hero,
      .panel,
      .control,
      .stat,
      #graph {
        border: 1px solid var(--border);
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .hero {
        padding: 24px 26px;
        border-radius: 24px;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 4vw, 3.2rem);
        letter-spacing: -0.04em;
      }

      .lede {
        margin-top: 10px;
        max-width: 72ch;
        color: var(--muted);
        line-height: 1.55;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 14px;
      }

      .stat {
        padding: 14px 16px;
        border-radius: 18px;
      }

      .stat strong {
        display: block;
        font-size: 1.8rem;
        line-height: 1;
      }

      .stat span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
      }

      .layout {
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr) 280px;
        gap: 14px;
        margin-top: 14px;
      }

      .panel {
        padding: 16px;
        border-radius: 22px;
        background: var(--surface-strong);
      }

      .panel h2 {
        font-size: 1.25rem;
        margin-bottom: 8px;
      }

      .panel p,
      .meta,
      .small {
        color: var(--muted);
        line-height: 1.5;
      }

      .controls {
        display: grid;
        gap: 10px;
      }

      .control {
        padding: 12px;
        border-radius: 16px;
      }

      label {
        display: block;
        font-size: 0.95rem;
        font-weight: 700;
      }

      select,
      input,
      button {
        width: 100%;
        margin-top: 6px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #fffaf4;
        color: var(--text);
        padding: 10px 12px;
        font: inherit;
      }

      .checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .checkbox input {
        width: auto;
        margin: 0;
      }

      #graph {
        height: calc(100vh - 210px);
        min-height: 700px;
        border-radius: 22px;
      }

      .list {
        margin-top: 10px;
        display: grid;
        gap: 8px;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        padding: 6px 10px;
        background: rgba(183, 90, 48, 0.1);
        color: var(--text);
        font-size: 0.92rem;
      }

      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--swatch, #999);
      }

      .details {
        display: grid;
        gap: 10px;
      }

      .details-card {
        padding: 12px;
        border-radius: 16px;
        background: rgba(255, 250, 244, 0.9);
        border: 1px solid var(--border);
      }

      .details-card dt {
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }

      .details-card dd {
        margin: 2px 0 10px;
      }

      .empty {
        color: var(--muted);
      }

      .muted {
        color: var(--muted);
      }

      @media (max-width: 1180px) {
        .layout {
          grid-template-columns: 1fr;
        }

        #graph {
          height: 72vh;
          min-height: 520px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>DryUI Code Graph</h1>
        <p class="lede">
          Generated from actual source imports on ${payload.generatedAt.slice(0, 10)}. The workspace graph shows imports between workspaces. The directory and file graphs show resolved internal imports inside a selected workspace.
        </p>
        <section class="stats">
          <article class="stat">
            <strong>${payload.scanSummary.scannedFiles}</strong>
            <span>source files scanned</span>
          </article>
          <article class="stat">
            <strong>${payload.scanSummary.workspaces}</strong>
            <span>workspaces</span>
          </article>
          <article class="stat">
            <strong>${payload.scanSummary.packageEdges}</strong>
            <span>workspace import edges</span>
          </article>
        </section>
      </section>

      <section class="layout">
        <aside class="panel">
          <h2>Controls</h2>
          <div class="controls">
            <div class="control">
              <label for="graph-level">Graph</label>
              <select id="graph-level">
                <option value="workspace">Workspace</option>
                <option value="directory">Directory</option>
                <option value="file">File</option>
              </select>
            </div>
            <div class="control">
              <label for="package-select">Workspace</label>
              <select id="package-select"></select>
            </div>
            <div class="control">
              <label for="search">Search nodes</label>
              <input id="search" type="search" placeholder="button, tools, docs..." />
            </div>
            <div class="control checkbox">
              <input id="hide-isolates" type="checkbox" checked />
              <label for="hide-isolates">Hide isolated nodes</label>
            </div>
            <div class="control checkbox">
              <input id="show-labels" type="checkbox" />
              <label for="show-labels">Show labels</label>
            </div>
            <div class="control">
              <button id="reset-view" type="button">Reset view</button>
            </div>
          </div>

          <div class="list" id="legend"></div>
        </aside>

        <section class="panel">
          <h2 id="graph-title">Graph</h2>
          <p id="graph-description" class="meta"></p>
          <p id="graph-meta" class="small" style="margin-top: 8px;"></p>
          <div id="graph"></div>
        </section>

        <aside class="panel">
          <h2>Selection</h2>
          <div id="details" class="details">
            <p class="empty">Click a node to inspect it.</p>
          </div>
        </aside>
      </section>
    </main>

    <script>
      window.__CODE_GRAPH__ = ${embedded};
    </script>
    <script>
      const payload = window.__CODE_GRAPH__;
      const packageSelect = document.getElementById('package-select');
      const levelSelect = document.getElementById('graph-level');
      const hideIsolates = document.getElementById('hide-isolates');
      const showLabels = document.getElementById('show-labels');
      const searchInput = document.getElementById('search');
      const legend = document.getElementById('legend');
      const details = document.getElementById('details');
      const graphTitle = document.getElementById('graph-title');
      const graphDescription = document.getElementById('graph-description');
      const graphMeta = document.getElementById('graph-meta');
      const resetView = document.getElementById('reset-view');
      const graphContainer = document.getElementById('graph');

      let cy = null;

      for (const option of payload.packageOptions) {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        packageSelect.appendChild(element);
      }

      function currentPackageData() {
        return payload.packages[packageSelect.value];
      }

      function currentGraph() {
        const level = levelSelect.value;
        if (level === 'workspace') return payload.workspaceGraph;
        const packageData = currentPackageData();
        return level === 'directory' ? packageData.directoryGraph : packageData.fileGraph;
      }

      function graphStats(graph) {
        return graph.nodes.length + ' nodes, ' + graph.edges.length + ' edges';
      }

      function buildElements(graph) {
        const hide = hideIsolates.checked;
        const connected = new Set();
        for (const edge of graph.edges) {
          connected.add(edge.source);
          connected.add(edge.target);
        }

        const nodes = graph.nodes.filter((node) => !hide || connected.has(node.id));
        const allowed = new Set(nodes.map((node) => node.id));
        const edges = graph.edges.filter((edge) => allowed.has(edge.source) && allowed.has(edge.target));

        return {
          edges,
          elements: [
            ...nodes.map((node) => ({ data: node })),
            ...edges.map((edge) => ({ data: edge }))
          ],
          nodes
        };
      }

      function chooseLayout(level, nodeCount) {
        if (level === 'workspace') {
          return { name: 'breadthfirst', directed: true, padding: 30, spacingFactor: 1.3, fit: true };
        }

        if (level === 'directory') {
          return nodeCount > 60
            ? { name: 'cose', animate: false, fit: true, padding: 30, idealEdgeLength: 100, nodeRepulsion: 5000 }
            : { name: 'breadthfirst', directed: true, padding: 30, spacingFactor: 1.2, fit: true };
        }

        return {
          name: 'cose',
          animate: false,
          fit: true,
          padding: 30,
          idealEdgeLength: 90,
          nodeRepulsion: 8000,
          gravity: 0.2
        };
      }

      function shouldShowLabels(nodeCount) {
        return showLabels.checked || nodeCount <= 36;
      }

      function renderLegend(nodes) {
        legend.innerHTML = '';
        const buckets = new Map();
        for (const node of nodes) {
          const key = node.meta.workspace || node.meta.kind || node.meta.bucket || node.label;
          if (!buckets.has(key)) buckets.set(key, node.color);
        }

        for (const [label, color] of [...buckets.entries()].slice(0, 12)) {
          const pill = document.createElement('div');
          pill.className = 'pill';
          pill.innerHTML = '<span class="swatch" style="--swatch:' + color + '"></span><span>' + label + '</span>';
          legend.appendChild(pill);
        }
      }

      function renderDetails(data) {
        details.innerHTML = '';
        if (!data) {
          details.innerHTML = '<p class="empty">Click a node to inspect it.</p>';
          return;
        }

        const card = document.createElement('div');
        card.className = 'details-card';
        const metaEntries = Object.entries(data.meta || {});
        card.innerHTML = '<dl>' +
          '<dt>Label</dt><dd>' + data.label + '</dd>' +
          (data.path ? '<dt>Path</dt><dd class="muted">' + data.path + '</dd>' : '') +
          '<dt>In degree</dt><dd>' + data.inDegree + '</dd>' +
          '<dt>Out degree</dt><dd>' + data.outDegree + '</dd>' +
          metaEntries.map(([key, value]) => '<dt>' + key + '</dt><dd>' + value + '</dd>').join('') +
          '</dl>';
        details.appendChild(card);
      }

      function applySearch(term) {
        if (!cy) return;
        const query = term.trim().toLowerCase();
        cy.nodes().forEach((node) => {
          const matches = !query || node.data('label').toLowerCase().includes(query) || String(node.data('path') || '').toLowerCase().includes(query);
          node.toggleClass('faded', !matches);
        });
        cy.edges().forEach((edge) => {
          const visible = !query || (!edge.source().hasClass('faded') && !edge.target().hasClass('faded'));
          edge.toggleClass('faded', !visible);
        });
      }

      function render() {
        const graph = currentGraph();
        const level = levelSelect.value;
        const packageData = currentPackageData();
        const built = buildElements(graph);
        const labelText = shouldShowLabels(built.nodes.length) ? 'data(label)' : '';

        graphTitle.textContent = graph.title;
        graphDescription.textContent = graph.description;
        graphMeta.textContent =
          graphStats({ nodes: built.nodes, edges: built.edges }) +
          (level === 'workspace'
            ? ' from actual source imports across workspaces.'
            : ' inside ' + packageData.workspace.name + '.');

        renderLegend(built.nodes);
        renderDetails(null);

        if (cy) cy.destroy();

        cy = cytoscape({
          container: graphContainer,
          elements: built.elements,
          layout: chooseLayout(level, built.nodes.length),
          style: [
            {
              selector: 'node',
              style: {
                'background-color': 'data(color)',
                'border-color': '#fffaf4',
                'border-width': 2,
                color: '#1e130b',
                content: labelText,
                'font-family': 'Iowan Old Style, Palatino Linotype, serif',
                'font-size': built.nodes.length > 80 ? 9 : 11,
                'line-height': 1.1,
                'text-halign': 'center',
                'text-margin-y': -4,
                'text-max-width': 120,
                'text-outline-color': '#fffaf4',
                'text-outline-width': 2,
                'text-valign': 'bottom',
                width: 'data(size)',
                height: 'data(size)'
              }
            },
            {
              selector: 'edge',
              style: {
                'curve-style': 'bezier',
                'line-color': '#7c6652',
                'opacity': 0.5,
                'target-arrow-color': '#7c6652',
                'target-arrow-shape': 'triangle',
                width: 'data(width)'
              }
            },
            {
              selector: '.faded',
              style: {
                opacity: 0.08
              }
            },
            {
              selector: 'node:selected',
              style: {
                'border-color': '#291c10',
                'border-width': 4
              }
            }
          ]
        });

        cy.on('tap', 'node', (event) => {
          renderDetails(event.target.data());
        });

        applySearch(searchInput.value);
      }

      levelSelect.addEventListener('change', () => {
        packageSelect.disabled = levelSelect.value === 'workspace';
        render();
      });
      packageSelect.addEventListener('change', render);
      hideIsolates.addEventListener('change', render);
      showLabels.addEventListener('change', render);
      searchInput.addEventListener('input', () => applySearch(searchInput.value));
      resetView.addEventListener('click', () => {
        if (cy) cy.fit(undefined, 30);
      });

      packageSelect.disabled = levelSelect.value === 'workspace';
      render();
    </script>
  </body>
</html>`;
}

function createMarkdown(payload: GraphPayload): string {
	const workspaceLines = payload.packageOptions.map(({ value }) => {
		const entry = payload.packages[value];
		return `- \`${entry.workspace.shortName}\`: ${entry.summary.sourceFiles} files, ${entry.summary.fileEdges} internal file edges, ${entry.summary.directoryBuckets} directory buckets`;
	});

	return `# DryUI Code Graph

Generated: ${payload.generatedAt}

This report is generated from actual source imports.

- Viewer: \`reports/code-viz.html\`
- Data: \`reports/code-viz.graph.json\`
- Workspaces scanned: ${payload.scanSummary.workspaces}
- Source files scanned: ${payload.scanSummary.scannedFiles}
- Workspace import edges: ${payload.scanSummary.packageEdges}

## Workspace graph

The workspace graph is derived from actual source imports between workspaces, not declared \`package.json\` dependencies.

## Per-workspace graphs

${workspaceLines.join('\n')}
`;
}

async function main(): Promise<void> {
	const workspaces = await collectWorkspaces();
	const workspacesByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
	const sourceFilesByWorkspace = new Map<string, SourceFile[]>();
	const fileById = new Map<string, SourceFile>();

	for (const workspace of workspaces) {
		const files: SourceFile[] = [];
		for (const root of workspace.sourceRoots) {
			collectSourceFilesForRoot(root, workspace, files);
		}
		files.sort((left, right) => left.relPath.localeCompare(right.relPath));
		sourceFilesByWorkspace.set(workspace.name, files);
		for (const file of files) fileById.set(file.id, file);
	}

	const packageEdgeMap = new Map<string, MutableEdge>();
	const fileEdgeMaps = new Map<string, Map<string, MutableEdge>>();

	for (const workspace of workspaces) {
		fileEdgeMaps.set(workspace.name, new Map());
	}

	for (const workspace of workspaces) {
		const fileEdgeMap = fileEdgeMaps.get(workspace.name);
		if (!fileEdgeMap) continue;

		for (const file of sourceFilesByWorkspace.get(workspace.name) ?? []) {
			const source = await readFile(file.absPath, 'utf8');
			for (const specifier of extractSpecifiers(source)) {
				const targetWorkspace = matchWorkspaceImport(specifier, workspacesByName);
				if (targetWorkspace && targetWorkspace.name !== workspace.name) {
					addEdge(
						packageEdgeMap,
						workspace.name,
						targetWorkspace.name,
						file.id,
						specifier,
						`${workspace.shortName} -> ${targetWorkspace.shortName}`
					);
					continue;
				}

				const resolved = resolveLocalImport(file, workspace, specifier);
				if (!resolved) continue;
				const targetFile = fileById.get(repoRelative(resolved));
				if (!targetFile || targetFile.workspaceName !== workspace.name) continue;
				addEdge(fileEdgeMap, file.id, targetFile.id, file.id, specifier);
			}
		}
	}

	const workspaceNodes: MutableNode[] = workspaces.map((workspace) => ({
		color: colorFor(workspace.kind),
		id: workspace.name,
		label: workspace.shortName,
		meta: {
			dir: workspace.dir,
			kind: workspace.kind,
			sourceFiles: sourceFilesByWorkspace.get(workspace.name)?.length ?? 0,
			sourceRoots: workspace.sourceRoots.length
		},
		path: workspace.dir
	}));

	const workspaceGraph = finalizeGraph(
		'Workspace graph',
		'Actual imports between repo workspaces, aggregated from source files.',
		workspaceNodes,
		[...packageEdgeMap.values()]
	);

	const packageOptions = workspaces
		.filter((workspace) => (sourceFilesByWorkspace.get(workspace.name)?.length ?? 0) > 0)
		.map((workspace) => ({
			label: workspace.shortName,
			value: workspace.name
		}));

	const packages = Object.fromEntries(
		packageOptions.map(({ value }) => {
			const workspace = workspacesByName.get(value);
			if (!workspace) throw new Error(`Missing workspace ${value}`);
			const files = sourceFilesByWorkspace.get(value) ?? [];
			const fileEdges = fileEdgeMaps.get(value) ?? new Map();

			const fileNodes: MutableNode[] = files.map((file) => ({
				color: colorFor(file.directoryBucket),
				id: file.id,
				label: file.label,
				meta: {
					bucket: file.directoryBucket,
					root: file.sourceRootLabel,
					workspace: workspace.shortName
				},
				path: file.relPath
			}));

			const fileGraph = finalizeGraph(
				`${workspace.shortName} file graph`,
				'Resolved internal file imports inside the selected workspace.',
				fileNodes,
				[...fileEdges.values()]
			);

			const directoryGraph = buildDirectoryGraph(workspace, files, fileEdges);

			return [
				value,
				{
					directoryGraph,
					fileGraph,
					summary: {
						directoryBuckets: directoryGraph.nodes.length,
						directoryEdges: directoryGraph.edges.length,
						fileEdges: fileGraph.edges.length,
						sourceFiles: files.length,
						sourceRoots: workspace.sourceRoots.map((root) => root.relPath)
					},
					workspace: {
						dir: workspace.dir,
						kind: workspace.kind,
						name: workspace.name,
						shortName: workspace.shortName
					}
				}
			];
		})
	);

	const payload: GraphPayload = {
		generatedAt: new Date().toISOString(),
		packageOptions,
		packages,
		repo: 'rob-balfre/dryui',
		scanSummary: {
			packageEdges: workspaceGraph.edges.length,
			scannedFiles: [...sourceFilesByWorkspace.values()].reduce(
				(total, files) => total + files.length,
				0
			),
			workspaces: workspaces.length
		},
		workspaceGraph
	};

	await mkdir(reportsDir, { recursive: true });
	await writeFile(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`);
	await writeFile(outputHtmlPath, createHtml(payload));
	await writeFile(outputMarkdownPath, createMarkdown(payload));

	console.log(`Generated ${repoRelative(outputHtmlPath)}`);
	console.log(`Generated ${repoRelative(outputJsonPath)}`);
	console.log(
		`Scanned ${payload.scanSummary.scannedFiles} source files across ${payload.scanSummary.workspaces} workspaces`
	);
}

await main();
