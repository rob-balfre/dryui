<script lang="ts">
	import { List } from '@dryui/ui';
</script>

<List.Root>
	<List.Subheader>Workspace</List.Subheader>
	<List.Item>
		<List.ItemText primary={primary1} secondary={secondary1} />
	</List.Item>
	<List.Item>
		<List.ItemText primary={primary2} secondary={secondary2} />
	</List.Item>
	<List.Item>
		<List.ItemText primary={primary3} secondary={secondary3} />
	</List.Item>
</List.Root>

{#snippet primary1()}Inbox{/snippet}
{#snippet secondary1()}3 unread messages{/snippet}
{#snippet primary2()}Projects{/snippet}
{#snippet secondary2()}5 active{/snippet}
{#snippet primary3()}Archive{/snippet}
{#snippet secondary3()}Read-only{/snippet}
