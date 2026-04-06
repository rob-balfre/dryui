<script lang="ts">
	import { Rating } from '@dryui/ui';

	let score = $state(3);
</script>

<Rating bind:value={score} />
