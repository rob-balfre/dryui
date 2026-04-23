import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
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
	readonly apiKey?: string;
	readonly model?: string;
	/** Override the Anthropic client. Used by tests to stub the SDK. */
	readonly client?: Pick<Anthropic, 'messages'>;
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

interface VisionRendererInput {
	readonly url: string;
	readonly viewport: { width: number; height: number };
	readonly waitFor?: string;
}

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_VIEWPORT = { width: 1440, height: 900 } as const;
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
	'',
	'For EACH defect found, return a finding. Severity rubric:',
	'- error: breaks legibility (low contrast, illegible)',
	'- warning: clearly wrong (chip wrap, plural mismatch, mid-token break)',
	'- suggestion: taste-call (variant mix, alignment drift, orphan)',
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

function resolveApiKey(options: VisionCheckOptions): string {
	const fromOptions = options.apiKey?.trim();
	if (fromOptions) return fromOptions;
	const fromEnv = process.env.ANTHROPIC_API_KEY?.trim();
	if (fromEnv) return fromEnv;
	throw new StructuredToolError(
		'missing-api-key',
		'check-vision requires an Anthropic API key. Set ANTHROPIC_API_KEY in the environment or pass --api-key.',
		[
			'export ANTHROPIC_API_KEY=sk-ant-...',
			'dryui check-vision https://example.com --api-key sk-ant-...'
		]
	);
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

interface VisionResponseLike {
	readonly content: ReadonlyArray<{ type: string; text?: string }>;
}

function extractText(response: VisionResponseLike): string {
	for (const block of response.content) {
		if (block.type === 'text' && typeof block.text === 'string') return block.text;
	}
	return '';
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
	const model = options.model ?? DEFAULT_MODEL;
	const renderer = options.renderer ?? defaultRenderer;
	const client = options.client ?? new Anthropic({ apiKey: resolveApiKey(options) });

	const { bytes, screenshotPath } = await renderer({
		url: parsedUrl.toString(),
		viewport,
		...(input.waitFor ? { waitFor: input.waitFor } : {})
	});

	const userText = input.extraRubric
		? `Inspect the screenshot and report any defects per the rubric. Additional emphasis: ${input.extraRubric}\n\nRespond with ONLY the JSON object.`
		: 'Inspect the screenshot and report any defects per the rubric. Respond with ONLY the JSON object.';

	const response = await client.messages.create({
		model,
		max_tokens: 2048,
		// Cache the rubric: the system prompt is byte-identical across every
		// call, so the second + screenshot pays the cheap cache-read rate.
		system: [
			{
				type: 'text',
				text: RUBRIC_PROMPT,
				cache_control: { type: 'ephemeral' }
			}
		],
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'image',
						source: {
							type: 'base64',
							media_type: 'image/png',
							data: bytes.toString('base64')
						}
					},
					{ type: 'text', text: userText }
				]
			}
		]
	});

	const rawText = extractText(response as VisionResponseLike);
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
