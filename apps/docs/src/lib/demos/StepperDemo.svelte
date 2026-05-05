<script lang="ts">
	import { Stepper } from '@dryui/ui';

	let activeStep = $state(1);
</script>

<Stepper.Root bind:activeStep>
	<Stepper.List>
		<Stepper.Step step={0}>Step 1</Stepper.Step>
		<Stepper.Separator step={0} />
		<Stepper.Step step={1}>Step 2</Stepper.Step>
		<Stepper.Separator step={1} />
		<Stepper.Step step={2}>Step 3</Stepper.Step>
	</Stepper.List>
</Stepper.Root>
