<script>
	import { FocusTrap, Button, Input } from '@dryui/ui';

	let active = $state(false);
</script>

<Button variant="outline" onclick={() => (active = true)}>Activate trap</Button>

{#if active}
	<FocusTrap active>
		<div class="trap-region">
			<p>Focus is trapped here. Press <kbd>Tab</kbd> to cycle through elements.</p>
			<Input placeholder="First input" />
			<Input placeholder="Second input" />
			<Button variant="outline" onclick={() => (active = false)}>Deactivate trap</Button>
		</div>
	</FocusTrap>
{/if}

<style>
	.trap-region {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border: 2px solid var(--dry-color-stroke-brand);
		border-radius: var(--dry-radius-lg);
	}

	kbd {
		padding: var(--dry-space-1) var(--dry-space-2);
		background: var(--dry-color-bg-raised);
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-sm);
		font-size: 0.85em;
	}
</style>
