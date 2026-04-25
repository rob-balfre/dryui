<script lang="ts">
	import { TagsInput } from '@dryui/ui';
	let value = $state(['design', 'svelte']);
</script>

<TagsInput.Root bind:value>
	<TagsInput.List>
		{#each value as tag, index}
			<TagsInput.Tag {index} value={tag}>
				{tag}
				<TagsInput.TagDelete {index} value={tag} />
			</TagsInput.Tag>
		{/each}
		<TagsInput.Input placeholder="Add tag..." />
	</TagsInput.List>
</TagsInput.Root>
