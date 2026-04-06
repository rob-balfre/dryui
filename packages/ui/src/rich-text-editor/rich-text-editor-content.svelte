<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { RichTextEditor as RichTextEditorPrimitive } from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();
</script>

<RichTextEditorPrimitive.Content data-part="content" {...rest} />
