<script lang="ts">
	import { Toggle } from '@dryui/ui';

	let on = $state(false);
</script>

<Toggle bind:pressed={on}>Bold</Toggle>
