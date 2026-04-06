<script lang="ts">
	import { Textarea } from '@dryui/ui';

	let message = $state('');
</script>

<Textarea bind:value={message} placeholder="Write a message…" />
