<script lang="ts">
	import { Stepper } from '@dryui/ui';
</script>

<Stepper.Root activeStep={1}>
	<Stepper.List>
		<Stepper.Step step={0}>Account</Stepper.Step>
		<Stepper.Separator step={0} />
		<Stepper.Step step={1}>Profile</Stepper.Step>
		<Stepper.Separator step={1} />
		<Stepper.Step step={2}>Confirm</Stepper.Step>
	</Stepper.List>
</Stepper.Root>
