<script lang="ts">
	import { Alert } from '@dryui/ui';
</script>

<div class="stack">
	<Alert variant="warning" dismissible>
		{#snippet title()}GraphQL v1 sunsets on July 31{/snippet}
		{#snippet description()}
			Two endpoints still hit <code>/graphql</code>. Migrate to v2 before the window closes or
			requests will start returning 410.
		{/snippet}
	</Alert>

	<Alert variant="info">
		{#snippet title()}Maintenance window starts 02:00 UTC{/snippet}
		{#snippet description()}
			Production API pauses for up to 18 minutes while we roll the new Postgres primary.
		{/snippet}
	</Alert>

	<Alert variant="error">
		{#snippet title()}Webhook delivery failing{/snippet}
		{#snippet description()}
			<code>billing.invoice.paid</code> has failed 14 times in the last hour. Check the endpoint before
			Stripe backs off.
		{/snippet}
	</Alert>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
