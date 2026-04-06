<script lang="ts">
	import { Stepper } from '@dryui/ui';

	let activeStep = $state(1);
</script>

<Stepper.Root bind:activeStep>
	<Stepper.List>
		<Stepper.Step step={0}>Account</Stepper.Step>
		<Stepper.Separator step={0} />
		<Stepper.Step step={1}>Profile</Stepper.Step>
		<Stepper.Separator step={1} />
		<Stepper.Step step={2}>Review</Stepper.Step>
	</Stepper.List>
</Stepper.Root>
