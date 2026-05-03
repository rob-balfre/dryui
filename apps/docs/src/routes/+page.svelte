<script lang="ts">
	import { Button, CodeBlock } from '@dryui/ui';
	import { DRYUI_SKILLS_INSTALL_COMMAND } from '$lib/ai-setup';
	import { SITE_DESCRIPTION } from '$lib/site-meta';
	import { withBase } from '$lib/utils';
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
				DryUI gives engineers reusable components, themes, and route patterns so teams can move
				faster while keeping interfaces clear, accessible, and consistent.
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
</style>
