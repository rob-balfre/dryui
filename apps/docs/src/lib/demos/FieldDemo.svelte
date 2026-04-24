<script lang="ts">
	import { Field, Label, Input, Textarea } from '@dryui/ui';

	let subdomain = $state('scratchpad');
	let reason = $state('');
	let error = 'Subdomain must be at least 6 characters.';
</script>

<div class="form">
	<Field.Root>
		<Label>Display name</Label>
		<Input value="Rob Balfre" />
		<Field.Description>Shown on commits and team mentions.</Field.Description>
	</Field.Root>

	<Field.Root error={subdomain.length < 6 ? error : ''}>
		<Label>Workspace subdomain</Label>
		<Input bind:value={subdomain} />
		<Field.Description>Lowercase letters, digits, and hyphens.</Field.Description>
		{#if subdomain.length < 6}
			<Field.Error>{error}</Field.Error>
		{/if}
	</Field.Root>

	<Field.Root required>
		<Label>Reason for deletion</Label>
		<Textarea bind:value={reason} />
		<Field.Description>
			We review each deletion request. Responses typically arrive within one business day.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
