import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { FIELD_CAP, formatHelp, header, row, truncateField } from '../toon.js';
import { enrichDiagnostic } from '../enrich-diagnostics.js';
import type { DryUiRepairIssue } from '../repair-types.js';
import { StructuredToolError } from './tool-error.js';

export type VisionFindingSeverity = 'error' | 'warning' | 'suggestion';

export const VISION_RULES = {
	chipWrap: 'vision/chip-wrap',
	pluralMismatch: 'vision/plural-mismatch',
	variantMix: 'vision/variant-mix',
	midTokenBreak: 'vision/mid-token-break',
	lowContrast: 'vision/low-contrast',
	alignment: 'vision/alignment',
	orphan: 'vision/orphan',
	spacingRhythm: 'vision/spacing-rhythm',
	crampedLayout: 'vision/cramped-layout',
	parseError: 'vision/parse-error'
} as const;

export type VisionRuleCode = (typeof VISION_RULES)[keyof typeof VISION_RULES];

export interface VisionFinding {
	readonly rule: string;
	readonly severity: VisionFindingSeverity;
	readonly message: string;
	readonly evidence?: string;
}

export interface VisionCheckInput {
	readonly url: string;
	readonly viewport?: string;
	readonly extraRubric?: string;
	readonly waitFor?: string;
}

export interface VisionCheckOptions {
	readonly model?: string;
	/** Override the Codex reviewer. Used by tests to stub the CLI. */
	readonly reviewer?: VisionReviewer;
	/** Override the screenshot pipeline. Tests inject deterministic bytes. */
	readonly renderer?: VisionRenderer;
}

export interface VisionCheckResult {
	readonly text: string;
	readonly findings: readonly VisionFinding[];
	readonly diagnostics: readonly DryUiRepairIssue[];
	readonly screenshotPath: string;
	readonly summary: { hasBlockers: boolean; counts: Record<string, number> };
}

export interface VisionRenderer {
	(input: VisionRendererInput): Promise<{ bytes: Buffer; screenshotPath: string }>;
}

export interface VisionReviewer {
	(input: VisionReviewInput): Promise<VisionReviewResult>;
}

interface VisionRendererInput {
	readonly url: string;
	readonly viewport: { width: number; height: number };
	readonly waitFor?: string;
}

interface VisionReviewInput {
	readonly screenshotPath: string;
	readonly userText: string;
	readonly rubricPrompt: string;
	readonly model?: string;
}

interface VisionReviewResult {
	readonly rawText: string;
	readonly model: string;
}

const DEFAULT_MODEL = 'codex-default';
const DEFAULT_VIEWPORT = { width: 1440, height: 900 } as const;
const REVIEW_OUTPUT_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['findings'],
	properties: {
		findings: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['rule', 'severity', 'message', 'evidence'],
				properties: {
					rule: { type: 'string' },
					severity: { type: 'string', enum: ['error', 'warning', 'suggestion'] },
					message: { type: 'string' },
					evidence: { type: ['string', 'null'] }
				}
			}
		}
	}
} as const;
const RUBRIC_PROMPT = [
	'You are a senior product designer auditing a screenshot of a web UI for visual polish defects.',
	'',
	'Inspect the image. Report any of these defects you can SEE in the rendered pixels (not guesses):',
	'',
	`1. ${VISION_RULES.chipWrap}: a chip/badge with an icon stacked above its text label. Icon should sit inline next to text.`,
	`2. ${VISION_RULES.pluralMismatch}: text like "1 hotels" or "3 user". Count and noun number disagreeing.`,
	`3. ${VISION_RULES.variantMix}: a row of chips/badges using mixed visual treatments (some outlined, some soft, some solid).`,
	`4. ${VISION_RULES.midTokenBreak}: a reference ID or code (e.g. "BA-3490221") wrapped between segments.`,
	`5. ${VISION_RULES.lowContrast}: text fails WCAG 4.5:1 contrast against its background (especially on dark glass).`,
	`6. ${VISION_RULES.alignment}: items in a row that should baseline-align but do not.`,
	`7. ${VISION_RULES.orphan}: a single word on its own line at the end of a paragraph or heading (rivers/orphans).`,
	`8. ${VISION_RULES.spacingRhythm}: adjacent components with inconsistent vertical spacing where consistency is expected.`,
	`9. ${VISION_RULES.crampedLayout}: a header, text stack, toolbar, or chip/meta row is visibly squashed together. Flag when headings, subtitles, badges, dates, or controls have too little breathing room, appear packed into one block, or feel compressed even if they do not overlap.`,
	'',
	'For EACH defect found, return a finding. Severity rubric:',
	'- error: breaks legibility (low contrast, illegible)',
	'- warning: clearly wrong (chip wrap, plural mismatch, mid-token break, cramped layout)',
	'- suggestion: taste-call (variant mix, alignment drift, orphan, spacing rhythm)',
	'',
	'Output ONLY this JSON, no prose, no code fences:',
	'{ "findings": [ { "rule": "vision/<code>", "severity": "<level>", "message": "<one sentence: what and where>" } ] }',
	'',
	'If no defects, output: { "findings": [] }'
].join('\n');

const SEVERITY_VALUES: ReadonlySet<VisionFindingSeverity> = new Set([
	'error',
	'warning',
	'suggestion'
]);

function validateUrl(raw: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		throw new StructuredToolError('invalid-url', `Not a valid URL: ${raw}`, [
			'check-vision https://example.com',
			'check-vision http://localhost:5173'
		]);
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new StructuredToolError('invalid-url', `URL must use http or https: ${raw}`, [
			'check-vision https://example.com'
		]);
	}
	return parsed;
}

function parseViewport(raw: string | undefined): { width: number; height: number } {
	if (!raw) return DEFAULT_VIEWPORT;
	const match = /^(\d+)x(\d+)$/.exec(raw.trim());
	if (!match) {
		throw new StructuredToolError(
			'invalid-viewport',
			`Viewport must be <width>x<height>: got "${raw}"`,
			['1440x900', '1280x720', '375x812']
		);
	}
	const width = Number(match[1]);
	const height = Number(match[2]);
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
		throw new StructuredToolError(
			'invalid-viewport',
			`Viewport dimensions must be positive: ${raw}`
		);
	}
	return { width, height };
}

async function defaultRenderer(input: VisionRendererInput): Promise<{
	bytes: Buffer;
	screenshotPath: string;
}> {
	const screenshotPath = join(tmpdir(), `dryui-vision-${Date.now()}.png`);
	let browser: Browser | undefined;
	try {
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({ viewport: input.viewport });
		const page = await context.newPage();
		await page.goto(input.url, { waitUntil: 'domcontentloaded' });
		// `networkidle` flushes streaming hydration even when the docs
		// route keeps a websocket alive; without it we screenshot pre-paint.
		await page.waitForLoadState('networkidle');
		if (input.waitFor) {
			await page.waitForSelector(input.waitFor, { state: 'visible' });
		}
		await page.evaluate(
			() =>
				new Promise<void>((resolve) => {
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
				})
		);
		const bytes = await page.screenshot({ type: 'png', fullPage: false });
		await writeFile(screenshotPath, bytes);
		return { bytes, screenshotPath };
	} finally {
		if (browser) await browser.close();
	}
}

async function defaultReviewer(input: VisionReviewInput): Promise<VisionReviewResult> {
	const workDir = await mkdtemp(join(tmpdir(), 'dryui-codex-vision-'));
	const outputPath = join(workDir, 'vision-output.json');
	const schemaPath = join(workDir, 'vision-output.schema.json');
	const prompt = [
		input.rubricPrompt,
		'',
		'Inspect the attached screenshot only. Do not browse, do not infer unseen states, and do not explain your reasoning.',
		input.userText
	].join('\n');

	try {
		await writeFile(schemaPath, JSON.stringify(REVIEW_OUTPUT_SCHEMA, null, 2));
		const args = [
			'exec',
			'-',
			'--skip-git-repo-check',
			'--ephemeral',
			'--ignore-rules',
			'--sandbox',
			'read-only',
			'--color',
			'never',
			'--output-schema',
			schemaPath,
			'--output-last-message',
			outputPath,
			'--image',
			input.screenshotPath
		];
		if (input.model) args.push('--model', input.model);

		const result = await runCodex(args, prompt, workDir);
		const rawText = await readLastMessage(outputPath, result.stdout);
		if (!rawText) {
			throw new StructuredToolError(
				'codex-empty-response',
				'check-vision did not receive a final response from the Codex CLI.',
				['codex login', 'codex exec --help']
			);
		}

		return {
			rawText,
			model: input.model?.trim() || DEFAULT_MODEL
		};
	} finally {
		await rm(workDir, { recursive: true, force: true });
	}
}

async function readLastMessage(outputPath: string, stdoutFallback: string): Promise<string> {
	try {
		const fromFile = (await readFile(outputPath, 'utf8')).trim();
		if (fromFile) return fromFile;
	} catch {
		// Fall back to stdout if Codex did not materialize the output file.
	}
	return stdoutFallback.trim();
}

async function runCodex(
	args: readonly string[],
	prompt: string,
	cwd: string
): Promise<{ stdout: string; stderr: string }> {
	const child = spawn('codex', args, {
		cwd,
		stdio: ['pipe', 'pipe', 'pipe']
	});

	let stdout = '';
	let stderr = '';

	child.stdout.setEncoding('utf8');
	child.stdout.on('data', (chunk: string) => {
		stdout += chunk;
	});
	child.stderr.setEncoding('utf8');
	child.stderr.on('data', (chunk: string) => {
		stderr += chunk;
	});

	const completion = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
		child.on('error', (error: NodeJS.ErrnoException) => {
			if (error.code === 'ENOENT') {
				reject(
					new StructuredToolError(
						'missing-codex',
						'check-vision requires the Codex CLI to be installed and available on PATH.',
						['codex --help', 'codex login']
					)
				);
				return;
			}
			reject(error);
		});
		child.on('close', (code) => {
			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}
			reject(
				new StructuredToolError(
					'codex-failed',
					`check-vision failed to run the Codex CLI${stderr.trim() ? `: ${cap(stderr.trim())}` : '.'}`,
					['codex login', 'codex exec --help']
				)
			);
		});
	});

	child.stdin.write(prompt);
	child.stdin.end();
	return await completion;
}

function stripCodeFences(text: string): string {
	const trimmed = text.trim();
	if (!trimmed.startsWith('```')) return trimmed;
	// ```json\n...\n``` or ```\n...\n```
	const match = /^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/.exec(trimmed);
	if (match && match[1] !== undefined) return match[1].trim();
	// Fallback: drop the first/last fence even if the close is missing.
	return trimmed
		.replace(/^```[a-zA-Z0-9_-]*\n?/, '')
		.replace(/```$/, '')
		.trim();
}

function coerceFinding(raw: unknown): VisionFinding | null {
	if (raw === null || typeof raw !== 'object') return null;
	const rec = raw as Record<string, unknown>;
	const rule = typeof rec.rule === 'string' ? rec.rule : null;
	const severity = typeof rec.severity === 'string' ? rec.severity : null;
	const message = typeof rec.message === 'string' ? rec.message : null;
	if (!rule || !severity || !message) return null;
	const sev = (
		SEVERITY_VALUES.has(severity as VisionFindingSeverity) ? severity : 'suggestion'
	) as VisionFindingSeverity;
	const evidence = typeof rec.evidence === 'string' ? rec.evidence : undefined;
	const finding: VisionFinding = { rule, severity: sev, message };
	return evidence ? { ...finding, evidence } : finding;
}

interface ParsedFindings {
	readonly findings: readonly VisionFinding[];
	readonly parseError: { message: string; raw: string } | null;
}

function parseFindings(raw: string): ParsedFindings {
	const cleaned = stripCodeFences(raw);
	if (!cleaned) return { findings: [], parseError: null };
	let parsed: unknown;
	try {
		parsed = JSON.parse(cleaned);
	} catch (error) {
		return {
			findings: [],
			parseError: {
				message: error instanceof Error ? error.message : String(error),
				raw
			}
		};
	}
	if (parsed === null || typeof parsed !== 'object') {
		return { findings: [], parseError: { message: 'response was not a JSON object', raw } };
	}
	const list = (parsed as { findings?: unknown }).findings;
	if (!Array.isArray(list)) {
		return {
			findings: [],
			parseError: { message: 'response did not contain a findings array', raw }
		};
	}
	const findings: VisionFinding[] = [];
	for (const entry of list) {
		const finding = coerceFinding(entry);
		if (finding) findings.push(finding);
	}
	return { findings, parseError: null };
}

function findingsToDiagnostics(findings: readonly VisionFinding[]): readonly DryUiRepairIssue[] {
	return findings.map((f) =>
		enrichDiagnostic({
			source: 'vision',
			code: f.rule,
			severity: f.severity,
			message: f.message
		})
	);
}

function deriveSummary(findings: readonly VisionFinding[]): {
	hasBlockers: boolean;
	counts: Record<string, number>;
} {
	const counts: Record<string, number> = { error: 0, warning: 0, suggestion: 0 };
	let hasBlockers = false;
	for (const f of findings) {
		counts[f.severity] = (counts[f.severity] ?? 0) + 1;
		if (f.severity === 'error') hasBlockers = true;
	}
	return { hasBlockers, counts };
}

function cap(value: string): string {
	return truncateField(value, FIELD_CAP)[0];
}

function renderText(args: {
	url: string;
	viewport: { width: number; height: number };
	model: string;
	screenshotPath: string;
	findings: readonly VisionFinding[];
	summary: { hasBlockers: boolean; counts: Record<string, number> };
	parseError: { message: string; raw: string } | null;
}): string {
	const { url, viewport, model, screenshotPath, findings, summary, parseError } = args;
	const lines: string[] = [
		'kind: vision',
		`target: ${url} | viewport: ${viewport.width}x${viewport.height}`,
		`model: ${model}`,
		`screenshot: ${screenshotPath}`,
		`hasBlockers: ${summary.hasBlockers} | findings: ${findings.length}`,
		`severityCounts: error=${summary.counts.error ?? 0} | warning=${summary.counts.warning ?? 0} | suggestion=${summary.counts.suggestion ?? 0}`,
		''
	];

	if (findings.length === 0) {
		lines.push('findings[0]: clean');
	} else {
		lines.push(header('findings', findings.length, ['rule', 'severity', 'message']));
		for (const f of findings) {
			lines.push(row(f.rule, f.severity, cap(f.message)));
			if (f.evidence) lines.push(`    evidence: ${cap(f.evidence)}`);
		}
	}

	if (parseError) {
		lines.push('', `parseError: ${cap(parseError.message)}`);
		const preview = parseError.raw.slice(0, FIELD_CAP);
		lines.push(`rawResponse: ${cap(preview)}`);
	}

	lines.push(
		'',
		formatHelp([
			'check <file.svelte> -- run the static linter on the file you suspect',
			'ask --scope component "<Component>" -- look up the API for a flagged primitive',
			'ask --scope recipe "<pattern>" -- find a layout recipe for spacing/alignment fixes'
		])
	);
	return lines.join('\n');
}

export async function runVisionCheck(
	input: VisionCheckInput,
	options: VisionCheckOptions = {}
): Promise<VisionCheckResult> {
	const parsedUrl = validateUrl(input.url);
	const viewport = parseViewport(input.viewport);
	const renderer = options.renderer ?? defaultRenderer;
	const reviewer = options.reviewer ?? defaultReviewer;

	const { bytes, screenshotPath } = await renderer({
		url: parsedUrl.toString(),
		viewport,
		...(input.waitFor ? { waitFor: input.waitFor } : {})
	});

	const userText = input.extraRubric
		? `Inspect the screenshot and report any defects per the rubric. Additional emphasis: ${input.extraRubric}\n\nRespond with ONLY the JSON object.`
		: 'Inspect the screenshot and report any defects per the rubric. Respond with ONLY the JSON object.';

	// Keep the PNG bytes in memory for renderer parity tests even though the
	// default Codex reviewer reads the screenshot from disk via --image.
	void bytes;

	const review = await reviewer({
		screenshotPath,
		userText,
		rubricPrompt: RUBRIC_PROMPT,
		...(options.model ? { model: options.model } : {})
	});
	const rawText = review.rawText;
	const model = review.model;
	const { findings, parseError } = parseFindings(rawText);

	const summary = deriveSummary(findings);
	const diagnostics = findingsToDiagnostics(findings);
	const enrichedDiagnostics = parseError
		? [
				...diagnostics,
				enrichDiagnostic({
					source: 'vision',
					code: VISION_RULES.parseError,
					severity: 'warning',
					message: `Vision response did not parse: ${parseError.message}`,
					path: parseError.raw.slice(0, 200)
				})
			]
		: diagnostics;

	const text = renderText({
		url: parsedUrl.toString(),
		viewport,
		model,
		screenshotPath,
		findings,
		summary,
		parseError
	});

	return {
		text,
		findings,
		diagnostics: enrichedDiagnostics,
		screenshotPath,
		summary
	};
}
