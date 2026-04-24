<script lang="ts">
	import { Textarea, Field, Label } from '@dryui/ui';

	let commit = $state(
		`fix(queue): drop duplicate jobs at enqueue time\n\nPreviously we de-duped in the worker, which let the table grow\nunbounded under backpressure. Enqueue now hashes (topic, payload) and\nskips inserts that already exist in the pending window.\n\nCloses #4128.`
	);
</script>

<div class="panel">
	<Field.Root>
		<Label>Commit message</Label>
		<Textarea bind:value={commit} size="md" />
		<Field.Description>
			Subject under 72 characters. Body wraps at 80. Footer for trailers.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
	}
</style>
