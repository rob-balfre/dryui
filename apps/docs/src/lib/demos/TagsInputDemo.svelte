<script lang="ts">
	import { TagsInput, Field, Label } from '@dryui/ui';

	let origins = $state(['https://dryui.dev', 'https://docs.dryui.dev', 'http://localhost:5173']);
</script>

<div class="panel">
	<Field.Root>
		<Label>CORS allowed origins</Label>
		<TagsInput.Root bind:value={origins}>
			<TagsInput.List>
				{#each origins as origin, i (origin)}
					<TagsInput.Tag index={i} value={origin}>
						{origin}
						<TagsInput.TagDelete index={i} value={origin} />
					</TagsInput.Tag>
				{/each}
				<TagsInput.Input placeholder="https://example.com" />
			</TagsInput.List>
		</TagsInput.Root>
		<Field.Description>
			Press Enter to add. Wildcards (*.dryui.dev) are allowed for subdomains only.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}
</style>
