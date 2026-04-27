<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { Card, Container, Diagram } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';
	import {
		AppWindow,
		Atom,
		BookOpen,
		Boxes,
		Brain,
		Camera,
		CircleCheck,
		CircleQuestionMark,
		Code,
		Database,
		Download,
		Eye,
		FileCode,
		FileText,
		Globe,
		Keyboard,
		Layers,
		LayoutDashboard,
		Library,
		ListChecks,
		MessageSquare,
		Package,
		Paintbrush,
		Palette,
		PenLine,
		Plug,
		Play,
		Puzzle,
		Radio,
		RefreshCw,
		Route,
		Scissors,
		Search,
		Settings2,
		ShieldCheck,
		Sparkles,
		Split,
		Terminal,
		TriangleAlert,
		Upload,
		WandSparkles,
		Workflow,
		Zap
	} from 'lucide-svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';

	const sharedSpacing = { nodeGap: 28, layerGap: 80, cornerRadius: 18 };
	const terminal = { color: 'success', state: 'complete' } as const;
	const NODE_WIDTH = 360;
	const DIAGRAM_MARGIN = 40;

	function getDiagramColumns(config: DiagramConfig): number {
		const inDeg = new Map<string, number>();
		const outDeg = new Map<string, number>();
		for (const edge of config.edges ?? []) {
			outDeg.set(edge.from, (outDeg.get(edge.from) ?? 0) + 1);
			inDeg.set(edge.to, (inDeg.get(edge.to) ?? 0) + 1);
		}
		let max = 1;
		for (const v of outDeg.values()) if (v > max) max = v;
		for (const v of inDeg.values()) if (v > max) max = v;
		return max;
	}

	function getDiagramWidth(config: DiagramConfig): number {
		const cols = getDiagramColumns(config);
		return cols * NODE_WIDTH + (cols - 1) * sharedSpacing.nodeGap + DIAGRAM_MARGIN * 2;
	}

	function diagramWidth(config: DiagramConfig): Attachment<HTMLDivElement> {
		const width = `${getDiagramWidth(config)}px`;
		return (node) => {
			node.style.setProperty('--diagram-width', width);
			return () => node.style.removeProperty('--diagram-width');
		};
	}

	const primitivesDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How @dryui/primitives wires native browser APIs into Svelte 5 components',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'browser',
				label: 'Native browser APIs',
				description: 'Popover, focus, keyboard events, Intl, date math, and color parsing.',
				iconComponent: Globe,
				width: 360,
				height: 136
			},
			{
				id: 'util',
				label: 'Primitive utility',
				description:
					'createFocusTrap, createPositionedPopover, createDismiss, color and date helpers.',
				iconComponent: Atom,
				color: 'brand',
				width: 360,
				height: 144
			},
			{
				id: 'runes',
				label: 'Svelte 5 runes wire state',
				description: '$state, $derived, and context connect primitive state to DOM refs.',
				iconComponent: Sparkles,
				width: 360,
				height: 136
			},
			{
				id: 'headless',
				label: 'Headless behaviour',
				description: 'Unstyled interaction skeleton ready for any styling layer.',
				iconComponent: Layers,
				width: 360,
				height: 128
			},
			{
				id: 'consumer',
				label: 'Consumer imports primitive',
				description: 'UI compounds and user code layer styles and markup on top.',
				iconComponent: Package,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'browser', to: 'util' },
			{ from: 'util', to: 'runes' },
			{ from: 'runes', to: 'headless' },
			{ from: 'headless', to: 'consumer' }
		]
	};

	const uiDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How @dryui/ui composes primitives and tokens into styled compound components',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'tokens',
				label: 'Theme tokens',
				description: '--dry-color-*, --dry-space-*, --dry-font-* from the active theme CSS.',
				iconComponent: Palette,
				color: 'info',
				width: 360,
				height: 136
			},
			{
				id: 'primitives',
				label: '@dryui/primitives',
				description: 'Focus traps, popovers, dismiss handlers, and context utilities.',
				iconComponent: Atom,
				color: 'brand',
				width: 360,
				height: 136
			},
			{
				id: 'compound',
				label: 'Compound component',
				description: 'Select.Root wires context, value, and keyboard state across subcomponents.',
				iconComponent: Boxes,
				color: 'brand',
				width: 360,
				height: 144
			},
			{
				id: 'scoped',
				label: 'Scoped Svelte styles',
				description: 'Each subcomponent reads var(--dry-*) tokens through scoped CSS only.',
				iconComponent: Scissors,
				width: 360,
				height: 128
			},
			{
				id: 'consumer',
				label: 'App imports Root, Trigger, Content',
				description: 'Dialog, Select, Tabs, Sidebar, and friends plug into the consumer app.',
				iconComponent: AppWindow,
				...terminal,
				width: 360,
				height: 136
			}
		],
		edges: [
			{ from: 'tokens', to: 'compound' },
			{ from: 'primitives', to: 'compound' },
			{ from: 'compound', to: 'scoped' },
			{ from: 'scoped', to: 'consumer' }
		]
	};

	const themeWizardDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the theme wizard derives, previews, and exports a DryUI theme',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'input',
				label: 'User input',
				description: 'Brand HSB picker, personality, typography, shape, and density controls.',
				iconComponent: Paintbrush,
				color: 'info',
				width: 360,
				height: 136
			},
			{
				id: 'state',
				label: 'Wizard state',
				description: 'wizardState runes persist brandHsb, typeScale, and shape presets.',
				iconComponent: Settings2,
				width: 360,
				height: 128
			},
			{
				id: 'derive',
				label: 'generateTheme to ThemeTokens',
				description: 'Engine derives the full --dry-* light and dark token map.',
				iconComponent: WandSparkles,
				color: 'brand',
				width: 360,
				height: 136
			},
			{
				id: 'inject',
				label: 'getStyleString emits :root',
				description: 'CSS var block injected into the preview document live.',
				iconComponent: Code,
				width: 360,
				height: 128
			},
			{
				id: 'preview',
				label: 'Live preview updates',
				description: 'Every component on the page re-skins as CSS variables change.',
				iconComponent: Eye,
				width: 360,
				height: 128
			},
			{
				id: 'export',
				label: 'Export theme.css',
				description: 'Share a URL recipe or download a theme.css with brand overrides.',
				iconComponent: Download,
				...terminal,
				width: 360,
				height: 136
			}
		],
		edges: [
			{ from: 'input', to: 'state' },
			{ from: 'state', to: 'derive' },
			{ from: 'derive', to: 'inject' },
			{ from: 'inject', to: 'preview' },
			{ from: 'preview', to: 'export' }
		]
	};

	const lintDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How @dryui/lint validates Svelte files at preprocess time',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'file',
				label: '.svelte source file',
				description: 'Authored component in an app using svelte.config.js preprocess.',
				iconComponent: FileCode,
				width: 360,
				height: 128
			},
			{
				id: 'preprocess',
				label: 'dryuiLint preprocessor',
				description: 'Runs inside SvelteKit preprocess before AST compilation.',
				iconComponent: Workflow,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'checks',
				label: 'Rule checkers',
				description: 'checkScript, checkMarkup, checkStyle against the RULE_CATALOG.',
				iconComponent: ShieldCheck,
				color: 'warning',
				width: 360,
				height: 136
			},
			{
				id: 'violations',
				label: 'Collect violations',
				description: 'Each issue carries rule id, line, and a human-readable message.',
				iconComponent: TriangleAlert,
				color: 'warning',
				width: 360,
				height: 128
			},
			{
				id: 'report',
				label: 'Report outcome',
				description: 'strict mode throws and blocks the build; dev mode warns inline.',
				iconComponent: CircleCheck,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'file', to: 'preprocess' },
			{ from: 'preprocess', to: 'checks' },
			{ from: 'checks', to: 'violations' },
			{ from: 'violations', to: 'report' }
		]
	};

	const feedbackDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the @dryui/feedback widget captures and submits an annotation',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'shortcut',
				label: 'User hits shortcut',
				description: '$mod+m opens the annotation canvas over the running app.',
				iconComponent: Keyboard,
				width: 360,
				height: 128
			},
			{
				id: 'draw',
				label: 'Draw strokes, arrows, text',
				description: 'Pointer events feed transient geometry into drawings[].',
				iconComponent: PenLine,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'autosave',
				label: 'Autosave PUT /drawings',
				description: 'Debounced sync so the session resumes across reloads.',
				iconComponent: RefreshCw,
				width: 360,
				height: 128
			},
			{
				id: 'capture',
				label: 'Capture screenshot',
				description: 'getDisplayMedia renders both WebP and PNG with element hints.',
				iconComponent: Camera,
				width: 360,
				height: 136
			},
			{
				id: 'submit',
				label: 'POST /submissions',
				description: 'Image, drawings, hints, and viewport are sent to the feedback server.',
				iconComponent: Upload,
				color: 'brand',
				width: 360,
				height: 136
			},
			{
				id: 'dashboard',
				label: 'Dashboard opens',
				description: 'Agent picks the submission up via MCP and replies in-thread.',
				iconComponent: LayoutDashboard,
				...terminal,
				width: 360,
				height: 136
			}
		],
		edges: [
			{ from: 'shortcut', to: 'draw' },
			{ from: 'draw', to: 'autosave' },
			{ from: 'draw', to: 'capture' },
			{ from: 'capture', to: 'submit' },
			{ from: 'submit', to: 'dashboard' }
		]
	};

	const feedbackServerDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the feedback server bridges the browser widget and the agent via MCP',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'post',
				label: 'POST /submissions',
				description: 'Widget uploads image, drawings, hints, and viewport metadata.',
				iconComponent: Upload,
				width: 360,
				height: 128
			},
			{
				id: 'store',
				label: 'FeedbackStore persists',
				description: 'SQLite rows plus WebP and PNG files written to screenshotsDir.',
				iconComponent: Database,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'bus',
				label: 'EventBus broadcast',
				description: 'submission.created fires on the /events SSE stream.',
				iconComponent: Radio,
				width: 360,
				height: 128
			},
			{
				id: 'mcp',
				label: 'MCP tool fetch',
				description: 'feedback_get_submissions polls pending items with full metadata.',
				iconComponent: Plug,
				color: 'info',
				width: 360,
				height: 128
			},
			{
				id: 'agent',
				label: 'Agent reads and replies',
				description: 'Analysis posted back via feedback_reply to /annotations/:id/thread.',
				iconComponent: Brain,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'ui',
				label: 'UI sees reply via SSE',
				description: 'thread.message events re-render the annotation with the response.',
				iconComponent: MessageSquare,
				...terminal,
				width: 360,
				height: 136
			}
		],
		edges: [
			{ from: 'post', to: 'store' },
			{ from: 'store', to: 'bus' },
			{ from: 'bus', to: 'mcp' },
			{ from: 'mcp', to: 'agent' },
			{ from: 'agent', to: 'ui' }
		]
	};

	const mcpDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the @dryui/mcp server answers ask and check requests from agents',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'agent',
				label: 'Agent calls tool',
				description: 'ask(scope, query) for guidance or check(path) for validation.',
				iconComponent: Brain,
				color: 'info',
				width: 360,
				height: 128
			},
			{
				id: 'server',
				label: 'McpServer handler',
				description: 'Tool name routes the request into runAsk or runCheck.',
				iconComponent: Plug,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'ask',
				label: 'ask scope routing',
				description: 'component, recipe, list, and setup each pick a dedicated resolver.',
				iconComponent: CircleQuestionMark,
				width: 360,
				height: 128
			},
			{
				id: 'check',
				label: 'check path dispatch',
				description: '.svelte → checkComponent, .css → diagnoseTheme, dir → scanWorkspace.',
				iconComponent: ShieldCheck,
				color: 'warning',
				width: 360,
				height: 128
			},
			{
				id: 'data',
				label: 'spec.json, catalog, rules',
				description: 'Static component catalog, anti-patterns, and workspace data.',
				iconComponent: Database,
				width: 360,
				height: 128
			},
			{
				id: 'toon',
				label: 'TOON response',
				description: 'Token-optimised text flows back through MCP to the agent.',
				iconComponent: FileText,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'agent', to: 'server' },
			{ from: 'server', to: 'ask' },
			{ from: 'server', to: 'check' },
			{ from: 'ask', to: 'data' },
			{ from: 'check', to: 'data' },
			{ from: 'data', to: 'toon' }
		]
	};

	const cliDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the @dryui/cli turns a command into an installable plan',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'user',
				label: 'bunx @dryui/cli ...',
				description: 'init, add, setup, install-hook, list, tokens, feedback, and more.',
				iconComponent: Terminal,
				color: 'info',
				width: 360,
				height: 128
			},
			{
				id: 'entry',
				label: 'main() parses argv',
				description: 'Splits command, flags, and positionals for the dispatcher.',
				iconComponent: Split,
				width: 360,
				height: 128
			},
			{
				id: 'dispatch',
				label: 'Command dispatcher',
				description: 'runAdd, runInit, runSetup, and friends each own one command.',
				iconComponent: Route,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'detect',
				label: 'Detect project and spec',
				description: 'parseProjectInput locates cwd, package.json, and spec.json.',
				iconComponent: Search,
				width: 360,
				height: 128
			},
			{
				id: 'plan',
				label: 'planAdd to install steps',
				description: 'Resolves component, dependencies, imports, and file writes.',
				iconComponent: ListChecks,
				width: 360,
				height: 128
			},
			{
				id: 'output',
				label: 'TOON-rendered plan',
				description: 'renderCommandResultByMode prints the plan and exits cleanly.',
				iconComponent: FileText,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'user', to: 'entry' },
			{ from: 'entry', to: 'dispatch' },
			{ from: 'dispatch', to: 'detect' },
			{ from: 'detect', to: 'plan' },
			{ from: 'plan', to: 'output' }
		]
	};

	const pluginDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the DryUI plugin loads skills, MCP servers, and hooks into an AI tool',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'install',
				label: 'User installs plugin',
				description: 'Claude Code, Codex, Copilot CLI, or Gemini CLI picks up the bundle.',
				iconComponent: Download,
				color: 'info',
				width: 360,
				height: 128
			},
			{
				id: 'manifest',
				label: 'Tool reads plugin.json',
				description: 'skills, .mcp.json, and hooks.json are registered with the agent host.',
				iconComponent: Puzzle,
				width: 360,
				height: 128
			},
			{
				id: 'hook',
				label: 'SessionStart hook',
				description: 'dryui ambient seeds the conversation with project context.',
				iconComponent: Zap,
				width: 360,
				height: 128
			},
			{
				id: 'mcp',
				label: 'Spawn MCP servers',
				description: '@dryui/mcp and @dryui/feedback-server start on stdio.',
				iconComponent: Plug,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'skills',
				label: 'Skills and rules ready',
				description: 'dryui, init, and live-feedback skills load for slash commands.',
				iconComponent: BookOpen,
				width: 360,
				height: 128
			},
			{
				id: 'agent',
				label: 'Agent gains DryUI tools',
				description: 'ask, check, and feedback_* tools are ready for the session.',
				iconComponent: Brain,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'install', to: 'manifest' },
			{ from: 'manifest', to: 'hook' },
			{ from: 'manifest', to: 'mcp' },
			{ from: 'manifest', to: 'skills' },
			{ from: 'hook', to: 'agent' },
			{ from: 'mcp', to: 'agent' },
			{ from: 'skills', to: 'agent' }
		]
	};

	const docsDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How the DryUI docs site renders a component page from the catalog',
		spacing: sharedSpacing,
		nodes: [
			{
				id: 'url',
				label: '/components/button',
				description: 'User loads a component route from the docs site.',
				iconComponent: Globe,
				color: 'info',
				width: 360,
				height: 128
			},
			{
				id: 'route',
				label: 'SvelteKit [slug] route',
				description: '+page.ts resolves the slug and hydrates page data.',
				iconComponent: Route,
				width: 360,
				height: 128
			},
			{
				id: 'catalog',
				label: 'Component catalog lookup',
				description: 'nav.ts reads docsNavCategories from @dryui/mcp.',
				iconComponent: Library,
				color: 'brand',
				width: 360,
				height: 128
			},
			{
				id: 'demo',
				label: 'getComponentDemo()',
				description: 'Returns the live Svelte 5 demo for the current component.',
				iconComponent: Play,
				width: 360,
				height: 128
			},
			{
				id: 'render',
				label: 'Page renders',
				description: 'DocsPageHeader, live demo, props, CSS vars, and examples.',
				iconComponent: AppWindow,
				width: 360,
				height: 128
			},
			{
				id: 'feedback',
				label: 'Feedback widget watches',
				description: 'In dev, annotations go to the local feedback server loop.',
				iconComponent: PenLine,
				...terminal,
				width: 360,
				height: 128
			}
		],
		edges: [
			{ from: 'url', to: 'route' },
			{ from: 'route', to: 'catalog' },
			{ from: 'catalog', to: 'demo' },
			{ from: 'demo', to: 'render' },
			{ from: 'render', to: 'feedback' }
		]
	};

	const modules: { id: string; title: string; description: string; diagram: DiagramConfig }[] = [
		{
			id: 'primitives',
			title: '@dryui/primitives',
			description:
				'Zero-dependency headless Svelte 5 primitives built on native browser APIs. Focus traps, popovers, dismiss handlers, color, and date utilities feed the rest of the stack.',
			diagram: primitivesDiagram
		},
		{
			id: 'ui',
			title: '@dryui/ui',
			description:
				'Styled compound components that layer primitives and theme tokens into Root, Trigger, and Content pairs the app can drop in.',
			diagram: uiDiagram
		},
		{
			id: 'theme-wizard',
			title: '@dryui/theme-wizard',
			description:
				'An interactive theme studio. User input derives the full --dry-* token map, injects it live, and exports a theme.css for the project.',
			diagram: themeWizardDiagram
		},
		{
			id: 'lint',
			title: '@dryui/lint',
			description:
				'A Svelte preprocessor that enforces DryUI layout, markup, and CSS rules. Strict mode blocks the build on any violation.',
			diagram: lintDiagram
		},
		{
			id: 'feedback',
			title: '@dryui/feedback',
			description:
				'The in-app annotation widget. A keyboard shortcut opens a canvas over the running app, captures a screenshot and drawings, and posts the submission.',
			diagram: feedbackDiagram
		},
		{
			id: 'feedback-server',
			title: '@dryui/feedback-server',
			description:
				'The bridge between the widget and the agent. HTTP receives submissions, an MCP server exposes them to Claude, and SSE delivers replies back to the dashboard.',
			diagram: feedbackServerDiagram
		},
		{
			id: 'mcp',
			title: '@dryui/mcp',
			description:
				'The MCP surface for agents. ask returns component, recipe, list, and setup guidance; check validates a file, theme, or workspace against DryUI rules.',
			diagram: mcpDiagram
		},
		{
			id: 'cli',
			title: '@dryui/cli',
			description:
				'The command-line entry to DryUI. Parses a command, detects the project, plans the install, and prints a TOON-rendered plan.',
			diagram: cliDiagram
		},
		{
			id: 'plugin',
			title: '@dryui/plugin',
			description:
				'The AI tooling bundle for Claude Code, Codex, Copilot CLI, and Gemini. Ships skills, hooks, and the dryui plus dryui-feedback MCP servers ready to load.',
			diagram: pluginDiagram
		},
		{
			id: 'docs',
			title: 'apps/docs',
			description:
				'The SvelteKit docs site. The component catalog powers slug routes that render live demos, props tables, CSS var references, and examples.',
			diagram: docsDiagram
		}
	];
</script>

<svelte:head>
	<title>How We Work | DryUI</title>
	<meta
		name="description"
		content="One diagram per DryUI package and app. See the real flow of every module in the agent-driven UI loop."
	/>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="How We Work"
			description="One diagram per DryUI package and app. Each flow is grounded in the real source so you can see exactly how every module plugs into the agent-driven UI loop."
		/>

		{#each modules as mod (mod.id)}
			<section class="module-section">
				<DocsSectionIntro id={mod.id} title={mod.title} description={mod.description} />
				<Card.Root>
					<Card.Content>
						<div class="diagram-shell" {@attach diagramWidth(mod.diagram)}>
							<Diagram config={mod.diagram} />
						</div>
					</Card.Content>
				</Card.Root>
			</section>
		{/each}
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-12);
	}

	.module-section {
		display: grid;
		gap: var(--dry-space-4);
	}

	.diagram-shell {
		display: grid;
		grid-template-columns: var(--diagram-width);
		justify-content: safe center;
		overflow-x: auto;
	}
</style>
