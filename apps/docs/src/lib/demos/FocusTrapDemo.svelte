<script lang="ts">
	import { Button, Field, FocusTrap, Input, Label } from '@dryui/ui';

	let active = $state(false);
	let value = $state('');
</script>

<Button variant="outline" onclick={() => (active = true)}>Open trap</Button>

{#if active}
	<FocusTrap active>
		<div class="trap" role="dialog" aria-label="Focus trap">
			<Field.Root>
				<Label>First field</Label>
				<Input bind:value placeholder="Type here" />
			</Field.Root>
			<Field.Root>
				<Label>Second field</Label>
				<Input placeholder="And here" />
			</Field.Root>
			<div class="actions">
				<Button variant="ghost" onclick={() => (active = false)}>Close</Button>
			</div>
		</div>
	</FocusTrap>
{/if}

<style>
	.trap {
		display: grid;
		gap: var(--dry-space-3);
		margin-block-start: var(--dry-space-3);
		padding: var(--dry-space-5);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}
</style>
