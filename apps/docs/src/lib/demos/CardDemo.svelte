<script lang="ts">
	import { Badge, Button, Card } from '@dryui/ui';
</script>

<div class="cards">
	<Card.Root>
		<Card.Header>
			<div class="header-row">
				<p class="eyebrow">Build #4812</p>
				<Badge variant="soft" color="green">Passed</Badge>
			</div>
			<p class="title">Deploy to production</p>
		</Card.Header>
		<Card.Content>
			<dl class="meta">
				<div>
					<dt>Branch</dt>
					<dd>main</dd>
				</div>
				<div>
					<dt>Commit</dt>
					<dd>a3f2c91</dd>
				</div>
				<div>
					<dt>Duration</dt>
					<dd>4m 12s</dd>
				</div>
			</dl>
		</Card.Content>
		<Card.Footer>
			<Button variant="ghost" size="sm">View logs</Button>
			<Button variant="solid" size="sm">Promote</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<div class="header-row">
				<p class="eyebrow">Invoice INV-0241</p>
				<Badge variant="soft" color="yellow">Due Apr 28</Badge>
			</div>
			<p class="title">Orbit Labs, Inc.</p>
		</Card.Header>
		<Card.Content>
			<p class="amount">$4,280.00</p>
			<p class="note">Net 15. Payment method on file: Visa ending 4242.</p>
		</Card.Content>
		<Card.Footer>
			<Button variant="ghost" size="sm">Send reminder</Button>
			<Button variant="solid" size="sm">Mark paid</Button>
		</Card.Footer>
	</Card.Root>
</div>

<style>
	.cards {
		container-type: inline-size;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.header-row {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: var(--dry-space-2) 0 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
		margin: 0;
	}

	.meta div {
		display: grid;
		gap: var(--dry-space-1);
	}

	.meta dt {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.meta dd {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.amount {
		margin: 0;
		font-size: var(--dry-text-2xl-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	.note {
		margin: var(--dry-space-2) 0 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	@container (max-width: 42rem) {
		.cards {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
