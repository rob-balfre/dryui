<script lang="ts">
	import Link from '../../../packages/ui/src/link/link.svelte';

	interface Props {
		underline?: 'always' | 'hover' | 'none';
	}

	let { underline }: Props = $props();
</script>

<Link href="/docs" {underline}>Docs</Link>
