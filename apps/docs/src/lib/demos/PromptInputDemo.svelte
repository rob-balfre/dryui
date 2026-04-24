<script lang="ts">
	import { PromptInput } from '@dryui/ui';

	let prompt = $state('Summarize the last 20 commits on main and group them by scope.');
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Assistant</p>
		<p class="title">Ask about this repo</p>
		<p class="note">
			Press Enter to send, Shift+Enter for a new line. Responses stream from the workspace model.
		</p>
	</div>
	<PromptInput bind:value={prompt} submitLabel="Send" />
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
	}

	.context {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
