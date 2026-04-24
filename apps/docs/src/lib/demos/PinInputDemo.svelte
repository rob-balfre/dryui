<script lang="ts">
	import { PinInput, Field, Label } from '@dryui/ui';

	let code = $state('');
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Verification</p>
		<p class="title">Enter the 6-digit code</p>
		<p class="note">
			Sent to (+1) 555 204 8817 about 30 seconds ago. Codes expire after 10 minutes.
		</p>
	</div>

	<Field.Root>
		<Label>Recovery code</Label>
		<PinInput.Root bind:value={code} length={6}>
			{#snippet children({ cells })}
				<PinInput.Group>
					{#each cells.slice(0, 3) as cell (cell.index)}
						<PinInput.Cell {cell} />
					{/each}
				</PinInput.Group>
				<PinInput.Separator />
				<PinInput.Group>
					{#each cells.slice(3) as cell (cell.index)}
						<PinInput.Cell {cell} />
					{/each}
				</PinInput.Group>
			{/snippet}
		</PinInput.Root>
	</Field.Root>

	<p class="meta">Did not receive it? <a href="#resend">Resend code</a> in 0:24.</p>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
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

	.note,
	.meta {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	a {
		color: var(--dry-color-fill-brand);
	}
</style>
