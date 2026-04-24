<script lang="ts">
	import { PhoneInput, Field, Label } from '@dryui/ui';

	let phone = $state('');
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Two-factor auth</p>
		<p class="title">Recovery phone</p>
		<p class="note">
			We text a 6-digit code here when your backup methods fail. Carrier charges may apply.
		</p>
	</div>
	<Field.Root required>
		<Label>Mobile number</Label>
		<PhoneInput bind:value={phone} defaultCountry="US" placeholder="(555) 204-8817" />
		<Field.Description>Include area code. SMS-capable numbers only.</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.context {
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
