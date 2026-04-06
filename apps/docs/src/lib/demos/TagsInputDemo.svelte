<script lang="ts">
	import { TagsInput } from '@dryui/ui';

	let tags = $state(['svelte', 'ui']);
</script>

<TagsInput.Root bind:value={tags}>
	<TagsInput.List>
		{#each tags as tag, i}
			<TagsInput.Tag index={i} value={tag}
				>{tag}<TagsInput.TagDelete index={i} value={tag} /></TagsInput.Tag
			>
		{/each}
		<TagsInput.Input placeholder="Add tag..." />
	</TagsInput.List>
</TagsInput.Root>
