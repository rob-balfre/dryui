<script lang="ts">
	import { Transfer } from '@dryui/ui';

	let available = $state([
		{ key: 'billing:read', label: 'billing:read' },
		{ key: 'billing:write', label: 'billing:write' },
		{ key: 'audit:read', label: 'audit:read' },
		{ key: 'webhooks:manage', label: 'webhooks:manage' },
		{ key: 'members:invite', label: 'members:invite' },
		{ key: 'members:remove', label: 'members:remove' }
	]);

	let granted = $state([
		{ key: 'deployments:read', label: 'deployments:read' },
		{ key: 'deployments:write', label: 'deployments:write' },
		{ key: 'projects:read', label: 'projects:read' }
	]);
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Role editor</p>
		<p class="title">Scopes for "Deploy bot"</p>
		<p class="note">
			Move permissions into the granted list. Rotating the token resets scopes to this set.
		</p>
	</div>

	<Transfer.Root bind:sourceItems={available} bind:targetItems={granted}>
		<Transfer.List type="source" title="Available" filterable />
		<Transfer.Actions />
		<Transfer.List type="target" title={`Granted (${granted.length})`} filterable />
	</Transfer.Root>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
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
