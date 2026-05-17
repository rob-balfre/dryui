import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type DryuiConsumerPackage =
	| '@dryui/ui'
	| '@dryui/primitives'
	| '@dryui/feedback'
	| '@dryui/feedback-server'
	| '@dryui/lint';

export const DRYUI_INIT_SKILL_CONTRACT = {
	sourcePath: 'skills/dryui-init/SKILL.md',
	anchor: 'golden-consumer-setup-contract',
	adapterRole: 'E2E scaffold Adapter for the dryui-init setup Interface',
	requiredSkillMarkers: [
		'## Golden Consumer Setup Contract',
		'source of truth for a DryUI consumer setup',
		'Fresh E2E scaffolds',
		'npx skills add rob-balfre/dryui',
		'@dryui/ui',
		'@dryui/lint',
		'@dryui/feedback',
		'@dryui/feedback-server',
		'lucide-svelte',
		'dryui.config.json',
		'dryuiLint({ strict: true })',
		'dryuiLayoutCss()',
		'AGENTS.md',
		'CLAUDE.md',
		'src/routes/+layout.svelte',
		'src/layout.css'
	] as const
} as const;

interface TarballManifestPackage {
	readonly version: unknown;
	readonly tarball: unknown;
}

interface TarballManifest {
	readonly packages?: Record<string, TarballManifestPackage>;
}

export interface ScaffoldDryuiConsumerProjectOptions {
	readonly projectDir: string;
	readonly tarballsDir: string;
	readonly logPath?: string;
	readonly install?: boolean;
}

export interface ScaffoldDryuiConsumerProjectResult {
	readonly projectDir: string;
	readonly manifestPath: string;
	readonly contractSourcePath: string;
	readonly contractAnchor: string;
	readonly filesWritten: readonly string[];
	readonly installed: boolean;
}

export const REQUIRED_DRYUI_PACKAGES: readonly DryuiConsumerPackage[] = [
	'@dryui/ui',
	'@dryui/primitives',
	'@dryui/feedback',
	'@dryui/feedback-server',
	'@dryui/lint'
];

const PACKAGE_JSON = 'package.json';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DRYUI_SKILLS_SOURCE = 'skills';
const DRYUI_INIT_SKILL_DIR = 'skills/dryui-init';
const DRYUI_INIT_TEMPLATES_SOURCE = `${DRYUI_INIT_SKILL_DIR}/templates`;
const DRYUI_INIT_SETUP_FEEDBACK_SCRIPT = `${DRYUI_INIT_SKILL_DIR}/scripts/setup-feedback-agents.sh`;
const DRYUI_INIT_BARE_SKELETON_SCRIPT = `${DRYUI_INIT_SKILL_DIR}/scripts/bare-skeleton.sh`;
const DRYUI_BUILD_SKILL_OVERRIDE_ENV = 'DRYUI_E2E_DRYUI_BUILD_SKILL_OVERRIDE';
const AGENT_SKILL_TARGETS = [
	'skills',
	'.agents/skills',
	'.claude/skills',
	'.codex/skills'
] as const;

function fileDependency(tarballPath: string): string {
	return `file:${tarballPath}`;
}

function readManifest(tarballsDir: string): {
	manifestPath: string;
	packages: Record<DryuiConsumerPackage, string>;
} {
	const manifestPath = resolve(tarballsDir, 'manifest.json');
	if (!existsSync(manifestPath)) {
		throw new Error(`tarballs manifest missing at ${manifestPath}`);
	}

	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as TarballManifest;
	const packages = {} as Record<DryuiConsumerPackage, string>;

	for (const name of REQUIRED_DRYUI_PACKAGES) {
		const entry = manifest.packages?.[name];
		if (!entry || typeof entry.tarball !== 'string' || entry.tarball.length === 0) {
			throw new Error(`tarballs manifest is missing ${name}`);
		}
		const tarballPath = resolve(entry.tarball);
		if (!existsSync(tarballPath)) {
			throw new Error(`tarball for ${name} does not exist at ${tarballPath}`);
		}
		packages[name] = fileDependency(tarballPath);
	}

	return { manifestPath, packages };
}

function verifyDryuiInitSkillContract(): void {
	const skillPath = resolve(repoRoot, DRYUI_INIT_SKILL_CONTRACT.sourcePath);
	if (!existsSync(skillPath)) {
		throw new Error(`dryui-init setup contract missing at ${skillPath}`);
	}

	const skill = readFileSync(skillPath, 'utf8');
	const missing = DRYUI_INIT_SKILL_CONTRACT.requiredSkillMarkers.filter(
		(marker) => !skill.includes(marker)
	);
	if (missing.length > 0) {
		throw new Error(
			`${DRYUI_INIT_SKILL_CONTRACT.adapterRole} drift: ${DRYUI_INIT_SKILL_CONTRACT.sourcePath} is missing ${missing
				.map((marker) => JSON.stringify(marker))
				.join(', ')}`
		);
	}
}

function ensureEmptyProjectDir(projectDir: string): void {
	mkdirSync(projectDir, { recursive: true });
	if (readdirSync(projectDir).length > 0) {
		throw new Error(`E2E scaffold target must be empty: ${projectDir}`);
	}
}

function writeProjectFile(
	projectDir: string,
	path: string,
	content: string,
	files: string[]
): void {
	const absPath = resolve(projectDir, path);
	mkdirSync(dirname(absPath), { recursive: true });
	writeFileSync(absPath, content);
	files.push(path);
}

function copyProjectDirectory(projectDir: string, sourcePath: string, targetPath: string): void {
	const absSource = resolve(repoRoot, sourcePath);
	if (!existsSync(absSource)) {
		throw new Error(`E2E scaffold source missing at ${absSource}`);
	}
	const absTarget = resolve(projectDir, targetPath);
	mkdirSync(dirname(absTarget), { recursive: true });
	cpSync(absSource, absTarget, {
		recursive: true,
		filter: (path) => !path.endsWith('/.DS_Store')
	});
}

function copyDryuiAgentSkillBundle(projectDir: string, files: string[]): void {
	const skillsRoot = resolve(repoRoot, DRYUI_SKILLS_SOURCE);
	for (const target of AGENT_SKILL_TARGETS) {
		for (const entry of readdirSync(skillsRoot, { withFileTypes: true }).sort((a, b) =>
			a.name.localeCompare(b.name)
		)) {
			if (!entry.isDirectory() || !entry.name.startsWith('dryui-')) continue;
			const skillPath = `${DRYUI_SKILLS_SOURCE}/${entry.name}`;
			if (!existsSync(resolve(repoRoot, skillPath, 'SKILL.md'))) continue;
			copyProjectDirectory(projectDir, skillPath, `${target}/${entry.name}`);
		}
		files.push(target);
	}
}

function applyDryuiBuildSkillOverride(projectDir: string, logLines: string[]): void {
	const override = process.env[DRYUI_BUILD_SKILL_OVERRIDE_ENV];
	if (!override) return;

	const overridePath = resolve(override);
	if (!existsSync(overridePath)) {
		throw new Error(`${DRYUI_BUILD_SKILL_OVERRIDE_ENV} does not exist: ${overridePath}`);
	}

	const skill = readFileSync(overridePath, 'utf8');
	for (const target of AGENT_SKILL_TARGETS) {
		writeFileSync(resolve(projectDir, target, 'dryui-build/SKILL.md'), skill);
	}
	logLines.push(`dryui-build override: ${overridePath}`);
}

function installDependencies(projectDir: string): string {
	const result = spawnSync('bun', ['install'], {
		cwd: projectDir,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`bun install exited ${result.status}\n${output}`);
	}
	return output;
}

const CONSUMER_SCRIPTS = {
	dev: 'vite dev',
	build: 'vite build',
	preview: 'vite preview',
	prepare: 'svelte-kit sync || echo ""',
	check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
	'check:watch': 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch'
} as const;

const CONSUMER_RUNTIME_DEPENDENCIES = {
	'lucide-svelte': '^1.0.1'
} as const;

const CONSUMER_DEV_DEPENDENCIES = {
	'@sveltejs/adapter-auto': '^7.0.1',
	'@sveltejs/kit': '^2.57.0',
	'@sveltejs/vite-plugin-svelte': '^7.0.0',
	'@types/node': '^25.6.2',
	svelte: '^5.55.2',
	'svelte-check': '^4.4.6',
	typescript: '^6.0.2',
	vite: '^8.0.7'
} as const;

function assertContainsAll(source: string, sourcePath: string, markers: readonly string[]): void {
	const missing = markers.filter((marker) => !source.includes(marker));
	if (missing.length > 0) {
		throw new Error(
			`${DRYUI_INIT_SKILL_CONTRACT.adapterRole} drift: ${sourcePath} is missing ${missing
				.map((marker) => JSON.stringify(marker))
				.join(', ')}`
		);
	}
}

function verifyDryuiInitPackageContract(): void {
	const scriptPath = resolve(repoRoot, DRYUI_INIT_BARE_SKELETON_SCRIPT);
	if (!existsSync(scriptPath)) {
		throw new Error(`dryui-init setup script missing at ${scriptPath}`);
	}

	const script = readFileSync(scriptPath, 'utf8');
	const packageMarkers = [
		...Object.entries(CONSUMER_SCRIPTS).map(
			([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`
		),
		...Object.entries(CONSUMER_RUNTIME_DEPENDENCIES).map(
			([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`
		),
		...Object.entries(CONSUMER_DEV_DEPENDENCIES).map(
			([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`
		),
		'bun add @dryui/ui',
		'bun add -d @dryui/lint @dryui/feedback @dryui/feedback-server',
		'"@dryui/ui": "link:@dryui/ui"',
		'"@dryui/lint": "link:@dryui/lint"',
		'"@dryui/primitives": "link:@dryui/primitives"',
		'"@dryui/feedback": "link:@dryui/feedback"',
		'"@dryui/feedback-server": "link:@dryui/feedback-server"'
	];

	assertContainsAll(script, DRYUI_INIT_BARE_SKELETON_SCRIPT, packageMarkers);
}

function verifyDryuiInitFeedbackSetupContract(): void {
	const scriptPath = resolve(repoRoot, DRYUI_INIT_SETUP_FEEDBACK_SCRIPT);
	if (!existsSync(scriptPath)) {
		throw new Error(`dryui-init feedback setup script missing at ${scriptPath}`);
	}

	const script = readFileSync(scriptPath, 'utf8');
	const setupMarkers = [
		`MCP_ENTRY_NPX='{"command":"npx","args":["-y","-p","@dryui/feedback-server","dryui-feedback-mcp"]}'`,
		'for target in skills .agents/skills .claude/skills .codex/skills',
		'rm -rf "$target/$skill_name"',
		'.defaultAgent',
		'.terminalApp',
		'.detectedAgents',
		'.configuredFiles',
		'.mcpServer',
		'codex: "~/.codex/config.toml"',
		'gemini: "~/.gemini/settings.json"',
		'windsurf: "~/.codeium/windsurf/mcp_config.json"',
		'zed: "~/.config/zed/settings.json"',
		'copilot: "~/.copilot/mcp-config.json"'
	];

	assertContainsAll(script, DRYUI_INIT_SETUP_FEEDBACK_SCRIPT, setupMarkers);
}

function scaffoldPackageJson(packages: Record<DryuiConsumerPackage, string>): string {
	return (
		JSON.stringify(
			{
				name: 'dryui-e2e-consumer',
				version: '0.0.0',
				private: true,
				type: 'module',
				scripts: CONSUMER_SCRIPTS,
				dependencies: {
					'@dryui/ui': packages['@dryui/ui'],
					...CONSUMER_RUNTIME_DEPENDENCIES
				},
				devDependencies: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/feedback-server': packages['@dryui/feedback-server'],
					'@dryui/lint': packages['@dryui/lint'],
					'@dryui/primitives': packages['@dryui/primitives'],
					...CONSUMER_DEV_DEPENDENCIES
				},
				overrides: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/feedback-server': packages['@dryui/feedback-server'],
					'@dryui/primitives': packages['@dryui/primitives'],
					'@dryui/ui': packages['@dryui/ui'],
					'@dryui/lint': packages['@dryui/lint']
				}
			},
			null,
			2
		) + '\n'
	);
}

const DRYUI_CONFIG = `{
  "$schema": "https://dryui.dev/config.schema.json",
  "feedback": {
    "defaultAgent": "off",
    "terminalApp": "terminal",
    "detectedAgents": [],
    "configuredFiles": [],
    "mcpServer": {
      "command": "npx",
      "args": ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]
    },
    "manualAgentConfig": {
      "codex": "~/.codex/config.toml",
      "gemini": "~/.gemini/settings.json",
      "windsurf": "~/.codeium/windsurf/mcp_config.json",
      "zed": "~/.config/zed/settings.json",
      "copilot": "~/.copilot/mcp-config.json"
    }
  }
}
`;

function listFilesRecursive(root: string, prefix = ''): string[] {
	const dir = resolve(root, prefix);
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name)
	)) {
		const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			files.push(...listFilesRecursive(root, relativePath));
		} else if (entry.isFile() && entry.name !== '.DS_Store') {
			files.push(relativePath);
		}
	}
	return files;
}

function copyDryuiInitTemplates(projectDir: string, files: string[]): string[] {
	const templateRoot = resolve(repoRoot, DRYUI_INIT_TEMPLATES_SOURCE);
	if (!existsSync(templateRoot)) {
		throw new Error(`dryui-init templates missing at ${templateRoot}`);
	}

	const templateFiles = listFilesRecursive(templateRoot);
	if (templateFiles.length === 0) {
		throw new Error(`dryui-init templates empty at ${templateRoot}`);
	}

	for (const file of templateFiles) {
		const content = readFileSync(resolve(templateRoot, file), 'utf8');
		writeProjectFile(projectDir, file, content, files);
	}

	return templateFiles;
}

function firstDifferentLine(expected: string, actual: string): number {
	const expectedLines = expected.split('\n');
	const actualLines = actual.split('\n');
	const max = Math.max(expectedLines.length, actualLines.length);
	for (let i = 0; i < max; i++) {
		if (expectedLines[i] !== actualLines[i]) return i + 1;
	}
	return 0;
}

function verifyProjectMatchesDryuiInitTemplates(
	projectDir: string,
	templateFiles: readonly string[]
): void {
	for (const file of templateFiles) {
		const templatePath = resolve(repoRoot, DRYUI_INIT_TEMPLATES_SOURCE, file);
		const projectPath = resolve(projectDir, file);
		const expected = readFileSync(templatePath, 'utf8');
		const actual = readFileSync(projectPath, 'utf8');
		if (actual !== expected) {
			const line = firstDifferentLine(expected, actual);
			throw new Error(
				`${DRYUI_INIT_SKILL_CONTRACT.adapterRole} drift: ${file} differs from ${DRYUI_INIT_TEMPLATES_SOURCE}/${file} at line ${line}`
			);
		}
	}
}

export function scaffoldDryuiConsumerProject(
	options: ScaffoldDryuiConsumerProjectOptions
): ScaffoldDryuiConsumerProjectResult {
	const projectDir = resolve(options.projectDir);
	const tarballsDir = resolve(options.tarballsDir);
	const install = options.install !== false;
	const filesWritten: string[] = [];
	const logLines: string[] = [];
	verifyDryuiInitSkillContract();
	verifyDryuiInitPackageContract();
	verifyDryuiInitFeedbackSetupContract();
	const { manifestPath, packages } = readManifest(tarballsDir);

	ensureEmptyProjectDir(projectDir);

	writeProjectFile(projectDir, PACKAGE_JSON, scaffoldPackageJson(packages), filesWritten);
	const templateFiles = copyDryuiInitTemplates(projectDir, filesWritten);
	copyDryuiAgentSkillBundle(projectDir, filesWritten);
	applyDryuiBuildSkillOverride(projectDir, logLines);
	writeProjectFile(projectDir, 'dryui.config.json', DRYUI_CONFIG, filesWritten);
	verifyProjectMatchesDryuiInitTemplates(projectDir, templateFiles);

	logLines.push(
		`contract: ${DRYUI_INIT_SKILL_CONTRACT.sourcePath}#${DRYUI_INIT_SKILL_CONTRACT.anchor}`
	);
	logLines.push(`adapter: ${DRYUI_INIT_SKILL_CONTRACT.adapterRole}`);
	logLines.push(`templates: ${DRYUI_INIT_TEMPLATES_SOURCE}`);
	logLines.push(`feedback setup contract: ${DRYUI_INIT_SETUP_FEEDBACK_SCRIPT}`);
	logLines.push(`manifest: ${manifestPath}`);
	logLines.push(`project: ${projectDir}`);
	logLines.push(`files: ${filesWritten.join(', ')}`);

	let installOutput = '';
	if (install) {
		installOutput = installDependencies(projectDir);
		logLines.push('');
		logLines.push('$ bun install');
		logLines.push(installOutput.trim());
	} else {
		logLines.push('');
		logLines.push('bun install skipped');
	}

	if (options.logPath) {
		mkdirSync(dirname(resolve(options.logPath)), { recursive: true });
		writeFileSync(resolve(options.logPath), logLines.join('\n').trimEnd() + '\n');
	}

	return {
		projectDir,
		manifestPath,
		contractSourcePath: DRYUI_INIT_SKILL_CONTRACT.sourcePath,
		contractAnchor: DRYUI_INIT_SKILL_CONTRACT.anchor,
		filesWritten,
		installed: install
	};
}
