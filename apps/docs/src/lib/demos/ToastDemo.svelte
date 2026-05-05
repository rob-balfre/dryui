<script lang="ts">
	import { Button, Enter, Toast } from '@dryui/ui';
	import { toastStore } from '@dryui/primitives';
</script>

<div class="row">
	<Button variant="outline" onclick={() => toastStore.info('Saved')}>Info</Button>
	<Button variant="solid" onclick={() => toastStore.success('Updated')}>Success</Button>
	<Button variant="solid" color="danger" onclick={() => toastStore.error('Failed')}>Error</Button>
</div>

<Toast.Provider position="bottom-right">
	{#each toastStore.toasts as toast, index (toast.id)}
		<Enter {index}>
			<Toast.Root id={toast.id} variant={toast.variant}>
				{#if toast.title}<Toast.Title>{toast.title}</Toast.Title>{/if}
				{#if toast.description}<Toast.Description>{toast.description}</Toast.Description>{/if}
				<Toast.Close aria-label="Dismiss"><span aria-hidden="true">&times;</span></Toast.Close>
			</Toast.Root>
		</Enter>
	{/each}
</Toast.Provider>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
