<!--
  Step-by-step onboarding shell. Used by the CLI/init flow and any host that
  walks a user through `Personality → BrandColor → Typography → Shape → PreviewExport`.
  Fills the parent block size; hosts that need a max-width should wrap the
  shell themselves (e.g. with `<Container size="md">`).
-->
<script lang="ts">
	import './wizard-shell.css';

	import type { Snippet } from 'svelte';
	import { TokenScope } from '@dryui/primitives/token-scope';
	import { getAllTokens } from '../state.svelte.js';
	import WizardMasthead from './WizardMasthead.svelte';
	import WizardBody from './WizardBody.svelte';
	import WizardFooter from './WizardFooter.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		step: number;
		children: Snippet;
		onback?: () => void;
		onnext?: () => void;
		nextLabel?: string;
		backLabel?: string;
		onstep?: (step: number) => void;
	}

	let {
		title,
		subtitle,
		step,
		children,
		onback,
		onnext,
		nextLabel = 'Next',
		backLabel = 'Back',
		onstep
	}: Props = $props();

	const tokens = $derived(getAllTokens());
</script>

<TokenScope {tokens}>
	<div data-layout="wizard-shell">
		<WizardMasthead --dry-grid-area-name="masthead" {step} {onstep} />
		<WizardBody --dry-grid-area-name="main" {title} {subtitle}>
			{@render children()}
		</WizardBody>
		<WizardFooter --dry-grid-area-name="foot" {onback} {onnext} {backLabel} {nextLabel} />
	</div>
</TokenScope>
