<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Field } from '../../../packages/ui/src/field/index.js';
	import { Label } from '../../../packages/ui/src/label/index.js';
	import { PinInput } from '../../../packages/ui/src/pin-input/index.js';
	import { TimeInput } from '../../../packages/ui/src/time-input/index.js';
</script>

<Field.Root error="Required time">
	<Label>Departure time</Label>
	<TimeInput data-testid="time-input" />
	<Field.Description data-testid="time-description">Pick a departure time.</Field.Description>
	<Field.Error data-testid="time-error">Required time</Field.Error>
</Field.Root>

<Field.Root error="PIN required">
	<Label>Confirmation PIN</Label>
	<PinInput.Root data-testid="pin-input" />
	<Field.Description data-testid="pin-description">Enter the confirmation code.</Field.Description>
	<Field.Error data-testid="pin-error">PIN required</Field.Error>
</Field.Root>
