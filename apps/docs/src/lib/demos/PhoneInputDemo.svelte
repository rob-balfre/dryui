<script lang="ts">
	import { PhoneInput, Field, Label } from '@dryui/ui';

	let phone = $state('');
</script>

<Field.Root>
	<Label>Phone number</Label>
	<PhoneInput bind:value={phone} defaultCountry="US" />
</Field.Root>
