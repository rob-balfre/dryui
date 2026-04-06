<script lang="ts">
	import { Badge } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type BadgeVariant = 'solid' | 'outline' | 'soft' | 'dot';
	type BadgeSize = 'sm' | 'md';
	type BadgeColor = 'gray' | 'blue' | 'green' | 'orange';

	const controls = [
		{
			key: 'variant',
			label: 'Variant',
			type: 'select',
			defaultValue: 'soft',
			options: [
				{ label: 'Soft', value: 'soft' },
				{ label: 'Solid', value: 'solid' },
				{ label: 'Outline', value: 'outline' },
				{ label: 'Dot', value: 'dot' }
			],
			description: 'Use softer treatments for metadata and stronger ones for status.'
		},
		{
			key: 'color',
			label: 'Color',
			type: 'select',
			defaultValue: 'blue',
			options: [
				{ label: 'Gray', value: 'gray' },
				{ label: 'Blue', value: 'blue' },
				{ label: 'Green', value: 'green' },
				{ label: 'Orange', value: 'orange' }
			],
			description: 'Match tone to meaning without overloading the page with accent color.'
		},
		{
			key: 'size',
			label: 'Size',
			type: 'select',
			defaultValue: 'md',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' }
			],
			description: 'Keep badges compact so they stay secondary to the primary content.'
		}
	] satisfies ConfigControl[];

	function getCode(values: ConfigValues) {
		const variant = values.variant as BadgeVariant;
		const color = values.color as BadgeColor;
		const size = values.size as BadgeSize;

		return `<Badge variant="${variant}" color="${color}" size="${size}">Policy compliant</Badge>`;
	}
</script>

<Configurator
	title="Badge Configurator"
	description="Check the signal strength and density before you use a badge for status, count, or metadata."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="badge-preview">
			<Badge
				variant={values.variant as BadgeVariant}
				color={values.color as BadgeColor}
				size={values.size as BadgeSize}
			>
				Policy compliant
			</Badge>
			<p>Short copy keeps badges scannable and prevents them from competing with headings.</p>
		</div>
	{/snippet}
</Configurator>

<style>
	.badge-preview {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	p {
		display: grid;
		grid-template-columns: minmax(0, 32ch);
		text-align: center;
	}
</style>
