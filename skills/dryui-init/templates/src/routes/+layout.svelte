<script lang="ts">
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import '../app.css';
	import '../layout.css';

	let { children } = $props();
</script>

{@render children()}
