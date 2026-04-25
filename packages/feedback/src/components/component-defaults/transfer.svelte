<script lang="ts">
	import { Transfer } from '@dryui/ui';

	let available = $state([
		{ key: 'billing:read', label: 'billing:read' },
		{ key: 'billing:write', label: 'billing:write' },
		{ key: 'audit:read', label: 'audit:read' },
		{ key: 'webhooks:manage', label: 'webhooks:manage' }
	]);

	let granted = $state([
		{ key: 'deployments:read', label: 'deployments:read' },
		{ key: 'deployments:write', label: 'deployments:write' },
		{ key: 'projects:read', label: 'projects:read' }
	]);
</script>

<Transfer.Root bind:sourceItems={available} bind:targetItems={granted}>
	<Transfer.List type="source" title="Available" filterable />
	<Transfer.Actions />
	<Transfer.List type="target" title="Granted" filterable />
</Transfer.Root>
