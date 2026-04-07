<script lang="ts">
	import { Button, CodeBlock, Container, Heading, Text } from '@dryui/ui';
	import { LayoutGrid, Cpu, Bot, Paintbrush, ChevronRight, Rocket } from 'lucide-svelte';
	import { homeIntroPrompt } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';
	import { GITHUB_URL } from '$lib/site-meta';

	const promptCode = homeIntroPrompt;
</script>

<svelte:head>
	<title>DRY ui - Don't Repeat Yourself.</title>
</svelte:head>

<div class="page">
	<Container>
		<div class="page-stack">
			<div class="page-sections">
				<section class="hero">
					<div class="hero-copy">
						<div class="hero-copy-stack">
							<Text size="xs" color="secondary" weight="medium">DRY ui - Don't Repeat Yourself</Text
							>
							<Heading level={1}>SvelteKit meets your favorite AI coding tool</Heading>
							<Text color="secondary">
								An experiment in closing the gap between AI-generated and hand-crafted Svelte UIs.
								100% free and open-source.
							</Text>
						</div>

						<div class="flow" aria-label="How it works">
							<div class="flow-node">
								<LayoutGrid size={20} aria-hidden="true" />
								<span class="flow-label">Components</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Cpu size={20} aria-hidden="true" />
								<span class="flow-label">CLI &amp; MCP Server</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Bot size={20} aria-hidden="true" />
								<span class="flow-label">AI Agent</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Paintbrush size={20} aria-hidden="true" />
								<span class="flow-label">Your UI</span>
							</div>
						</div>
					</div>
				</section>

				<section class="footer-section">
					<Heading level={2}>One step to get started</Heading>
					<Text color="secondary">Paste this into your agent of choice.</Text>
					<CodeBlock code={promptCode} language="text" />

					<nav aria-label="Homepage links" class="footer-links">
						<div class="action-grid">
							<Button variant="solid" size="md" href={withBase('/getting-started')}>
								<Rocket size={16} aria-hidden="true" /> Get Started
							</Button>
							<Button
								variant="outline"
								size="md"
								href={GITHUB_URL}
								target="_blank"
								rel="noreferrer"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									><path
										d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
									/></svg
								> GitHub
							</Button>
						</div>
					</nav>
				</section>
			</div>
		</div>
	</Container>
</div>

<style>
	.page {
		--home-panel-bg: color-mix(in srgb, var(--dry-color-bg-raised) 84%, transparent);
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		align-content: start;
		padding-block: clamp(var(--dry-space-6), 4vw, var(--dry-space-10)) var(--dry-space-10);
	}

	.page-stack {
		container-type: inline-size;
		display: grid;
	}

	.page-sections {
		display: grid;
		grid-template-rows: auto auto;
		gap: var(--dry-space-8);
	}

	.hero-copy-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.action-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	@container (max-width: 40rem) {
		.action-grid {
			grid-auto-flow: row;
			grid-auto-columns: 1fr;
		}
	}

	.hero {
		box-sizing: border-box;
		padding: clamp(var(--dry-space-6), 4vw, var(--dry-space-10));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent),
				transparent 34%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--home-panel-bg) 100%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 88%, transparent)
			);
	}

	.hero-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.flow {
		display: grid;
		grid-template-columns: repeat(4, auto) repeat(3, auto);
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
		padding-block-start: var(--dry-space-5);
	}

	.flow-node {
		display: grid;
		grid-template-columns: auto auto;
		align-items: center;
		gap: var(--dry-space-2);
		color: var(--dry-color-text-strong);
	}

	.flow-node svg {
		color: var(--dry-color-text-weak);
	}

	.flow-label {
		font-size: var(--dry-text-sm);
		font-weight: 500;
		white-space: nowrap;
	}

	.flow-arrow {
		color: var(--dry-color-text-weak);
		opacity: 0.5;
	}

	@container (max-width: 40rem) {
		.flow {
			grid-template-columns: auto auto 1fr;
			justify-content: start;
		}

		.flow-arrow {
			rotate: 90deg;
			grid-column: 1 / -1;
			justify-self: start;
			margin-inline-start: var(--dry-space-2);
		}
	}

	.footer-section {
		display: grid;
		gap: var(--dry-space-4);
		align-content: start;
		position: relative;
		padding: clamp(var(--dry-space-5), 3vw, var(--dry-space-8));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--home-panel-bg) 100%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 92%, transparent)
			),
			radial-gradient(
				circle at top right,
				color-mix(in srgb, var(--dry-color-fill-brand) 18%, transparent),
				transparent 36%
			);
	}

	.footer-links {
		display: grid;
		grid-template-columns: minmax(0, 42rem);
	}

	@container (max-width: 40rem) {
		.hero,
		.footer-section {
			padding: var(--dry-space-5);
		}

		.hero {
			border-radius: var(--dry-radius-xl);
		}
	}
</style>
