<script lang="ts">
	import { List } from '@dryui/ui';
</script>

<List.Root>
	<List.Subheader>Inbox</List.Subheader>
	<List.Item interactive>
		<List.ItemIcon>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><rect width="20" height="16" x="2" y="4" rx="2" /><path
					d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
				/></svg
			>
		</List.ItemIcon>
		<List.ItemText>
			{#snippet primary()}New project proposal{/snippet}
			{#snippet secondary()}Alex — Hey, I've attached the updated proposal for Q3...{/snippet}
		</List.ItemText>
	</List.Item>
	<List.Item interactive>
		<List.ItemIcon>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><rect width="20" height="16" x="2" y="4" rx="2" /><path
					d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
				/></svg
			>
		</List.ItemIcon>
		<List.ItemText>
			{#snippet primary()}Team standup notes{/snippet}
			{#snippet secondary()}Jordan — Shared the meeting summary from this morning{/snippet}
		</List.ItemText>
	</List.Item>

	<List.Subheader>Pinned</List.Subheader>
	<List.Item interactive>
		<List.ItemIcon>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path
					d="M14 2v4a2 2 0 0 0 2 2h4"
				/></svg
			>
		</List.ItemIcon>
		<List.ItemText>
			{#snippet primary()}Design system guidelines{/snippet}
			{#snippet secondary()}Last updated 2 days ago{/snippet}
		</List.ItemText>
	</List.Item>
	<List.Item interactive disabled>
		<List.ItemIcon>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
					points="7 10 12 15 17 10"
				/><line x1="12" x2="12" y1="15" y2="3" /></svg
			>
		</List.ItemIcon>
		<List.ItemText>
			{#snippet primary()}Archived assets{/snippet}
			{#snippet secondary()}Currently unavailable{/snippet}
		</List.ItemText>
	</List.Item>
</List.Root>
