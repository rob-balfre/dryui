<script lang="ts">
	import { Button } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft';
	type ButtonSize = 'sm' | 'md' | 'lg';

	const controls = [
		{
			key: 'variant',
			label: 'Variant',
			type: 'select',
			defaultValue: 'solid',
			options: [
				{ label: 'Solid', value: 'solid' },
				{ label: 'Outline', value: 'outline' },
				{ label: 'Ghost', value: 'ghost' },
				{ label: 'Soft', value: 'soft' }
			],
			description: 'Choose the treatment that matches the action priority.'
		},
		{
			key: 'size',
			label: 'Size',
			type: 'select',
			defaultValue: 'md',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' },
				{ label: 'Large', value: 'lg' }
			],
			description: 'Tune density for tight toolbars or roomy hero areas.'
		},
		{
			key: 'disabled',
			label: 'Disabled',
			type: 'boolean',
			defaultValue: false,
			description: 'Verify the fallback state before wiring it into a flow.'
		}
	] satisfies ConfigControl[];

	function getCode(values: ConfigValues) {
		const variant = values.variant as ButtonVariant;
		const size = values.size as ButtonSize;
		const disabled = values.disabled === true ? ' disabled' : '';

		return `<Button variant="${variant}" size="${size}"${disabled}>Book now</Button>`;
	}
</script>

<Configurator
	title="Button Configurator"
	description="Dial treatment, density, and state before you place the button into a real layout."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="button-preview">
			<Button
				variant={values.variant as ButtonVariant}
				size={values.size as ButtonSize}
				disabled={Boolean(values.disabled)}
			>
				Book now
			</Button>
			<p>Keep a single dominant button per surface unless the actions are truly equal.</p>
		</div>
	{/snippet}
</Configurator>

<style>
	.button-preview {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	p {
		display: grid;
		grid-template-columns: minmax(0, 30ch);
		text-align: center;
	}
</style>
