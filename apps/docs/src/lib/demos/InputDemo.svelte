<script lang="ts">
	import { Input, Field, Label } from '@dryui/ui';

	let project = $state('scratchpad-api');
	let repo = $state('');
	let commit = $state('Fix race on concurrent write queue');
</script>

<div class="form">
	<Field.Root>
		<Label>Project name</Label>
		<Input bind:value={project} placeholder="my-api" />
	</Field.Root>

	<Field.Root required>
		<Label>GitHub repo</Label>
		<Input bind:value={repo} placeholder="acme/scratchpad" />
		<Field.Description>Format: owner/repository. Case-sensitive.</Field.Description>
	</Field.Root>

	<Field.Root>
		<Label>Commit message</Label>
		<Input bind:value={commit} />
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
