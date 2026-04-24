<script lang="ts">
	import { Button, Toast } from '@dryui/ui';
	import { toastStore } from '@dryui/primitives';

	const fire = {
		info: () =>
			toastStore.info('Copied to clipboard', {
				description: 'Service URL copied for api-gateway.',
				duration: 2500
			}),
		success: () =>
			toastStore.success('Deployed to production', {
				description: 'api-gateway. 42s. 3 services updated.'
			}),
		error: () =>
			toastStore.error('Build failed on main', {
				description: 'Exit 1 on the test suite. Check the logs before retrying.'
			})
	};
</script>

<div class="row">
	<div class="context">
		<p class="eyebrow">Transient feedback</p>
		<p class="title">Trigger a toast</p>
		<p class="note">Each toast auto-dismisses except errors, which stay until closed.</p>
	</div>
	<div class="actions">
		<Button variant="outline" onclick={fire.info}>Info</Button>
		<Button variant="solid" onclick={fire.success}>Success</Button>
		<Button variant="solid" color="danger" onclick={fire.error}>Error</Button>
	</div>
</div>

<Toast.Provider position="bottom-right">
	{#each toastStore.toasts as toast (toast.id)}
		<Toast.Root id={toast.id} variant={toast.variant}>
			<div class="toast-body">
				{#if toast.title}<Toast.Title>{toast.title}</Toast.Title>{/if}
				{#if toast.description}<Toast.Description>{toast.description}</Toast.Description>{/if}
			</div>
			<Toast.Close aria-label="Dismiss"><span aria-hidden="true">&times;</span></Toast.Close>
		</Toast.Root>
	{/each}
</Toast.Provider>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-5);
	}

	.context,
	.actions,
	.toast-body {
		display: grid;
	}

	.context {
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

	.actions {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	.toast-body {
		gap: var(--dry-space-1);
	}
</style>
