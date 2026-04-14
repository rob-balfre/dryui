<script lang="ts">
	import { OptionPicker } from '@dryui/ui';

	let plan = $state('pro');

	const plans = [
		{
			value: 'starter',
			label: 'Starter',
			description: 'For solo developers exploring the platform.',
			price: '$0',
			period: '/mo'
		},
		{
			value: 'pro',
			label: 'Pro',
			description: 'For teams shipping production apps.',
			price: '$24',
			period: '/mo'
		},
		{
			value: 'enterprise',
			label: 'Enterprise',
			description: 'Dedicated support, SSO, and custom SLAs.',
			price: '$99',
			period: '/mo'
		}
	];
</script>

<OptionPicker.Root bind:value={plan} columns={3}>
	{#each plans as { value, label, description, price, period } (value)}
		<OptionPicker.Item {value}>
			<OptionPicker.Label>{label}</OptionPicker.Label>
			<OptionPicker.Description>{description}</OptionPicker.Description>
			<OptionPicker.Meta>
				<span class="price">{price}</span><span class="period">{period}</span>
			</OptionPicker.Meta>
		</OptionPicker.Item>
	{/each}
</OptionPicker.Root>

<style>
	.price {
		font-size: var(--dry-type-heading-4-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.period {
		font-size: var(--dry-type-tiny-size);
		color: var(--dry-color-text-weak);
		margin-inline-start: var(--dry-space-1);
	}
</style>
