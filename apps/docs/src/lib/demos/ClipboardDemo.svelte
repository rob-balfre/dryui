<script lang="ts">
	import { Button, Clipboard } from '@dryui/ui';
</script>

<Clipboard value="dry_live_79k2v4NmPqXtR8WxZcBfLh3Y1A6Gj5Kd">
	{#snippet children({ copied, copy })}
		<Button variant="outline" onclick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
	{/snippet}
</Clipboard>
