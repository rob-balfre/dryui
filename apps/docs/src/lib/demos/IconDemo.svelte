<script lang="ts">
	import { Badge, Button, Icon, Text } from '@dryui/ui';
	import { CheckCircle2, CircleAlert, GitBranch, Play, Rocket } from 'lucide-svelte';
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Icon sizes and colors</p>
		<Text color="secondary" size="sm">
			Icon wraps any SVG with consistent sizing, accessible labels, and a single color prop that
			inherits from surrounding text.
		</Text>
	</div>

	<section class="group">
		<p class="group-label">In buttons</p>
		<div class="row">
			<Button variant="solid">
				<Icon label="Deploy" size="sm">
					<Rocket aria-hidden="true" />
				</Icon>
				Ship release
			</Button>
			<Button variant="outline">
				<Icon label="Play preview" size="sm">
					<Play aria-hidden="true" />
				</Icon>
				Play preview
			</Button>
		</div>
	</section>

	<section class="group">
		<p class="group-label">In nav</p>
		<nav class="nav" aria-label="Project nav">
			<a href="#main" class="nav-item is-active">
				<Icon label="" size="sm" color="primary">
					<GitBranch aria-hidden="true" />
				</Icon>
				main
			</a>
			<a href="#release-1-4" class="nav-item">
				<Icon label="" size="sm" color="muted">
					<GitBranch aria-hidden="true" />
				</Icon>
				release/1.4
			</a>
			<a href="#feat-checkout" class="nav-item">
				<Icon label="" size="sm" color="muted">
					<GitBranch aria-hidden="true" />
				</Icon>
				feat/checkout
			</a>
		</nav>
	</section>

	<section class="group">
		<p class="group-label">In status badges</p>
		<div class="row">
			<Badge variant="soft" color="success">
				<Icon label="" size="xs">
					<CheckCircle2 aria-hidden="true" />
				</Icon>
				Deploy succeeded
			</Badge>
			<Badge variant="soft" color="warning">
				<Icon label="" size="xs">
					<CircleAlert aria-hidden="true" />
				</Icon>
				Checks pending
			</Badge>
		</div>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-5);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow,
	.group-label {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.group {
		display: grid;
		gap: var(--dry-space-2);
	}

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1);
		padding: var(--dry-space-1);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 64%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 48%, transparent);
		justify-self: start;
	}

	.nav-item {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		text-decoration: none;
	}

	.nav-item.is-active {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 18%, var(--dry-color-bg-overlay));
		color: var(--dry-color-text-strong);
	}
</style>
