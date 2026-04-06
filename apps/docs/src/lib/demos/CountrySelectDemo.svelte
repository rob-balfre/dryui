<script>
	import { CountrySelect } from '@dryui/ui';

	let country = $state('');
</script>

<CountrySelect bind:value={country} placeholder="Select country" />
