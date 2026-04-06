<script lang="ts">
	import { PromptInput } from '@dryui/ui';

	let prompt = $state('');
</script>

<PromptInput placeholder="Ask anything..." bind:value={prompt} />
