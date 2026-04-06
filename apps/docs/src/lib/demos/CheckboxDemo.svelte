<script>
	import { Checkbox } from '@dryui/ui';

	let agreed = $state(false);
</script>

<Checkbox bind:checked={agreed}>I agree to the terms</Checkbox>
