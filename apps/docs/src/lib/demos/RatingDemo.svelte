<script lang="ts">
	import { Rating, Field, Label } from '@dryui/ui';

	let value = $state(4);
</script>

<Field.Root>
	<Label>Rating</Label>
	<Rating bind:value max={5} allowHalf />
</Field.Root>
