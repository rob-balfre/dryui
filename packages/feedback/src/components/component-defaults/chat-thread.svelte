<script lang="ts">
	import { ChatThread } from '@dryui/ui';

	const messages = [
		{ author: 'Mira', body: 'The branch is ready for review.' },
		{ author: 'Jon', body: 'Running the final package checks now.' },
		{ author: 'Mira', body: 'Great, keep the PR focused.' }
	];
</script>

<ChatThread messageCount={messages.length} style="inline-size: 260px;">
	{#snippet children({ index })}
		{@const message = messages[index]}
		{#if message}
			<div
				style="padding: 10px 12px; border: 1px solid var(--dry-color-stroke-weak); border-radius: var(--dry-radius-md); background: var(--dry-color-bg-raised);"
			>
				<strong style="display: block; font-size: var(--dry-type-small-size);">
					{message.author}
				</strong>
				<span style="font-size: var(--dry-type-small-size); color: var(--dry-color-text-weak);">
					{message.body}
				</span>
			</div>
		{/if}
	{/snippet}
</ChatThread>
