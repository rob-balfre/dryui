<script lang="ts">
	import {
		AppFrame,
		Button,
		CodeBlock,
		Diagram,
		Heading,
		Hotkey,
		Marquee,
		Tabs,
		Text,
		TypingIndicator,
		VisuallyHidden
	} from '@dryui/ui';
	import { getReducedMotionPreference } from '@dryui/primitives';
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
		Wrench,
		Check,
		ChevronRight,
		Compass,
		Cpu,
		Bot,
		GitCompare,
		Workflow,
		Hand,
		PackageOpen
	} from 'lucide-svelte';
	import AgentLogo from '$lib/components/AgentLogo.svelte';
	import CompetitorLogo from '$lib/components/CompetitorLogo.svelte';
	import GithubIcon from '$lib/components/GithubIcon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import PackageManagerLogo from '$lib/components/PackageManagerLogo.svelte';
	import { homeIntroPrompts } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';
	import { GITHUB_URL, SITE_DESCRIPTION } from '$lib/site-meta';

	const componentShowcase = allComponentNames();

	const userMessage = 'build a polished settings screen in Svelte';
	const assistantMessage =
		'I will use DryUI: ask for the component contract, build with tokens, run check, then wire feedback into the next pass.';

	const userChars = [...userMessage];
	const assistantChars = [...assistantMessage];

	let userTypedLen = $state(0);
	let assistantVisible = $state(false);
	let assistantThinking = $state(false);
	let assistantTypedLen = $state(0);
	let chromeRevealed = $state(false);
	let cinematicComplete = $state(false);
	let cinematicSkipped = $state(false);
	let cinematicBypassed = $state(false);
	let hydrated = $state(false);
	let cinematicCancelled = false;
	let cinematicTimers: ReturnType<typeof setTimeout>[] = [];

	function jumpToFinal() {
		userTypedLen = userMessage.length;
		assistantVisible = true;
		assistantThinking = false;
		assistantTypedLen = assistantMessage.length;
		chromeRevealed = true;
		cinematicComplete = true;
	}

	function shouldBypassCinematic(): boolean {
		if (typeof window === 'undefined') return true;
		return getReducedMotionPreference();
	}

	function clearCinematicPlayback() {
		cinematicCancelled = true;
		for (const id of cinematicTimers) clearTimeout(id);
		cinematicTimers = [];
	}

	const canSkip = $derived(
		hydrated && !cinematicBypassed && !cinematicSkipped && !cinematicComplete
	);
	const animationDisabled = $derived(cinematicBypassed || cinematicSkipped);

	function skipCinematic() {
		if (!canSkip) return;
		cinematicSkipped = true;
		clearCinematicPlayback();
		jumpToFinal();
	}

	$effect(() => {
		if (shouldBypassCinematic()) {
			jumpToFinal();
			cinematicBypassed = true;
			hydrated = true;
			return;
		}

		hydrated = true;
		cinematicCancelled = false;
		cinematicTimers = [];

		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = setTimeout(resolve, ms);
				cinematicTimers.push(id);
			});

		const typewriter = (total: number, charDelay: number, setter: (value: number) => void) =>
			new Promise<void>((resolve) => {
				let i = 0;
				const tick = () => {
					if (cinematicCancelled) return resolve();
					if (i >= total) return resolve();
					i += 1;
					setter(i);
					cinematicTimers.push(setTimeout(tick, charDelay));
				};
				tick();
			});

		(async () => {
			await wait(120);
			if (cinematicCancelled) return;
			chromeRevealed = true;
			await wait(520);
			if (cinematicCancelled) return;
			await typewriter(userChars.length, 55, (n) => (userTypedLen = n));
			if (cinematicCancelled) return;
			await wait(500);
			if (cinematicCancelled) return;
			assistantVisible = true;
			assistantThinking = true;
			await wait(1200);
			if (cinematicCancelled) return;
			assistantThinking = false;
			await typewriter(assistantChars.length, 28, (n) => (assistantTypedLen = n));
			if (cinematicCancelled) return;
			await wait(500);
			if (cinematicCancelled) return;
			cinematicComplete = true;
			cinematicTimers = [];
		})();

		return () => clearCinematicPlayback();
	});

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
			blurb: "Anthropic's AI, prompts → prototypes.",
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
				'Ports exist, still Tailwind-bound'
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
				'Chat → React app, deploys to Vercel',
				'Mini / Pro / Max token-based tiers',
				'Generated code, not a maintained library'
			],
			themPrice: 'Est. $0–$100+ / mo',
			dry: [
				'Imported package, updates upgrade all',
				'No token meter, no paid tiers',
				'Native browser APIs, no framework lock-in'
			]
		}
	];

	const workflowDiagram: DiagramConfig = {
		direction: 'TB',
		spacing: { cornerRadius: 16, nodeGap: 28, layerGap: 112, backEdgeLaneGap: 240 },
		ariaLabel: 'How DryUI works, rendered with the Diagram component',
		nodes: [
			{
				id: 'you',
				label: 'You',
				description: 'Write a prompt',
				iconComponent: User,
				width: 280,
				height: 144
			},
			{
				id: 'mcp',
				label: 'DryUI MCP',
				description: 'Look up components',
				iconComponent: Boxes,
				width: 236,
				height: 152
			},
			{
				id: 'preprocessor',
				label: 'DryUI Linter',
				description: 'Lint component output',
				iconComponent: ShieldCheck,
				width: 236,
				height: 152
			},
			{
				id: 'app',
				label: 'Your App',
				description: 'Render the UI',
				iconComponent: AppWindow,
				width: 236,
				height: 152
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
					width: 420,
					height: 172,
					position: 0.36
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
				spacing: { nodeGap: 24, clusterPadding: 32 },
				nodes: ['mcp', 'preprocessor', 'app']
			}
		]
	};

	let workflowCanvasEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!workflowCanvasEl) return;
		const node = workflowCanvasEl;
		const apply = () => {
			const svg = node.querySelector('svg');
			if (!svg) return;
			const cluster = svg.querySelector<SVGRectElement>('[data-part="cluster-box"]');
			if (!cluster) return;
			const right =
				parseFloat(cluster.getAttribute('x') ?? '0') +
				parseFloat(cluster.getAttribute('width') ?? '0');
			const paths = svg.querySelectorAll<SVGPathElement>('[data-part="edge-path"]');
			for (const path of paths) {
				const d = path.getAttribute('d') ?? '';
				const match = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)\s+L\s+([\d.-]+)\s+([\d.-]+)/);
				if (!match || match.length < 5) continue;
				const x1 = match[1] as string;
				const y1 = match[2] as string;
				const x2 = match[3] as string;
				const y2 = match[4] as string;
				const startX = parseFloat(x1);
				const endX = parseFloat(x2);
				if (y1 !== y2) continue;
				if (startX < right && endX > right) {
					path.setAttribute('d', d.replace(/^M\s+[\d.-]+\s+[\d.-]+/, `M ${right} ${y1}`));
				}
			}
		};
		apply();
		const observer = new MutationObserver(apply);
		observer.observe(node, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['d']
		});
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>DryUI - UI rails for AI agents</title>
</svelte:head>

<Hotkey keys="escape" handler={skipCinematic} enabled={canSkip} />

<div class="page">
	<div class="page-stack">
		<section class="hero" class:hero--no-motion={cinematicBypassed || cinematicSkipped}>
			<div class="hero-main">
				<div class="hero-copy">
					<p class="hero-kicker">AI component rails</p>
					<VisuallyHidden>
						<Heading level={1}>DryUI. UI rails for AI agents.</Heading>
					</VisuallyHidden>
					<div class="hero-lockup" aria-hidden="true">
						<div class="hero-brand">
							<Logo />
						</div>
						<div class="hero-headline-visual">
							<span class="hero-headline-text">UI rails for agents that ship.</span>
						</div>
					</div>
					<Text size="md" color="secondary" weight="medium">
						{SITE_DESCRIPTION}
					</Text>

					<ul class="hero-proof" aria-label="DryUI workflow proof points">
						<li>
							<span class="hero-proof-key">ask</span>
							<span class="hero-proof-value">component contracts before code</span>
						</li>
						<li>
							<span class="hero-proof-key">check</span>
							<span class="hero-proof-value">tokens, a11y, and CSS discipline</span>
						</li>
						<li>
							<span class="hero-proof-key">mark up</span>
							<span class="hero-proof-value">live feedback back into the agent</span>
						</li>
					</ul>

					<nav aria-label="Homepage links" class="actions">
						<span class="cta-warm">
							<Button variant="solid" size="md" href={withBase('/getting-started')}>
								<Rocket size={16} aria-hidden="true" /> Get Started
							</Button>
						</span>
						<Button variant="outline" size="md" href={GITHUB_URL} target="_blank" rel="noreferrer">
							<GithubIcon size={16} /> GitHub
						</Button>
					</nav>
				</div>
				<div class="hero-intro">
					<div class="hero-intro-frame">
						<AppFrame
							title={chromeRevealed ? 'dryui.loop' : ''}
							--dry-app-frame-content-padding="var(--dry-space-5)"
							--dry-app-frame-transition={animationDisabled ? '0s' : '700ms'}
							--dry-app-frame-bg={chromeRevealed ? 'var(--dry-color-bg-base)' : 'transparent'}
							--dry-app-frame-border={chromeRevealed
								? 'var(--dry-color-stroke-weak)'
								: 'transparent'}
							--dry-app-frame-chrome-bg={chromeRevealed
								? 'var(--dry-color-bg-raised)'
								: 'transparent'}
							--dry-app-frame-dot-close={chromeRevealed ? 'oklch(65% 0.14 25)' : 'transparent'}
							--dry-app-frame-dot-min={chromeRevealed ? 'oklch(80% 0.15 80)' : 'transparent'}
							--dry-app-frame-dot-max={chromeRevealed ? 'oklch(65% 0.16 140)' : 'transparent'}
						>
							<div class="hero-chat" aria-label="Why DryUI, shown as a chat conversation">
								<div class="chat-row" data-role="user">
									<div class="chat-msg" data-role="user">
										<span class="chat-msg-prompt" aria-hidden="true"
											><ChevronRight size={16} /></span
										>
										<span class="chat-msg-text" aria-label={userMessage}
											>{#each userChars as char, i (i)}<span
													class="chat-msg-char"
													data-on={i < userTypedLen || undefined}
													aria-hidden="true">{char}</span
												>{/each}</span
										>
									</div>
								</div>

								{#if assistantVisible}
									<div class="chat-row" data-role="assistant">
										<div class="chat-msg" data-role="assistant">
											<span class="chat-msg-prompt" aria-hidden="true"
												><ChevronRight size={16} /></span
											>
											{#if assistantThinking}
												<TypingIndicator aria-label="Agent is typing" />
											{:else}
												<span class="chat-msg-text" aria-label={assistantMessage}
													>{#each assistantChars as char, i (i)}<span
															class="chat-msg-char"
															data-on={i < assistantTypedLen || undefined}
															aria-hidden="true">{char}</span
														>{/each}</span
												>
											{/if}
										</div>
									</div>
								{/if}
							</div>

							<div class="hero-loop" aria-hidden="true">
								<span>ask</span>
								<span>build</span>
								<span>check</span>
								<span>feedback</span>
							</div>
						</AppFrame>
					</div>
				</div>
				<div class="hero-install">
					<div class="hero-tabs">
						<Tabs.Root value="bun">
							<div class="hero-tabs-list">
								<Tabs.List>
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
							</div>
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
				</div>

				<Text size="xs" color="secondary">Free, open source, Svelte native.</Text>

				{#if canSkip}
					<div class="hero-skip">
						<Button
							variant="bare"
							size="sm"
							aria-label="Skip intro animation"
							onclick={skipCinematic}
						>
							Skip (or hit esc)
						</Button>
					</div>
				{/if}
			</div>

			<section class="plugins">
				<Text size="xs" color="secondary" weight="medium">Supported in</Text>
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
					<a class="plugin" href={withBase('/getting-started?plugin=opencode#install-plugin')}>
						<AgentLogo agent="opencode" size={40} />
						<span class="plugin-name">OpenCode</span>
					</a>
					<a class="plugin" href={withBase('/getting-started?plugin=copilot#install-plugin')}>
						<AgentLogo agent="copilot" size={40} />
						<span class="plugin-name">Copilot</span>
					</a>
					<a class="plugin" href={withBase('/getting-started?plugin=cursor#install-plugin')}>
						<AgentLogo agent="cursor" size={40} />
						<span class="plugin-name">Cursor</span>
					</a>
					<a class="plugin" href={withBase('/getting-started?plugin=windsurf#install-plugin')}>
						<AgentLogo agent="windsurf" size={40} />
						<span class="plugin-name">Windsurf</span>
					</a>
					<a class="plugin" href={withBase('/getting-started?plugin=zed#install-plugin')}>
						<AgentLogo agent="zed" size={40} />
						<span class="plugin-name">Zed</span>
					</a>
				</div>
				<a class="plugins-manual" href={withBase('/getting-started#full-editor-setup')}>
					<Text size="xs" color="secondary" weight="medium">or configure manually.</Text>
				</a>
			</section>
		</section>

		<section class="showcase">
			<div class="showcase-head">
				<span class="section-label"><span class="section-num">01</span> Inventory</span>
				<span class="section-icon"><PackageOpen size={20} aria-hidden="true" /></span>
				<Heading level={2}>The rails</Heading>
				<Text color="secondary"
					>Components, tokens, checks, and feedback in one agent-readable loop.</Text
				>
			</div>

			<div class="component-marquee">
				<Marquee speed={60} pauseOnHover fade gap="0.75rem">
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
							<code>ask</code> before writing, <code>check</code> after
						</p>
					</div>
				</li>
				<li>
					<span class="feature-check"><Check size={18} aria-hidden="true" /></span>
					<div>
						<div class="feature-name">CLI</div>
						<p class="feature-note">
							<code>dryui</code> for setup, lookup, tokens, and feedback
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
				<span class="section-label"><span class="section-num">02</span> Comparison</span>
				<span class="section-icon"><GitCompare size={20} aria-hidden="true" /></span>
				<Heading level={2}>Systems beat generators</Heading>
				<Text color="secondary">
					A zero-dependency library, free and open source, wired to your agent via MCP.
				</Text>
			</div>

			<div class="compare-tabs">
				<Tabs.Root value="figma-make">
					<div class="compare-tabs-list">
						<Tabs.List>
							{#each competitors as c (c.id)}
								<Tabs.Trigger value={c.id}>
									<span class="competitor-tab-label">
										<CompetitorLogo id={c.id} size={18} />
										{c.label}
									</span>
								</Tabs.Trigger>
							{/each}
						</Tabs.List>
					</div>
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
			<Text size="xs" color="secondary">You just need an AI agent (free local ones work fine).</Text
			>
		</section>
	</div>

	<section class="workflow">
		<div class="workflow-head">
			<span class="section-label"><span class="section-num">03</span> Workflow</span>
			<span class="section-icon"><Workflow size={20} aria-hidden="true" /></span>
			<Heading level={2}>The loop</Heading>
			<Text color="secondary"
				>Prompt in. Contract found. UI checked. Feedback returns to the agent.</Text
			>
		</div>
		<div bind:this={workflowCanvasEl} class="workflow-canvas">
			<Diagram config={workflowDiagram} />
		</div>
		<Text size="xs" color="secondary">
			This is the
			<a class="workflow-link" href={withBase('/components/diagram')}
				><code>&lt;Diagram /&gt;</code></a
			> component. Drop it into your app.
		</Text>
	</section>

	<section class="hood">
		<div class="hood-head">
			<span class="section-label"><span class="section-num">04</span> Stack</span>
			<span class="section-icon"><Wrench size={20} aria-hidden="true" /></span>
			<Heading level={2}>Under the hood</Heading>
			<Text color="secondary">Why we built DryUI on Svelte 5 and SvelteKit, not React.</Text>
		</div>

		<div class="hood-editorial">
			<article class="hood-claim hood-claim--compiler">
				<header class="hood-claim-head">
					<span class="hood-claim-kicker">Compiler-first</span>
					<span class="hood-claim-badge" aria-hidden="true"><Cpu size={16} /></span>
				</header>
				<p class="hood-claim-lede">
					Svelte compiles to plain DOM updates. No virtual DOM, no runtime tax.
					<span class="hood-highlight"
						>DryUI hooks into that compile step to lint your code before it ships.</span
					>
				</p>
				<div class="hood-compiler-demo" aria-hidden="true">
					<div class="hood-compiler-source">
						<span class="hood-compiler-tag">.svelte</span>
						<pre class="hood-compiler-code"><code
								><span class="tok-punc">&lt;</span><span class="tok-tag">Button</span> <span
									class="tok-attr">variant</span
								><span class="tok-punc">=</span><span class="tok-str">"solid"</span><span
									class="tok-punc">&gt;</span
								>Ship it<span class="tok-punc">&lt;/</span><span class="tok-tag">Button</span><span
									class="tok-punc">&gt;</span
								></code
							></pre>
					</div>
					<span class="hood-compiler-arrow" aria-hidden="true">→</span>
					<div class="hood-compiler-out">
						<span class="hood-compiler-tag">compiled DOM</span>
						<pre class="hood-compiler-code"><code
								><span class="tok-punc">&lt;</span><span class="tok-tag">button</span> <span
									class="tok-attr">class</span
								><span class="tok-punc">=</span><span class="tok-str">"dry-btn"</span><span
									class="tok-punc">&gt;</span
								>Ship it<span class="tok-punc">&lt;/</span><span class="tok-tag">button</span><span
									class="tok-punc">&gt;</span
								></code
							></pre>
					</div>
				</div>
			</article>

			<article class="hood-claim hood-claim--agents">
				<header class="hood-claim-head">
					<span class="hood-claim-kicker">One path for agents</span>
					<span class="hood-claim-badge" aria-hidden="true"><Bot size={16} /></span>
				</header>
				<p class="hood-claim-lede">
					Too much choice confuses LLMs.
					<span class="hood-highlight">Svelte gives them one obvious path.</span>
				</p>
				<ul class="hood-stack" aria-label="React ecosystem sprawl versus Svelte's single path">
					<li class="hood-stack-item hood-stack-item--strike">Redux</li>
					<li class="hood-stack-item hood-stack-item--strike">Zustand</li>
					<li class="hood-stack-item hood-stack-item--strike">Tailwind</li>
					<li class="hood-stack-item hood-stack-item--strike">CSS-in-JS</li>
					<li class="hood-stack-item hood-stack-item--strike">TanStack Router</li>
					<li class="hood-stack-item hood-stack-item--strike">Next.js</li>
					<li class="hood-stack-item hood-stack-item--strike">Remix</li>
					<li class="hood-stack-item hood-stack-item--keep">Svelte</li>
				</ul>
			</article>

			<article class="hood-claim hood-claim--prose">
				<header class="hood-claim-head">
					<span class="hood-claim-kicker">Opinionated, batteries included</span>
					<span class="hood-claim-badge" aria-hidden="true"><Compass size={16} /></span>
				</header>
				<p class="hood-claim-prose">
					One framework, one way to do things:
					<code class="hood-code">runes</code> for state,
					<code class="hood-code">scoped styles</code> for CSS,
					<code class="hood-code">file-based routing</code> out of the box, plus SSR, endpoints, forms,
					and transitions. No "pick your stack" meeting, no half a dozen libraries to wire together. You
					open the editor and start building.
				</p>
			</article>
		</div>

		<Text size="xs" color="secondary">
			Learning a new framework is a problem of the past. Your agent already speaks Svelte.
		</Text>
	</section>

	<section class="cta">
		<span class="section-label"><span class="section-num">05</span> Next</span>
		<span class="section-icon"><Hand size={20} aria-hidden="true" /></span>
		<Heading level={2}>Give your agent rails.</Heading>
		<Text color="secondary"
			>Install the plugin, connect MCP, and start building against contracts.</Text
		>
		<nav aria-label="Get started links" class="actions">
			<span class="cta-warm">
				<Button variant="solid" size="md" href={withBase('/getting-started')}>
					<Rocket size={16} aria-hidden="true" /> Get Started
				</Button>
			</span>
			<Button variant="outline" size="md" href={GITHUB_URL} target="_blank" rel="noreferrer">
				<GithubIcon size={16} /> GitHub
			</Button>
		</nav>
	</section>
</div>

<style>
	.page {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		gap: clamp(var(--dry-space-20), 14vw, var(--dry-space-32));
		padding-block: 0 clamp(var(--dry-space-20), 16vw, var(--dry-space-32));
		padding-inline: var(--dry-space-4);
		text-align: start;
		isolation: isolate;
	}

	.page-stack {
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		gap: clamp(var(--dry-space-20), 14vw, var(--dry-space-32));
		justify-items: center;
		--dry-type-heading-1-size: 2.25rem;
		--dry-type-heading-1-leading: 1.15;
		--dry-type-heading-2-size: 1.875rem;
		--dry-type-heading-2-leading: 1.2;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: 1fr auto;
		justify-items: stretch;
		min-block-size: min(88svh, 54rem);
		padding-block: var(--dry-space-8) var(--dry-space-6);
		row-gap: var(--dry-space-8);
	}

	.hero--no-motion .chat-msg,
	.hero--no-motion .chat-row[data-role='assistant'] {
		transition: none;
		animation: none;
	}

	.hero-main {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		align-content: center;
		gap: var(--dry-space-8);
		justify-self: stretch;
		min-block-size: 0;
	}

	.hero-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-5);
		align-content: center;
	}

	.hero-kicker {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--dry-color-fill-brand-active);
	}

	.hero-lockup {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-items: start;
		gap: var(--dry-space-4);
	}

	.hero-headline-visual {
		max-inline-size: 10ch;
		font-size: 4.75rem;
		line-height: 0.94;
		font-weight: 850;
		letter-spacing: 0;
		color: var(--dry-color-text-strong);
		text-wrap: balance;
	}

	.hero-headline-text {
		position: relative;
		display: inline-block;
	}

	.hero-brand {
		display: grid;
		justify-items: start;
		font-size: 2.75rem;
		color: var(--dry-color-text-strong);
	}

	.hero-proof {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-2);
		max-inline-size: 62ch;
	}

	.hero-proof li {
		display: grid;
		grid-template-columns: 5.25rem minmax(0, 1fr);
		align-items: baseline;
		gap: var(--dry-space-3);
		padding-block: var(--dry-space-2);
		border-block-end: 1px solid var(--dry-color-stroke-weak);
	}

	.hero-proof-key {
		font-family: var(--dry-font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--dry-color-fill-accent-active);
	}

	.hero-proof-value {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size);
		line-height: 1.45;
	}

	.hero-intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-content: center;
		justify-self: stretch;
		gap: var(--dry-space-3);
	}

	.hero-intro-frame {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
	}

	@container (min-width: 58rem) {
		.hero-main {
			grid-template-columns: minmax(0, 0.86fr) minmax(24rem, 1fr);
			column-gap: var(--dry-space-12);
		}

		.hero-install {
			grid-column: 1 / -1;
			justify-self: start;
		}
	}

	@container (max-width: 44rem) {
		.hero {
			min-block-size: auto;
			padding-block-start: var(--dry-space-5);
		}

		.hero-headline-visual {
			max-inline-size: 12ch;
			font-size: 2.85rem;
		}

		.hero-brand {
			font-size: 2.1rem;
		}
	}

	.hero-skip {
		position: fixed;
		inset-inline-start: 50%;
		inset-block-end: clamp(var(--dry-space-3), 3vh, var(--dry-space-6));
		transform: translateX(-50%);
		z-index: 20;
		--dry-btn-bg: color-mix(in srgb, var(--dry-color-bg-base) 72%, transparent);
		--dry-btn-color: var(--dry-color-text-weak);
		--dry-btn-border: color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		--dry-btn-radius: var(--dry-radius-full);
		--dry-btn-padding-x: var(--dry-space-3);
		--dry-btn-padding-y: var(--dry-space-1_5);
		--dry-btn-font-size: 0.75rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.01em;
		opacity: 0.72;
		backdrop-filter: blur(6px);
		transition: opacity 120ms ease;
	}

	.hero-skip:hover,
	.hero-skip:focus-within {
		opacity: 1;
		--dry-btn-color: var(--dry-color-text-strong);
		--dry-btn-border: color-mix(in srgb, var(--dry-color-stroke-brand) 45%, transparent);
		--dry-btn-bg: color-mix(in srgb, var(--dry-color-bg-raised) 92%, transparent);
	}

	.hero-install {
		display: grid;
		grid-template-columns: minmax(0, 46rem);
		gap: var(--dry-space-4);
		justify-items: stretch;
		justify-self: stretch;
	}

	.hero-chat {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-4);
		text-align: start;
	}

	.hero-loop {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--dry-space-2);
		margin-block-start: var(--dry-space-5);
		padding-block-start: var(--dry-space-4);
		border-block-start: 1px solid var(--dry-color-stroke-weak);
	}

	.hero-loop span {
		display: grid;
		place-items: center;
		min-block-size: 2rem;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-fill-accent) 8%, transparent);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	@container (max-width: 32rem) {
		.hero-proof li {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--dry-space-1);
		}

		.hero-loop {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.chat-row {
		display: grid;
		justify-content: start;
	}

	.chat-row[data-role='assistant'] {
		animation: assistant-row-enter 600ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
	}

	@keyframes assistant-row-enter {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.chat-msg {
		display: grid;
		grid-template-columns: auto minmax(0, 46rem);
		gap: var(--dry-space-2);
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
		font-size: var(--dry-type-small-size, 0.9375rem);
		line-height: 1.55;
		color: var(--dry-color-text-strong);
	}

	.chat-msg-prompt {
		align-self: start;
		padding-block-start: 0.2em;
		color: var(--dry-color-fill-brand);
	}

	.chat-msg[data-role='assistant'] .chat-msg-prompt {
		visibility: hidden;
	}

	.chat-msg-char {
		visibility: hidden;
	}

	.chat-msg-char[data-on] {
		visibility: visible;
	}

	@media (prefers-reduced-motion: reduce) {
		.chat-msg,
		.chat-row[data-role='assistant'] {
			transition: none;
			animation: none;
		}
	}

	.hero-tabs {
		justify-self: stretch;
		display: grid;
	}

	.hero-tabs-list {
		--dry-tabs-list-justify: center;
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
		padding: var(--dry-space-1_5) var(--dry-space-3);
		border-radius: var(--dry-radius-full);
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
		padding: var(--dry-space-1);
		border-radius: var(--dry-radius-full);
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

	.compare {
		display: grid;
		gap: var(--dry-space-6);
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

	.compare-tabs-list {
		--dry-tabs-list-justify: center;
	}

	.compare-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--dry-space-4);
		padding-block-start: var(--dry-space-4);
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
		font-size: var(--dry-type-xs-size, 0.75rem);
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
		padding: var(--dry-space-6) 0;
	}

	.hero-copy .actions {
		justify-content: start;
		padding-block: var(--dry-space-2) 0;
	}

	.cta-warm {
		display: inline-grid;
		border-radius: var(--dry-radius-md);
		transform: translateY(0);
		transition:
			transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1);
		--dry-btn-border: color-mix(in srgb, var(--dry-color-fill-accent) 55%, transparent);
	}

	.cta-warm:hover {
		transform: translateY(-1px);
		--dry-btn-border: var(--dry-color-fill-accent-active);
		box-shadow:
			0 8px 20px -10px color-mix(in srgb, var(--dry-color-fill-accent) 65%, transparent),
			0 2px 6px -3px color-mix(in srgb, var(--dry-color-fill-accent-active) 55%, transparent);
	}

	.cta-warm:focus-within {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--dry-color-fill-accent) 30%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.cta-warm {
			transition: none;
		}
		.cta-warm:hover {
			transform: none;
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
		grid-template-columns: repeat(4, minmax(0, 1fr));
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
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.workflow {
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		gap: var(--dry-space-6);
		justify-items: center;
	}

	.workflow-head {
		display: grid;
		grid-template-columns: minmax(0, 36rem);
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.workflow-link {
		color: inherit;
		text-decoration: none;
		transition: color 150ms;
	}

	.workflow-link:hover {
		color: var(--dry-color-fill-brand);
	}

	.workflow-canvas {
		justify-self: stretch;
		display: grid;
		--dry-diagram-node-bg: color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent);
		--dry-diagram-node-border: color-mix(in srgb, var(--dry-color-stroke-weak) 92%, transparent);
		--dry-diagram-edge-color: color-mix(in srgb, var(--dry-color-text-strong) 92%, transparent);
		--dry-diagram-node-padding: 24px 24px;
		--dry-diagram-node-padding-with-description: 26px 24px;
		--dry-diagram-node-padding-mobile: 18px 22px;
		--dry-diagram-node-padding-with-description-mobile: 20px 24px;
		--dry-diagram-node-gap: 12px;
		--dry-diagram-node-gap-with-description: 10px;
		--dry-diagram-node-label-size: 1.25rem;
		--dry-diagram-node-label-size-with-description: 1.5rem;
		--dry-diagram-node-description-size: 1rem;
		--dry-diagram-cluster-label-size: 0.9375rem;
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

	.hood {
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 56rem);
		justify-content: center;
		gap: var(--dry-space-6);
		justify-items: center;
	}

	.hood-head {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.section-icon {
		display: inline-grid;
		place-items: center;
		padding: var(--dry-space-2);
		border-radius: var(--dry-radius-full);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		color: var(--dry-color-fill-brand);
		justify-self: center;
		margin-block-end: var(--dry-space-2);
	}

	.section-label {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: baseline;
		gap: var(--dry-space-2);
		justify-self: center;
		margin-block-end: var(--dry-space-1);
		font-family: var(--dry-font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.section-num {
		color: var(--dry-color-fill-accent-active);
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.hood-editorial {
		justify-self: stretch;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-6);
		text-align: start;
	}

	@container (min-width: 44rem) {
		.hood-editorial {
			grid-template-columns: 1.35fr 1fr;
			grid-template-rows: auto auto;
			column-gap: var(--dry-space-6);
			row-gap: var(--dry-space-6);
		}
		.hood-claim--compiler {
			grid-column: 1 / 2;
			grid-row: 1 / 2;
		}
		.hood-claim--agents {
			grid-column: 2 / 3;
			grid-row: 1 / 3;
		}
		.hood-claim--prose {
			grid-column: 1 / 2;
			grid-row: 2 / 3;
		}
	}

	.hood-claim {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 80%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 32%, transparent);
	}

	.hood-claim--agents {
		background: color-mix(in srgb, var(--dry-color-bg-raised) 48%, transparent);
		border-color: color-mix(in srgb, var(--dry-color-stroke-weak) 90%, transparent);
		align-content: start;
	}

	.hood-claim--prose {
		background: transparent;
		border: none;
		padding: var(--dry-space-2) 0 0;
	}

	.hood-claim-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.hood-claim-kicker {
		font-family: var(--dry-font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--dry-color-text-strong);
		font-weight: 600;
	}

	.hood-claim-badge {
		display: inline-grid;
		place-items: center;
		grid-template-columns: 1.75rem;
		grid-template-rows: 1.75rem;
		border-radius: var(--dry-radius-full);
		background: color-mix(in srgb, var(--dry-color-fill-accent) 18%, transparent);
		color: var(--dry-color-fill-accent-active);
	}

	.hood-claim-lede {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		color: var(--dry-color-text-weak);
	}

	.hood-highlight {
		color: var(--dry-color-text-strong);
		font-weight: 500;
	}

	.hood-claim-prose {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--dry-color-text-weak);
	}

	.hood-claim-prose .hood-code {
		font-family: var(--dry-font-mono);
		font-size: 0.9em;
		background: color-mix(in srgb, var(--dry-color-fill-accent) 10%, var(--dry-color-bg-raised));
		color: var(--dry-color-text-strong);
		padding: 0.1em 0.4em;
		border-radius: var(--dry-radius-sm);
	}

	/* Compiler demo block: source on the left, compiled DOM on the right, arrow between.
	   Varies rhythm from the other claim. Uses the mono-ui face throughout. */
	.hood-compiler-demo {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border: 1px dashed color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-base) 60%, transparent);
	}

	.hood-compiler-source,
	.hood-compiler-out {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-1);
	}

	.hood-compiler-tag {
		font-family: var(--dry-font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.hood-compiler-code {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: 0.75rem;
		line-height: 1.5;
		white-space: nowrap;
		overflow-x: auto;
		color: var(--dry-color-text-strong);
	}

	.hood-compiler-code .tok-tag {
		color: var(--dry-color-fill-brand);
	}
	.hood-compiler-code .tok-attr {
		color: var(--dry-color-fill-accent-active);
	}
	.hood-compiler-code .tok-str {
		color: color-mix(in oklch, var(--dry-color-text-strong) 70%, var(--dry-color-fill-accent));
	}
	.hood-compiler-code .tok-punc {
		color: var(--dry-color-text-weak);
	}

	.hood-compiler-arrow {
		font-family: var(--dry-font-mono);
		font-size: 1.25rem;
		color: var(--dry-color-fill-accent-active);
		padding-inline: var(--dry-space-1);
	}

	@container (max-width: 32rem) {
		.hood-compiler-demo {
			grid-template-columns: minmax(0, 1fr);
			grid-auto-rows: auto;
		}
		.hood-compiler-arrow {
			justify-self: start;
			transform: rotate(90deg);
			padding: var(--dry-space-1) 0;
		}
	}

	/* Framework stack: struck-out competitors, Svelte standing. */
	.hood-stack {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-1_5);
		font-family: var(--dry-font-mono);
	}

	.hood-stack-item {
		display: grid;
		grid-template-columns: 1.25rem minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: 0.8125rem;
		border-radius: var(--dry-radius-sm);
	}

	.hood-stack-item::before {
		content: '';
		display: grid;
		grid-template-columns: 0.5rem;
		grid-template-rows: 0.5rem;
		border-radius: 50%;
		justify-self: center;
	}

	.hood-stack-item--strike {
		color: color-mix(in srgb, var(--dry-color-text-weak) 80%, transparent);
		text-decoration: line-through;
		text-decoration-color: color-mix(in srgb, var(--dry-color-text-weak) 60%, transparent);
		text-decoration-thickness: 1px;
	}

	.hood-stack-item--strike::before {
		background: color-mix(in srgb, var(--dry-color-text-weak) 40%, transparent);
	}

	.hood-stack-item--keep {
		color: var(--dry-color-text-strong);
		font-weight: 700;
		background: color-mix(in srgb, var(--dry-color-fill-accent) 14%, transparent);
		border: 1px solid color-mix(in srgb, var(--dry-color-fill-accent) 35%, transparent);
	}

	.hood-stack-item--keep::before {
		background: var(--dry-color-fill-accent-active);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--dry-color-fill-accent) 25%, transparent);
	}

	.cta {
		display: grid;
		grid-template-columns: minmax(0, 36rem);
		justify-content: center;
		justify-items: center;
	}
</style>
