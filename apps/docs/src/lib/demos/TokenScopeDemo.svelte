<script lang="ts">
	import { Badge, Button, TokenScope } from '@dryui/ui';

	const dangerScope = {
		'--dry-color-fill-brand': 'oklch(58% 0.21 28)',
		'--dry-color-fill-brand-hover': 'oklch(52% 0.21 28)',
		'--dry-color-text-brand': 'oklch(58% 0.21 28)',
		'--dry-color-stroke-brand': 'oklch(58% 0.21 28 / 0.5)'
	};

	const successScope = {
		'--dry-color-fill-brand': 'oklch(60% 0.16 152)',
		'--dry-color-fill-brand-hover': 'oklch(54% 0.16 152)',
		'--dry-color-text-brand': 'oklch(60% 0.16 152)',
		'--dry-color-stroke-brand': 'oklch(60% 0.16 152 / 0.5)'
	};
</script>

<div class="stack">
	<div class="zone">
		<p class="eyebrow">Default brand</p>
		<div class="row">
			<Button variant="primary">Deploy</Button>
			<Badge variant="solid">Live</Badge>
		</div>
	</div>

	<TokenScope tokens={dangerScope}>
		<div class="zone">
			<p class="eyebrow">Danger scope</p>
			<div class="row">
				<Button variant="primary">Delete</Button>
				<Badge variant="solid">Critical</Badge>
			</div>
		</div>
	</TokenScope>

	<TokenScope tokens={successScope}>
		<div class="zone">
			<p class="eyebrow">Success scope</p>
			<div class="row">
				<Button variant="primary">Approve</Button>
				<Badge variant="solid">Verified</Badge>
			</div>
		</div>
	</TokenScope>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.zone {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px dashed color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 24%, transparent);
	}

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
		align-items: center;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
</style>
