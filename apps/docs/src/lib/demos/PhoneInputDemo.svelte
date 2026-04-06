<script lang="ts">
	import { PhoneInput } from '@dryui/ui';

	let phone = $state('');
</script>

<PhoneInput bind:value={phone} defaultCountry="US" placeholder="(555) 123-4567" />
