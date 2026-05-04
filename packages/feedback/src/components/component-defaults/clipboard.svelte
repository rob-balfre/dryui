<script lang="ts">
	import { Button, Clipboard } from '@dryui/ui';

	const value = 'dryui-feedback';
</script>

<Clipboard {value}>
	{#snippet children({ copied, copy })}
		<Button variant="outline" size="sm" onclick={copy}>{copied ? 'Copied' : 'Copy value'}</Button>
	{/snippet}
</Clipboard>
