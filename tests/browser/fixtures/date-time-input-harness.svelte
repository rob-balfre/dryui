<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { DateTimeInput } from '../../../packages/ui/src/date-time-input/index.js';

	const expectedIso = '2026-05-12T22:30:00.000Z';

	function createValue() {
		return new Date(expectedIso);
	}

	let defaultValue = $state(createValue());
	let smValue = $state(createValue());
	let mdValue = $state(createValue());
	let lgValue = $state(createValue());
</script>

<div data-testid="default-md">
	<DateTimeInput bind:value={defaultValue} name="appointment" data-testid="dti-default" />
	<output data-testid="default-value">{defaultValue.toISOString()}</output>
</div>

<div data-testid="sized">
	<DateTimeInput bind:value={smValue} size="sm" name="appointment-sm" data-testid="dti-sm" />
	<DateTimeInput bind:value={mdValue} size="md" name="appointment-md" data-testid="dti-md" />
	<DateTimeInput bind:value={lgValue} size="lg" name="appointment-lg" data-testid="dti-lg" />
</div>
