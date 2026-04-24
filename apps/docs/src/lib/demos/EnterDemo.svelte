<script lang="ts">
	import { Badge, Button, Enter, Text } from '@dryui/ui';

	let nonce = $state(0);
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Entrance transition</p>
		<Text color="secondary" size="sm">
			Enter handles the mount moment for banners, empty states, and route-level content. Replay to
			see the blur-lift curve.
		</Text>
	</div>

	<div class="slot">
		{#key nonce}
			<Enter>
				<article class="banner">
					<Badge variant="soft" color="success">Released</Badge>
					<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
					<h3 class="title">DryUI 1.4 shipped</h3>
					<Text color="secondary" size="sm">
						Container queries land across layouts, Field.Root gets async validators, and the CLI
						picks up a lint command.
					</Text>
					<div class="actions">
						<Button variant="solid" size="sm">Read release notes</Button>
						<Button variant="ghost" size="sm">Skip</Button>
					</div>
				</article>
			</Enter>
		{/key}
	</div>

	<Button variant="outline" size="sm" onclick={() => (nonce += 1)}>Replay entrance</Button>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: start;
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.slot {
		display: grid;
		min-block-size: 11rem;
		align-content: start;
	}

	.banner {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-5);
		border: 1px solid
			color-mix(in srgb, var(--dry-color-fill-brand) 30%, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 10%, var(--dry-color-bg-overlay));
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-xl-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
