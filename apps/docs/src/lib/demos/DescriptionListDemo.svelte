<script lang="ts">
	import { DescriptionList } from '@dryui/ui';
</script>

<div class="card">
	<p class="eyebrow">Invoice INV-2041</p>
	<DescriptionList.Root>
		<DescriptionList.Item>
			<DescriptionList.Term>Customer</DescriptionList.Term>
			<DescriptionList.Description>Northwind Labs, Pro plan, 12 seats</DescriptionList.Description>
		</DescriptionList.Item>
		<DescriptionList.Item>
			<DescriptionList.Term>Billing period</DescriptionList.Term>
			<DescriptionList.Description>Apr 1 to Apr 30, 2026</DescriptionList.Description>
		</DescriptionList.Item>
		<DescriptionList.Item>
			<DescriptionList.Term>Amount due</DescriptionList.Term>
			<DescriptionList.Description>$1,284.00 USD, taxes included</DescriptionList.Description>
		</DescriptionList.Item>
		<DescriptionList.Item>
			<DescriptionList.Term>Payment method</DescriptionList.Term>
			<DescriptionList.Description>Visa ending 4242, expires 09 / 27</DescriptionList.Description>
		</DescriptionList.Item>
		<DescriptionList.Item>
			<DescriptionList.Term>Issued by</DescriptionList.Term>
			<DescriptionList.Description>billing@dryui.dev on Apr 4, 2026</DescriptionList.Description>
		</DescriptionList.Item>
	</DescriptionList.Root>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
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
