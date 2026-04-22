/**
 * Public surface for the structured repair loop.
 *
 * Consumers that want to run their own `check`-equivalent pass (or post-process
 * diagnostics before handing them to an agent) import types and helpers from
 * here rather than the internal test-ish module boundaries.
 */
export type {
	DryUiRepairIssue,
	DryUiRepairIssueSeverity,
	DryUiRepairIssueSource,
	DryUiRepairFix,
	DryUiRepairReport
} from './repair-types.js';
export { enrichDiagnostic, knownHintCodes } from './enrich-diagnostics.js';
export { runCheckStructured } from './tools/check.js';
export type { CheckResult } from './tools/check.js';
