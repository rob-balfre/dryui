<script lang="ts">
	import { Button, IconSwap } from '@dryui/ui';
	import { CheckIcon, CopyIcon } from 'lucide-svelte';

	let copied = $state(false);
</script>

<Button variant="soft" onclick={() => (copied = !copied)}>
	<IconSwap icon={copied ? CheckIcon : CopyIcon} label={copied ? 'Copied' : 'Copy'} />
	{copied ? 'Copied' : 'Copy'}
</Button>
