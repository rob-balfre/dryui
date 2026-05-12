<script lang="ts">
	import { Button, CodeBlock } from '@dryui/ui';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { DRYUI_SKILLS_INSTALL_COMMAND } from '$lib/ai-setup';
	import { SITE_DESCRIPTION } from '$lib/site-meta';
	import { withBase } from '$lib/utils';

	const feedbackPromise = browser ? import('@dryui/feedback').then((mod) => mod.Feedback) : null;

	function handleDemoSubmit() {
		return goto(withBase('/feedback-loop'));
	}
</script>

<svelte:head>
	<title>DryUI - Human-led, agent-assisted UI</title>
	<meta name="description" content={SITE_DESCRIPTION} />
</svelte:head>

<div class="home-page" data-layout="home">
	<section class="home-hero" data-layout-area="hero" aria-labelledby="home-title">
		<div class="home-copy" data-layout-area="hero-copy">
			<p class="home-kicker">Human-led, agent-assisted</p>
			<h1 id="home-title">Better web apps with agents in the loop.</h1>
			<p class="home-lede">
				A component library for agentic developers. Skills your agent can load. Lint rules it can't
				sneak past. Theme tokens that hold the line.
			</p>

			<div class="home-actions" data-layout-area="actions">
				<div class="home-install-line" data-layout-area="install" aria-label="Install DryUI">
					<span class="home-install-label">Get started</span>
					<CodeBlock code={DRYUI_SKILLS_INSTALL_COMMAND} language="text" />
				</div>
				<span class="home-action-button home-action-button--primary">
					<Button variant="solid" color="ink" size="md" href={withBase('/getting-started')}>
						Read the docs
					</Button>
				</span>
			</div>
		</div>
	</section>
</div>

{#snippet feedbackHint()}
	<div class="home-feedback-hint" data-layout="home-hint">
		<p class="home-feedback-hint-text" data-layout-area="message">
			oh, and we have live feedback as well
		</p>
		<svg
			class="home-feedback-hint-arrow"
			data-layout-area="arrow"
			viewBox="0 0 60 66"
			role="presentation"
		>
			<path
				d="M 6 8 Q 50 20 48 58"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M 42 47 L 48 58 L 54 47"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
{/snippet}

{#if feedbackPromise}
	{#await feedbackPromise then Feedback}
		<Feedback onSubmit={handleDemoSubmit} hint={feedbackHint} />
	{/await}
{/if}

<style>
	.home-page {
		--home-border: color-mix(in srgb, var(--dry-color-text-strong) 15%, transparent);
		--home-border-strong: color-mix(in srgb, var(--dry-color-text-strong) 24%, transparent);
		--home-surface: color-mix(in srgb, var(--dry-color-text-strong) 4.5%, transparent);
		--home-surface-strong: color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent);

		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-base);
	}

	h1,
	p {
		margin: 0;
	}

	h1 {
		max-inline-size: 12.5ch;
		font-size: clamp(3rem, 6.25vw, 5.5rem);
		font-weight: 850;
		letter-spacing: 0;
		line-height: 0.94;
		text-wrap: balance;
	}

	.home-kicker {
		color: var(--dry-color-text-weak);
		font-family: var(--dry-font-mono);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		line-height: 1.25;
		text-transform: uppercase;
	}

	.home-lede {
		max-inline-size: 58ch;
		color: var(--dry-color-text-weak);
		font-size: clamp(1.05rem, 1.45vw, 1.35rem);
		line-height: 1.56;
	}

	.home-action-button {
		--dry-btn-accent: var(--dry-color-text-strong);
		--dry-btn-accent-fg: var(--dry-color-text-strong);
		--dry-btn-accent-stroke: var(--home-border-strong);
		--dry-btn-on-accent: var(--dry-color-bg-base);
	}

	.home-install-line {
		color: var(--dry-color-text-weak);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.home-install-label {
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.home-feedback-hint {
		inline-size: 13rem;
		color: var(--home-hint-ink, oklch(78% 0.13 54));
		font-family: 'Caveat', cursive;
		text-align: start;
		transform: translateX(-48px) rotate(-3deg);
		transform-origin: 100% 100%;
	}

	.home-feedback-hint-text {
		font-size: 1.65rem;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: 0.01em;
	}

	.home-feedback-hint-arrow {
		display: block;
		margin-block-start: var(--dry-space-2);
		margin-inline-start: auto;
		inline-size: 80px;
		block-size: auto;
	}

	@media (max-width: 720px) {
		.home-feedback-hint {
			inline-size: 11rem;
			transform: translateX(-20px) rotate(-2deg);
		}

		.home-feedback-hint-text {
			font-size: 1.4rem;
		}

		.home-feedback-hint-arrow {
			inline-size: 64px;
		}
	}

	@media (max-width: 480px) {
		.home-feedback-hint {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
			gap: 0.4rem;
			inline-size: auto;
			max-inline-size: 12rem;
			transform: translate(-6px, 4px) rotate(-2deg);
		}

		.home-feedback-hint-text {
			font-size: 0.95rem;
			line-height: 1.05;
		}

		.home-feedback-hint-arrow {
			margin: 0;
			inline-size: 32px;
		}
	}
</style>
