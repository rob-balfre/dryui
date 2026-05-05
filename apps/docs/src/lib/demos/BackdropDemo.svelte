<script lang="ts">
	import { Backdrop, Button } from '@dryui/ui';

	let open = $state(true);

	function close() {
		open = false;
	}

	function handleBackdropKey(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		close();
	}
</script>

<div class="stage">
	<Button variant="outline" onclick={() => (open = true)}>Show backdrop</Button>

	<Backdrop
		{open}
		role="button"
		tabindex={0}
		aria-label="Dismiss backdrop"
		onclick={close}
		onkeydown={handleBackdropKey}
	/>
</div>

<style>
	.stage {
		position: relative;
		display: grid;
		justify-items: start;
		min-block-size: 18em;
	}
</style>
