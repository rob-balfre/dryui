<script lang="ts">
	import { Button, CodeBlock, Diagram, Heading, Marquee, Tabs, Text } from '@dryui/ui';
	import { allComponentNames, toSlug } from '$lib/nav';
	import type { DiagramConfig } from '@dryui/ui';
	import {
		Rocket,
		User,
		Sparkles,
		Boxes,
		ShieldCheck,
		AppWindow,
		PenLine,
		Package,
		Zap,
		Wrench,
		Palette,
		Check
	} from 'lucide-svelte';
	import AgentLogo from '$lib/components/AgentLogo.svelte';
	import CompetitorLogo from '$lib/components/CompetitorLogo.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import PackageManagerLogo from '$lib/components/PackageManagerLogo.svelte';
	import { homeIntroPrompts } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';
	import { GITHUB_URL } from '$lib/site-meta';

	const componentShowcase = allComponentNames();

	type CompetitorId = 'figma-make' | 'claude-design' | 'stitch' | 'shadcn' | 'v0';

	interface Competitor {
		id: CompetitorId;
		label: string;
		blurb: string;
		them: string[];
		themPrice: string;
		dry: string[];
	}

	const dryPrice = 'Free';

	const competitors: Competitor[] = [
		{
			id: 'figma-make',
			label: 'Figma Make',
			blurb: "Figma's AI-to-code, inside the editor.",
			them: [
				'Prompt → UI screens in Figma',
				'AI-credit metered plans',
				'Generated code, not a library'
			],
			themPrice: 'Est. $15–$90 / mo',
			dry: [
				'Production components, not mockups',
				'Zero runtime dependencies',
				'Maintained library, no lock-in'
			]
		},
		{
			id: 'claude-design',
			label: 'Claude Design',
			blurb: "Anthropic's AI tool for prompts → prototypes and slides.",
			them: [
				'Powered by Claude Opus 4.7',
				'Reads your design system + codebase',
				'One-shot visuals, not a library'
			],
			themPrice: 'Est. $20–$200 / mo',
			dry: [
				'A real library Claude calls via MCP',
				'Persistent; the source of truth',
				'Works with Codex and Gemini too'
			]
		},
		{
			id: 'stitch',
			label: 'Google Stitch',
			blurb: 'Google Labs prompt-to-UI canvas.',
			them: [
				'Natural-language mockups (Stitch 2.0)',
				'Gemini 2.5 Flash / Pro, 200–350 / mo',
				'Design-first canvas, exports to code'
			],
			themPrice: 'Free (Labs, for now)',
			dry: [
				'Typed components, not static mockups',
				'CSS grid + container queries enforced',
				'Works with Gemini CLI via one command'
			]
		},
		{
			id: 'shadcn',
			label: 'shadcn/ui',
			blurb: 'Copy-paste React components on Radix + Tailwind.',
			them: [
				'React-first with Radix and Tailwind',
				'Official MCP for component discovery',
				'Community ports exist, still Tailwind-bound'
			],
			themPrice: 'Free',
			dry: [
				'Same own-the-code ethos, zero deps',
				'No Radix, no Tailwind, no lock-in',
				'MCP + Lint + Theme Wizard + Feedback'
			]
		},
		{
			id: 'v0',
			label: 'v0',
			blurb: "Vercel's AI chat → Next.js + shadcn + Tailwind.",
			them: [
				'Chat → running React app, deploys to Vercel',
				'Mini / Pro / Max token-based tiers',
				'Generated code, not a maintained library'
			],
			themPrice: 'Est. $0–$100+ / mo',
			dry: [
				'Imported package; one update upgrades all',
				'No token meter, no paid tiers',
				'Native browser APIs, no framework lock-in'
			]
		}
	];

	// Tuned to replace the old hand-built SVG 1:1 enough that the homepage can
	// now use <Diagram /> as the source of truth.
	const workflowDiagram: DiagramConfig = {
		direction: 'TB',
		spacing: { cornerRadius: 16, nodeGap: 24, layerGap: 96, backEdgeLaneGap: 144 },
		ariaLabel: 'How DryUI works, rendered with the Diagram component',
		nodes: [
			{
				id: 'you',
				label: 'You',
				description: 'Write a prompt',
				iconComponent: User,
				width: 248,
				height: 128
			},
			{
				id: 'mcp',
				label: 'DryUI MCP',
				description: 'Look up components',
				iconComponent: Boxes,
				width: 224,
				height: 136
			},
			{
				id: 'preprocessor',
				label: 'DryUI Linter',
				description: 'Lint component output',
				iconComponent: ShieldCheck,
				width: 224,
				height: 136
			},
			{
				id: 'app',
				label: 'Your App',
				description: 'Render the UI',
				iconComponent: AppWindow,
				width: 224,
				height: 136
			}
		],
		edges: [
			{ from: 'you', to: 'mcp' },
			{ from: 'mcp', to: 'preprocessor' },
			{ from: 'preprocessor', to: 'app' },
			{
				from: 'app',
				to: 'you',
				waypoint: {
					id: 'live-feedback',
					label: 'Live Feedback',
					description: 'Mark up the running app. Your agent reads it instantly via MCP.',
					iconComponent: PenLine,
					color: 'brand',
					width: 380,
					height: 156,
					position: 0.32
				}
			}
		],
		clusters: [
			{
				id: 'agent',
				label: 'AI Agent',
				iconComponent: Sparkles,
				color: 'brand',
				direction: 'LR',
				dashed: false,
				spacing: { nodeGap: 32, clusterPadding: 36 },
				nodes: ['mcp', 'preprocessor', 'app']
			}
		]
	};
</script>

<svelte:head>
	<title>DryUI - Don't Repeat Yourself.</title>
</svelte:head>

<div class="page">
	<div class="page-stack">
		<section class="hero">
			<div class="brand">
				<Logo />
			</div>
			<Text size="xs" color="secondary" weight="medium">Don't Repeat Yourself</Text>
			<Heading level={1}>Closing the gap between<br />AI-generated & hand-crafted UIs</Heading>
			<Text color="secondary">100% free & open-source.</Text>

			<div class="hero-tabs">
				<Tabs.Root value="bun">
					<Tabs.List --dry-tabs-list-justify="center">
						<Tabs.Trigger value="bun">
							<span class="pm-tab-label"><PackageManagerLogo manager="bun" /> bun</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="npm">
							<span class="pm-tab-label"><PackageManagerLogo manager="npm" /> npm</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="pnpm">
							<span class="pm-tab-label"><PackageManagerLogo manager="pnpm" /> pnpm</span>
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="bun">
						<CodeBlock code={homeIntroPrompts.bun} language="text" />
					</Tabs.Content>
					<Tabs.Content value="npm">
						<CodeBlock code={homeIntroPrompts.npm} language="text" />
					</Tabs.Content>
					<Tabs.Content value="pnpm">
						<CodeBlock code={homeIntroPrompts.pnpm} language="text" />
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<nav aria-label="Homepage links" class="actions">
				<Button variant="solid" size="md" href={withBase('/getting-started')}>
					<Rocket size={16} aria-hidden="true" /> Get Started
				</Button>
				<Button variant="outline" size="md" href={GITHUB_URL} target="_blank" rel="noreferrer">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
						><path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
						/></svg
					> GitHub
				</Button>
			</nav>
		</section>

		<section class="plugins">
			<Text size="xs" color="secondary" weight="medium">Plugin available in</Text>
			<div class="plugins-grid">
				<a class="plugin" href={withBase('/getting-started?plugin=claude-code#install-plugin')}>
					<AgentLogo agent="claude-code" size={40} />
					<span class="plugin-name">Claude Code</span>
				</a>
				<a class="plugin" href={withBase('/getting-started?plugin=codex#install-plugin')}>
					<AgentLogo agent="codex" size={40} />
					<span class="plugin-name">Codex</span>
				</a>
				<a class="plugin" href={withBase('/getting-started?plugin=gemini#install-plugin')}>
					<AgentLogo agent="gemini" size={40} />
					<span class="plugin-name">Gemini CLI</span>
				</a>
				<a class="plugin" href={withBase('/getting-started?plugin=copilot#full-editor-setup')}>
					<AgentLogo agent="copilot" size={40} />
					<span class="plugin-name">Copilot</span>
				</a>
			</div>
			<a class="plugins-manual" href={withBase('/getting-started#full-editor-setup')}>
				<Wrench size={12} aria-hidden="true" />
				<Text size="xs" color="secondary" weight="medium">or configure manually</Text>
			</a>
		</section>

		<section class="showcase">
			<div class="showcase-head">
				<Heading level={2}>What's inside</Heading>
				<Text color="secondary">
					One library, everything you need to ship AI-generated UIs that look hand-crafted.
				</Text>
			</div>

			<div class="stats-grid">
				<div class="stat">
					<Package size={20} aria-hidden="true" />
					<span class="stat-value">160</span>
					<span class="stat-label">Components</span>
				</div>
				<div class="stat">
					<Zap size={20} aria-hidden="true" />
					<span class="stat-value">0</span>
					<span class="stat-label">Runtime deps</span>
				</div>
				<div class="stat">
					<Palette size={20} aria-hidden="true" />
					<span class="stat-value">300+</span>
					<span class="stat-label">Theme tokens</span>
				</div>
			</div>

			<div class="component-marquee">
				<Marquee speed={1500} pauseOnHover fade gap="0.75rem">
					{#each componentShowcase as name (name)}
						<a class="component-chip" href={withBase(`/components/${toSlug(name)}`)}>{name}</a>
					{/each}
				</Marquee>
			</div>

			<ul class="feature-check-list">
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">MCP server</div>
						<p class="feature-note">
							<code>ask</code> and <code>check</code> for agent discovery and validation
						</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">CLI</div>
						<p class="feature-note">
							<code>dryui</code> for setup, lookup, compose, and review
						</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">Lint preprocessor</div>
						<p class="feature-note">CSS grid and container queries, enforced at build time</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">Theme Wizard</div>
						<p class="feature-note">One brand colour, a full <code>--dry-*</code> token palette</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">Live Feedback</div>
						<p class="feature-note">Annotate the running app, your agent reads it via MCP</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">Diagram engine</div>
						<p class="feature-note">Node-and-edge renderer, same one powering this page</p>
					</div>
				</li>
			</ul>
		</section>

		<section class="compare">
			<div class="compare-head">
				<Heading level={2}>How DryUI compares</Heading>
				<Text color="secondary">
					Same AI-native ambition as the rest, but as a zero-dependency component library, free and
					open source, wired into your agent via MCP.
				</Text>
			</div>

			<div class="compare-tabs">
				<Tabs.Root value="figma-make">
					<Tabs.List --dry-tabs-list-justify="center">
						{#each competitors as c (c.id)}
							<Tabs.Trigger value={c.id}>
								<span class="competitor-tab-label">
									<CompetitorLogo id={c.id} size={18} />
									{c.label}
								</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
					{#each competitors as c (c.id)}
						<Tabs.Content value={c.id}>
							<div class="compare-grid">
								<div class="compare-col">
									<div class="compare-col-head">
										<CompetitorLogo id={c.id} size={26} />
										<span class="compare-col-name">{c.label}</span>
									</div>
									<Text size="sm" color="secondary">{c.blurb}</Text>
									<ul class="compare-list">
										{#each c.them as point (point)}
											<li>{point}</li>
										{/each}
									</ul>
									<div class="compare-price">
										<span class="compare-price-label">Pricing</span>
										<span class="compare-price-value">{c.themPrice}</span>
									</div>
								</div>
								<div class="compare-col compare-col--dry">
									<div class="compare-col-head">
										<span class="compare-col-name compare-col-name--dry"><Logo /></span>
									</div>
									<Text size="sm" color="secondary">A component library, not a generator.</Text>
									<ul class="compare-list">
										{#each c.dry as point (point)}
											<li>{point}</li>
										{/each}
									</ul>
									<div class="compare-price compare-price--dry">
										<span class="compare-price-label">Pricing</span>
										<span class="compare-price-value">{dryPrice}</span>
									</div>
								</div>
							</div>
						</Tabs.Content>
					{/each}
				</Tabs.Root>
			</div>
		</section>

		<section class="workflow">
			<Heading level={2}>How DryUI works</Heading>
			<Text color="secondary">
				Start with the DryUI CLI. In AI-editor setups, the MCP server mirrors that same discovery
				and validation loop inside the editor. Generated code runs through the lint preprocessor
				into your app, and feedback loops straight back to the agent. This version is rendered with
				the same <code>@dryui/ui</code>
				<code>&lt;Diagram /&gt;</code>
				component you can ship in your own app.
			</Text>
			<div class="workflow-canvas">
				<Diagram config={workflowDiagram} />
			</div>
		</section>
	</div>
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 48rem);
		justify-content: center;
		align-content: start;
		padding-block: clamp(var(--dry-space-14), 12vw, var(--dry-space-24));
		padding-inline: var(--dry-space-4);
		text-align: center;
	}

	.page-stack {
		container-type: inline-size;
		display: grid;
		gap: clamp(var(--dry-space-14), 10vw, var(--dry-space-24));
		justify-items: center;
	}

	.brand {
		display: grid;
		justify-items: center;
		font-size: clamp(2rem, 5cqi, 3.25rem);
		color: var(--dry-color-text-strong);
	}

	.hero {
		display: grid;
		gap: var(--dry-space-1);
		justify-items: center;
		grid-template-columns: minmax(0, 1fr);
	}

	.hero-tabs {
		justify-self: stretch;
		display: grid;
		padding-block-start: var(--dry-space-4);
	}

	.pm-tab-label,
	.competitor-tab-label {
		display: inline-grid;
		grid-template-columns: auto auto;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.showcase {
		display: grid;
		gap: var(--dry-space-6);
		justify-items: center;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
	}

	.showcase-head {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.stats-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		justify-content: center;
		gap: var(--dry-space-12);
	}

	.stat {
		display: grid;
		justify-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2) var(--dry-space-3);
		color: var(--dry-color-fill-brand);
	}

	.stat-value {
		font-size: clamp(2rem, 6cqi, 2.75rem);
		font-weight: 800;
		line-height: 1;
		color: var(--dry-color-text-strong);
		letter-spacing: -0.02em;
		padding-block-start: var(--dry-space-2);
	}

	.stat-label {
		font-size: var(--dry-type-small-size, 0.875rem);
		color: var(--dry-color-text-weak);
		font-weight: 500;
	}

	.component-marquee {
		justify-self: stretch;
		--dry-marquee-fade-size: 4rem;
	}

	.component-chip,
	.component-chip:link,
	.component-chip:visited,
	.component-chip:hover,
	.component-chip:active,
	.component-chip:focus {
		text-decoration: none;
		text-decoration-line: none;
	}

	.component-chip {
		display: inline-grid;
		place-items: center;
		padding: 0.4rem 0.85rem;
		border-radius: 9999px;
		border: 1px solid var(--dry-color-stroke-weak);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 55%, transparent);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-type-small-size, 0.875rem);
		font-weight: 500;
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
		white-space: nowrap;
		transition:
			border-color 120ms,
			background 120ms,
			color 120ms;
	}

	.component-chip:hover {
		border-color: color-mix(in srgb, var(--dry-color-stroke-brand) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 12%, var(--dry-color-bg-raised));
		color: var(--dry-color-fill-brand);
	}

	.feature-check-list {
		list-style: none;
		margin: 0;
		padding: 0;
		justify-self: stretch;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-4);
		text-align: start;
	}

	.feature-check-list li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: start;
	}

	.feature-check {
		display: inline-grid;
		place-items: center;
		padding: 0.25rem;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 16%, transparent);
		color: var(--dry-color-fill-brand);
	}

	.feature-name {
		font-weight: 700;
		color: var(--dry-color-text-strong);
		line-height: 1.4;
	}

	.feature-note {
		margin: 0;
		padding-block-start: 0.15rem;
		font-size: var(--dry-type-small-size, 0.875rem);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	@container (min-width: 44rem) {
		.feature-check-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			column-gap: var(--dry-space-8);
		}
	}

	@container (max-width: 40rem) {
		.stats-grid {
			grid-auto-flow: row;
			grid-auto-columns: auto;
			gap: var(--dry-space-6);
		}
	}

	.compare {
		display: grid;
		gap: var(--dry-space-5);
		justify-items: center;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
	}

	.compare-head {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.compare-tabs {
		justify-self: stretch;
		display: grid;
	}

	.compare-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--dry-space-4);
		padding-block-start: var(--dry-space-5);
		text-align: start;
	}

	.compare-col {
		display: grid;
		grid-template-rows: auto auto 1fr auto;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 45%, transparent);
	}

	.compare-price {
		display: grid;
		gap: var(--dry-space-0_5);
		padding-block-start: var(--dry-space-3);
		margin-block-start: var(--dry-space-2);
		border-block-start: 1px solid var(--dry-color-stroke-weak);
		align-self: end;
	}

	.compare-price-label {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.compare-price-value {
		font-size: var(--dry-type-small-size, 0.875rem);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		line-height: 1.4;
	}

	.compare-price--dry {
		border-block-start-color: color-mix(in srgb, var(--dry-color-stroke-brand) 50%, transparent);
	}

	.compare-price--dry .compare-price-value {
		color: var(--dry-color-fill-brand);
	}

	.compare-col--dry {
		border-color: color-mix(in srgb, var(--dry-color-stroke-brand) 55%, transparent);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 6%, var(--dry-color-bg-raised));
	}

	.compare-col-head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		justify-content: start;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.compare-col-name {
		font-weight: 700;
		font-size: var(--dry-type-body-size, 1rem);
		color: var(--dry-color-text-strong);
	}

	.compare-col-name--dry {
		font-size: 1.25rem;
	}

	.compare-list {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding-inline-start: var(--dry-space-5);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, 0.875rem);
		line-height: 1.55;
	}

	.compare-list li::marker {
		color: color-mix(in srgb, var(--dry-color-text-weak) 60%, transparent);
	}

	.compare-col--dry .compare-list li::marker {
		color: var(--dry-color-fill-brand);
	}

	@container (max-width: 40rem) {
		.compare-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		justify-content: center;
		gap: var(--dry-space-3);
		padding-block-start: var(--dry-space-4);
	}

	@container (max-width: 28rem) {
		.actions {
			grid-auto-flow: row;
			grid-auto-columns: 1fr;
			justify-self: stretch;
		}
	}

	.plugins {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: center;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
	}

	.plugins-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: var(--dry-space-3);
		justify-self: stretch;
	}

	.plugin {
		display: grid;
		justify-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-5) var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 50%, transparent);
		color: var(--dry-color-text-strong);
		text-decoration: none;
		transition:
			border-color 150ms,
			background 150ms,
			transform 150ms;
	}

	.plugin:hover {
		border-color: var(--dry-color-stroke-brand);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 8%, var(--dry-color-bg-raised));
		transform: translateY(-2px);
	}

	.plugin-name {
		font-size: var(--dry-type-small-size);
		font-weight: 500;
	}

	.plugins-manual {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		align-items: center;
		gap: var(--dry-space-1_5);
		justify-self: center;
		text-decoration: none;
		color: var(--dry-color-text-weak);
		padding-block-start: var(--dry-space-2);
		transition: opacity 150ms;
	}

	.plugins-manual:hover {
		opacity: 0.7;
	}

	@container (max-width: 30rem) {
		.plugins-grid {
			grid-auto-flow: row;
			grid-auto-columns: 1fr;
		}
	}

	.workflow {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: center;
		grid-template-columns: minmax(0, 1fr);
	}

	.workflow-canvas {
		justify-self: stretch;
		display: grid;
		padding-block-start: var(--dry-space-4);
		--dry-diagram-node-bg: color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent);
		--dry-diagram-node-border: color-mix(in srgb, var(--dry-color-stroke-weak) 92%, transparent);
		--dry-diagram-edge-color: color-mix(in srgb, var(--dry-color-text-strong) 92%, transparent);
		--dry-diagram-node-padding: 20px 28px;
		--dry-diagram-node-padding-with-description: 24px 28px;
		--dry-diagram-node-padding-mobile: 16px 18px;
		--dry-diagram-node-padding-with-description-mobile: 18px 20px;
		--dry-diagram-node-gap: 10px;
		--dry-diagram-node-gap-with-description: 8px;
		--dry-diagram-node-label-size: 1.125rem;
		--dry-diagram-node-label-size-with-description: 1.375rem;
		--dry-diagram-node-description-size: 0.9375rem;
		--dry-diagram-cluster-label-size: 0.875rem;
		--dry-diagram-cluster-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 5%,
			var(--dry-color-bg-base)
		);
		--dry-diagram-cluster-border: color-mix(
			in srgb,
			var(--dry-color-stroke-brand) 60%,
			transparent
		);
		--dry-diagram-text-muted: var(--dry-color-text-weak);
	}
</style>
