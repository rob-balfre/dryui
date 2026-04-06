<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
</script>

<span class="streaming-text">{text}</span>

<style>
	.streaming-text {
		display: inline;
	}
</style>
