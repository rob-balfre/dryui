<!--
  Step-by-step onboarding shell. Used by the CLI/init flow and any host that
  walks a user through `Personality → BrandColor → Typography → Shape → PreviewExport`.
  The full-bleed live editor in `apps/docs/src/routes/theme-wizard/+page.svelte`
  uses a workbench layout instead, not this shell. Keep both intact: the shell
  belongs to onboarding paths, the workbench belongs to the docs reference editor.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TokenScope } from '@dryui/primitives/token-scope';
	import { AreaGrid } from '@dryui/ui/area-grid';
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
	<AreaGrid.Root template="stack" fill maxWidth="md">
		<WizardMasthead --dry-grid-area-name="masthead" {step} {onstep} />
		<WizardBody --dry-grid-area-name="main" {title} {subtitle}>
			{@render children()}
		</WizardBody>
		<WizardFooter --dry-grid-area-name="foot" {onback} {onnext} {backLabel} {nextLabel} />
	</AreaGrid.Root>
</TokenScope>
