<script lang="ts">
	import { Button, Field, FocusTrap, Input, Kbd, Label } from '@dryui/ui';

	let active = $state(false);
	let project = $state('');
</script>

<div class="row">
	<div class="context">
		<p class="eyebrow">Custom overlay</p>
		<p class="title">Trap focus inside this card</p>
		<p class="note">
			Useful when you roll your own dialog shell instead of reaching for <code>Dialog</code>.
		</p>
	</div>
	<Button variant="outline" onclick={() => (active = true)}>Open trap</Button>
</div>

{#if active}
	<FocusTrap active>
		<div class="trap" role="dialog" aria-label="Create project">
			<p class="trap-title">Create project</p>
			<Field.Root>
				<Label>Project name</Label>
				<Input bind:value={project} placeholder="billing-worker" />
			</Field.Root>
			<p class="hint">
				<Kbd>Tab</Kbd> cycles through the trap. <Kbd>Esc</Kbd> still dismisses in a real dialog.
			</p>
			<div class="trap-actions">
				<Button variant="ghost" onclick={() => (active = false)}>Cancel</Button>
				<Button variant="solid" onclick={() => (active = false)}>Create</Button>
			</div>
		</div>
	</FocusTrap>
{/if}

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-5);
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

	.trap {
		display: grid;
		gap: var(--dry-space-3);
		margin-block-start: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-brand) 60%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 48%, transparent);
	}

	.trap-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.hint {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	.trap-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}
</style>
