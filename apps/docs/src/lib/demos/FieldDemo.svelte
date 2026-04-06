<script>
	import { Field, Label, Input } from '@dryui/ui';

	let username = $state('');
</script>

<Field.Root>
	<Label>Username</Label>
	<Input bind:value={username} placeholder="Enter your username" />
</Field.Root>
