<script lang="ts">
	import { Tour } from '@dryui/ui';

	const steps = [
		{
			target: '#tour-default-step-1',
			title: 'Pick a starting environment',
			content: 'Every project starts with preview. Promote when you are ready to invite teammates.',
			placement: 'bottom' as const
		},
		{
			target: '#tour-default-step-2',
			title: 'Grab your first API key',
			content: 'Scoped to this project. Rotate any time without downtime for existing sessions.',
			placement: 'top' as const
		}
	];
</script>

<div id="tour-default-step-1">Environment</div>
<div id="tour-default-step-2">API keys</div>

<Tour.Root active {steps}>
	<Tour.Tooltip />
</Tour.Root>
