<script lang="ts">
	import { Badge, FlipCard } from '@dryui/ui';
</script>

<div class="card">
	<FlipCard.Root trigger="hover">
		<FlipCard.Front>
			<div class="face face-front">
				<div class="head">
					<Badge variant="soft" size="sm">Feature</Badge>
					<p class="eyebrow">Hover to flip</p>
				</div>
				<div class="copy">
					<p class="title">Live feedback annotations</p>
					<p class="body">
						Draw on your running app. Each marker lands back in the agent as a submission with
						screenshot, selector, and URL.
					</p>
				</div>
				<div class="meta">
					<span class="meta-item">3 modes</span>
					<span class="meta-item">Zero config</span>
					<span class="meta-item">Works headless</span>
				</div>
			</div>
		</FlipCard.Front>

		<FlipCard.Back>
			<div class="face face-back">
				<div class="head">
					<Badge variant="solid" color="blue" size="sm">How it works</Badge>
					<p class="eyebrow">Backside</p>
				</div>
				<ol class="steps">
					<li>
						<span class="step-n">1</span>
						<span class="step-body">Reload your dev server after <code>dryui init</code>.</span>
					</li>
					<li>
						<span class="step-n">2</span>
						<span class="step-body">
							Press <code>Cmd+I</code> to mark a region or record a quick clip.
						</span>
					</li>
					<li>
						<span class="step-n">3</span>
						<span class="step-body">
							The agent picks it up through <code>feedback_get_pending</code>.
						</span>
					</li>
				</ol>
			</div>
		</FlipCard.Back>
	</FlipCard.Root>
</div>

<style>
	.card {
		display: grid;
		grid-template-columns: minmax(0, 28rem);
	}

	.face {
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		min-block-size: 18rem;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 42%, transparent);
	}

	.face-back {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-fill-brand) 14%, var(--dry-color-bg-overlay)),
			color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent)
		);
	}

	.head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.copy {
		display: grid;
		gap: var(--dry-space-2);
		align-self: center;
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--dry-color-text-strong);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	.meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
	}

	.meta-item {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.steps {
		display: grid;
		gap: var(--dry-space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		align-self: center;
	}

	.steps li {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: start;
	}

	.step-n {
		display: grid;
		place-items: center;
		block-size: 1.6em;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 22%, var(--dry-color-bg-overlay));
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		font-weight: 600;
	}

	.step-body {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		line-height: 1.5;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: 0.9em;
		color: var(--dry-color-text-strong);
	}
</style>
