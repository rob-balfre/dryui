<script lang="ts">
	import { OptionPicker } from '@dryui/ui';

	const plans = [
		{
			label: 'Hobby',
			desc: 'One project, 100 GB bandwidth, community support.',
			price: '$0',
			per: 'free forever'
		},
		{
			label: 'Pro',
			desc: 'Unlimited projects, preview deploys, email support.',
			price: '$24',
			per: 'per member / mo'
		},
		{
			label: 'Team',
			desc: 'SSO, audit logs, shared environments, Slack support.',
			price: '$96',
			per: 'per member / mo'
		}
	];
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Billing</p>
		<p class="title">Choose a plan</p>
		<p class="note">Change or cancel anytime. Annual billing saves 20% on Pro and Team.</p>
	</div>

	<OptionPicker.Root columns={3}>
		{#each plans as plan (plan.label)}
			<OptionPicker.Item value={plan.label}>
				<OptionPicker.Label>{plan.label}</OptionPicker.Label>
				<OptionPicker.Description>{plan.desc}</OptionPicker.Description>
				<OptionPicker.Meta>
					<span class="price">{plan.price}</span>
					<span class="period">{plan.per}</span>
				</OptionPicker.Meta>
			</OptionPicker.Item>
		{/each}
	</OptionPicker.Root>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
	}
	.context {
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

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	.price {
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.period {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		margin-inline-start: var(--dry-space-1);
	}
</style>
