/**
 * Machine-readable diagnostic shape returned alongside the TOON `check` output.
 *
 * The TOON text is optimised for humans and token-efficient LLM context, but
 * agents running a self-correction loop want a stable, structured record they
 * can key by `code` and feed back into prompts. This is that record.
 *
 * Every `check` source (lint, theme, workspace, parse, vision, design) produces issues
 * in this shape via {@link enrichDiagnostic}, which attaches a prescriptive
 * `hint` and docs pointer when the `code` is known.
 */
export type DryUiRepairIssueSource = 'lint' | 'theme' | 'workspace' | 'parse' | 'vision' | 'design';
export type DryUiRepairIssueSeverity = 'error' | 'warning' | 'suggestion' | 'info';

export interface DryUiRepairFix {
	readonly before: string;
	readonly after: string;
}

export interface DryUiRepairIssue {
	/** Which subsystem surfaced this issue. */
	readonly source: DryUiRepairIssueSource;
	/** Stable, namespaced code. `lint/<rule>`, `theme/<code>`, `workspace/<rule>`, `parse/<code>`, `vision/<code>`, `design/<code>`. */
	readonly code: string;
	readonly severity: DryUiRepairIssueSeverity;
	/** Diagnostic text (what's wrong). */
	readonly message: string;
	readonly file?: string;
	readonly line?: number;
	readonly column?: number;
	/** Svelte component name when the issue is scoped to a component. */
	readonly component?: string;
	/** Prop path or CSS selector when the issue targets a specific field. */
	readonly path?: string;
	/** Prescriptive fix guidance ("do X") rather than diagnostic prose ("X is wrong"). */
	readonly hint?: string;
	/** Deep link into the DryUI docs for the relevant rule/concept. */
	readonly docsRef?: string;
	readonly autoFixable?: boolean;
	readonly fix?: DryUiRepairFix;
}

export interface DryUiRepairReport {
	readonly diagnostics: readonly DryUiRepairIssue[];
	readonly summary: {
		readonly error: number;
		readonly warning: number;
		readonly suggestion: number;
		readonly info: number;
		readonly autoFixable: number;
	};
}
