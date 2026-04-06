<script lang="ts">
	import { Input } from '@dryui/ui';

	let email = $state('');
</script>

<Input type="email" bind:value={email} placeholder="you@example.com" />
