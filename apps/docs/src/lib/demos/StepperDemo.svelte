<script lang="ts">
	import { Stepper } from '@dryui/ui';

	let activeStep = $state(1);
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Onboarding</p>
		<p class="title">Connect your first workspace</p>
		<p class="note">
			Pick up where you left off. Billing is optional until you invite a second seat.
		</p>
	</div>
	<Stepper.Root bind:activeStep>
		<Stepper.List>
			<Stepper.Step step={0}>Install CLI</Stepper.Step>
			<Stepper.Separator step={0} />
			<Stepper.Step step={1}>Link repo</Stepper.Step>
			<Stepper.Separator step={1} />
			<Stepper.Step step={2}>Invite team</Stepper.Step>
			<Stepper.Separator step={2} />
			<Stepper.Step step={3}>Add billing</Stepper.Step>
		</Stepper.List>
	</Stepper.Root>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.heading {
		display: grid;
		gap: var(--dry-space-1);
	}
	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
