import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';

export const dashboardScenario: ScenarioDefinition = {
	name: 'dashboard',
	prompt: [
		'Build a data-dense admin analytics dashboard as the home page. This project is a freshly scaffolded SvelteKit + DryUI app — replace src/routes/+page.svelte with a single polished page.',
		'',
		'Character: it must LOOK like a real admin app, not a marketing page. Think Linear / Stripe Dashboard / Vercel. Dense information, structured, sidebar on the left, top bar on top, main region shows metrics + a chart + a recent activity feed. Dark UI, warm accent, tabular numbers.',
		'',
		'Use the DryUI component surface generously. Pick from:',
		'  Sidebar, AppFrame, NavigationMenu, Toolbar, Heading, Text, Container,',
		'  Chart, Sparkline, Gauge, Progress, ProgressRing, DataGrid, Table, Badge, Chip,',
		'  ChipGroup, Avatar, SegmentedControl, Input, Icon, ThemeToggle, Separator, Kbd.',
		'DryUI no longer ships a Card component — for panel-style containers use plain native <div> / <section> wrappers styled via scoped <style> with --dry-radius-card, --dry-padding-card, and --dry-shadow-sm. Do NOT import Card from @dryui/ui (it does not exist).',
		"Import lucide-svelte icons where DryUI Icon needs one (it's already installed).",
		'',
		'Build rules that must pass the scaffolded DryUI lint/build pipeline:',
		'  - Do not pass class= to any Svelte component imported from @dryui/ui, including compound parts such as Sidebar.Root, Toolbar.Root, Chart.Root, Table.Root, etc.',
		'  - Use class= only on native HTML elements such as div, section, header, nav, main, span, table, tr, td, and wrappers around DryUI components.',
		'  - Style native wrappers with scoped <style> blocks, component props, data-* attributes, and --dry-* CSS custom properties. Do not rely on component class attributes.',
		'  - Use DryUI Heading for headings instead of raw h1/h2/h3 elements.',
		'',
		'Required structure (but make it tasteful — inline styles / <style> blocks are fine):',
		'  1. A left-hand Sidebar with navigation entries: "Overview", "Analytics", "Customers", "Billing", "Settings". Mark "Analytics" as active.',
		'  2. A top toolbar / top bar with a search Input, a SegmentedControl for a time range ("24h" / "7d" / "30d" / "90d"), and an Avatar on the far right.',
		'  3. A Heading (level={1}) with the exact text "Analytics Dashboard".',
		'  4. A row of four metric panels (plain <div> tiles styled with --dry-radius-card, --dry-padding-card, and --dry-shadow-sm via scoped <style>). Each panel must include the exact labels "Revenue", "Active Users", "Conversions", "Uptime", a large numeric value, a small delta (with a direction icon from lucide), and a tiny Sparkline or ProgressRing.',
		'  5. A larger panel below (same div + token treatment) labelled "Traffic" that holds a Chart or Sparkline (taller, filling width).',
		'  6. A "Recent Activity" Table or DataGrid with a handful of synthetic rows: user name (with Avatar), event, status Badge, RelativeTime.',
		'',
		'Do not edit any source file other than src/routes/+page.svelte. Do not run the dev server. After editing, run `bun run build` and fix any failure before finalizing. You MUST use at least 8 distinct DryUI components beyond the 5 you used in previous attempts (Container, Heading, Text, Button, Badge). The previous output was flat and generic — this one must feel like a genuine admin app.',
		'',
		"If a specific component is not exported from @dryui/ui in this version, pick a sensible substitute from the inventory above — don't fail the task over it."
	].join('\n'),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Analytics Dashboard' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Analytics Dashboard' },
		{ kind: 'html-contains', needle: 'Revenue' },
		{ kind: 'html-contains', needle: 'Active Users' },
		{ kind: 'html-contains', needle: 'Conversions' },
		{ kind: 'html-contains', needle: 'Uptime' },
		{ kind: 'html-contains', needle: 'Recent Activity' },
		{ kind: 'html-contains', needle: 'Overview' },
		{ kind: 'html-contains', needle: 'Analytics' }
	]
};
