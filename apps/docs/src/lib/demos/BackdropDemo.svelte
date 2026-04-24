<script lang="ts">
	import { Backdrop, Badge, Button } from '@dryui/ui';

	let open = $state(true);

	function close() {
		open = false;
	}

	function handleBackdropKey(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		close();
	}
</script>

<div class="stage">
	<div class="dashboard" aria-hidden={open}>
		<header class="head">
			<p class="eyebrow">Deploys</p>
			<p class="title">dryui-studio / production</p>
		</header>
		<ul class="rows">
			<li>
				<span class="row-name">api-gateway</span><Badge variant="soft" size="sm">Passing</Badge>
			</li>
			<li>
				<span class="row-name">billing-edge</span><Badge variant="soft" size="sm">Passing</Badge>
			</li>
			<li>
				<span class="row-name">scratchpad-web</span><Badge variant="outline" size="sm">Queued</Badge
				>
			</li>
		</ul>
		<Button variant="outline" onclick={() => (open = true)}>Show backdrop</Button>
	</div>

	<Backdrop
		{open}
		role="button"
		tabindex={0}
		aria-label="Dismiss backdrop"
		onclick={close}
		onkeydown={handleBackdropKey}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="backdrop-title"
			tabindex={-1}
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<p class="eyebrow">Confirm</p>
			<p id="backdrop-title" class="modal-title">Cancel the queued deploy?</p>
			<p class="note">The scratchpad-web build will stop. In-flight work continues.</p>
			<div class="actions">
				<Button variant="ghost" onclick={close}>Keep it running</Button>
				<Button variant="solid" color="danger" onclick={close}>Cancel deploy</Button>
			</div>
		</div>
	</Backdrop>
</div>

<style>
	.stage {
		position: relative;
		display: grid;
		min-block-size: 18em;
	}

	.dashboard {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 55%, transparent);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.rows {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.rows li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
		border-radius: var(--dry-radius-md);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.modal {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-base);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		max-inline-size: 28em;
		margin-inline: auto;
		box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.6);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title,
	.modal-title {
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
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}

	.row-name {
		color: var(--dry-color-text-strong);
	}
</style>
