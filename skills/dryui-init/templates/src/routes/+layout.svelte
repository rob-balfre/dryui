<script lang="ts">
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import '../app.css';
	import '../layout.css';
	import { Feedback } from '@dryui/feedback';

	let { children } = $props();
</script>

{@render children()}

<Feedback serverUrl="http://localhost:4748" />
