<script lang="ts">
	import { ButtonGroup, Button } from '@dryui/ui';
</script>

<div class="scenarios">
	<section class="row">
		<div class="context">
			<p class="eyebrow">Editor toolbar</p>
			<p class="title">Alignment</p>
			<p class="note">Format the selected block across a connected cluster.</p>
		</div>
		<ButtonGroup>
			<Button variant="outline">Left</Button>
			<Button variant="outline">Center</Button>
			<Button variant="outline">Right</Button>
			<Button variant="outline">Justify</Button>
		</ButtonGroup>
	</section>

	<section class="row">
		<div class="context">
			<p class="eyebrow">Deploy log</p>
			<p class="title">Environment filter</p>
			<p class="note">Scope the activity feed. Production is live.</p>
		</div>
		<ButtonGroup size="sm">
			<Button variant="outline">All</Button>
			<Button variant="solid">Production</Button>
			<Button variant="outline">Preview</Button>
			<Button variant="outline">Local</Button>
		</ButtonGroup>
	</section>
</div>

<style>
	.scenarios {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-3);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-5);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}
	.context {
		display: grid;
		gap: var(--dry-space-1);
	}
	.eyebrow,
	.title,
	.note {
		margin: 0;
	}
	.eyebrow {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
	.title {
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
	@container (max-width: 38rem) {
		.row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
