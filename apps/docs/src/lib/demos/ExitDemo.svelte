<script lang="ts">
	import { Button, Exit, Text } from '@dryui/ui';
	import { CheckCircle2, X } from 'lucide-svelte';

	const initialToasts = [
		{ id: 'deploy', title: 'Deploy queued', body: 'Build #482 will start when tests pass.' },
		{ id: 'invite', title: 'Invite sent', body: 'ana@studio.co will get an email in a minute.' }
	];
	let toasts = $state([...initialToasts]);

	function dismiss(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	function reset() {
		toasts = [...initialToasts];
	}
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Exit transition</p>
		<Text color="secondary" size="sm">
			Exit applies a compact leave motion. Pair with an {`#if`} to dismiss toasts, dialogs, and empty-state
			callouts.
		</Text>
	</div>

	<div class="toasts" aria-live="polite">
		{#each toasts as toast (toast.id)}
			<Exit>
				<article class="toast">
					<div class="toast-icon" aria-hidden="true">
						<CheckCircle2 size={16} strokeWidth={2.25} />
					</div>
					<div class="toast-body">
						<p class="toast-title">{toast.title}</p>
						<p class="toast-note">{toast.body}</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						aria-label={`Dismiss ${toast.title}`}
						onclick={() => dismiss(toast.id)}
					>
						<X size={14} strokeWidth={2.25} aria-hidden="true" />
					</Button>
				</article>
			</Exit>
		{/each}
	</div>

	{#if toasts.length === 0}
		<Button variant="outline" size="sm" onclick={reset}>Restore toasts</Button>
	{/if}
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: start;
	}

	.head {
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

	.toasts {
		display: grid;
		gap: var(--dry-space-2);
		grid-template-columns: minmax(0, 22rem);
	}

	.toast {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: start;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 88%, transparent);
		box-shadow: 0 14px 32px color-mix(in srgb, black 16%, transparent);
	}

	.toast-icon {
		display: grid;
		place-items: center;
		block-size: 1.75rem;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-success) 22%, var(--dry-color-bg-base));
		color: var(--dry-color-text-strong);
	}

	.toast-body {
		display: grid;
		gap: 0.1rem;
	}

	.toast-title {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.toast-note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
