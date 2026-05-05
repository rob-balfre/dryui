<script lang="ts">
	import { PromptInput } from '@dryui/ui';

	let prompt = $state('');
</script>

<PromptInput bind:value={prompt} submitLabel="Send" />
