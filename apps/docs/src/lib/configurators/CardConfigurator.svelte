<script lang="ts">
	import { Badge, Button, Card, Heading } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type CardVariant = 'default' | 'elevated' | 'interactive';
	type CardSize = 'default' | 'sm';
	type CardOrientation = 'vertical' | 'horizontal';

	const controls = [
		{
			key: 'variant',
			label: 'Variant',
			type: 'select',
			defaultValue: 'default',
			options: [
				{ label: 'Default', value: 'default' },
				{ label: 'Elevated', value: 'elevated' },
				{ label: 'Interactive', value: 'interactive' }
			],
			description: 'Match the surface treatment to the amount of emphasis the container needs.'
		},
		{
			key: 'size',
			label: 'Size',
			type: 'select',
			defaultValue: 'default',
			options: [
				{ label: 'Default', value: 'default' },
				{ label: 'Small', value: 'sm' }
			],
			description: 'Use the smaller size only when the surrounding layout is already dense.'
		},
		{
			key: 'orientation',
			label: 'Orientation',
			type: 'select',
			defaultValue: 'vertical',
			options: [
				{ label: 'Vertical', value: 'vertical' },
				{ label: 'Horizontal', value: 'horizontal' }
			],
			description: 'Switch orientation to test how the content block behaves in list layouts.'
		},
		{
			key: 'selected',
			label: 'Selected',
			type: 'boolean',
			defaultValue: false,
			description: 'Preview the active treatment for selectable or interactive surfaces.'
		}
	] satisfies ConfigControl[];

	function getCode(values: ConfigValues) {
		const variant = values.variant as CardVariant;
		const size = values.size as CardSize;
		const orientation = values.orientation as CardOrientation;
		const selected = values.selected === true ? ' selected' : '';

		return `<Card.Root variant="${variant}" size="${size}" orientation="${orientation}"${selected}>\n  <Card.Header>\n    <h3>Team update</h3>\n    <p>Weekly planning sync at 09:30.</p>\n  </Card.Header>\n  <Card.Content>\n    <p>Review the final agenda and confirm who owns each follow-up.</p>\n  </Card.Content>\n  <Card.Footer>\n    <Button variant="outline">Review</Button>\n    <Button>Open</Button>\n  </Card.Footer>\n</Card.Root>`;
	}
</script>

<Configurator
	title="Card Configurator"
	description="Check hierarchy, density, and orientation before the card becomes part of a larger list or dashboard."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="config-card">
			<Card.Root
				variant={values.variant as CardVariant}
				size={values.size as CardSize}
				orientation={values.orientation as CardOrientation}
				selected={Boolean(values.selected)}
			>
				<Card.Header>
					<div class="card-header-stack">
						<Badge variant="soft" color="blue" size="sm">Planning</Badge>
						<div class="card-header-stack">
							<Heading level={4}>Team update</Heading>
							<p class="header-copy">Weekly planning sync at 09:30.</p>
						</div>
					</div>
				</Card.Header>
				<Card.Content>
					<p class="content-copy">
						Review the final agenda and confirm who owns each follow-up before the meeting starts.
					</p>
				</Card.Content>
				<Card.Footer>
					<Button variant="outline">Review</Button>
					<Button>Open</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	{/snippet}
</Configurator>

<style>
	.card-header-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.content-copy,
	.header-copy {
		color: var(--dry-color-text-weak);
	}

	.config-card {
		display: grid;
		grid-template-columns: minmax(0, 34rem);
	}
</style>
