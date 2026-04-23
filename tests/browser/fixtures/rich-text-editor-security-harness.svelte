<script lang="ts">
	import { RichTextEditor as PrimitiveRichTextEditor } from '../../../packages/primitives/src/rich-text-editor/index.js';
	import { RichTextEditor } from '../../../packages/ui/src/rich-text-editor/index.js';

	const dangerousHtml =
		'<h1 onclick="alert(1)">Title</h1><scr' +
		'ipt>alert(1)</scr' +
		'ipt><p><a href="javascript:alert(1)" onclick="alert(1)">Bad link</a><a href="https://example.com" target="_self" rel="opener">Good link</a><img src=x onerror="alert(1)"><strong style="color:red">Bold</strong></p>';

	let uiValue = $state(dangerousHtml);
	let primitiveValue = $state(dangerousHtml);
</script>

<section data-testid="ui-rte-section">
	<RichTextEditor.Root bind:value={uiValue} data-testid="ui-rte-root">
		<RichTextEditor.Content data-testid="ui-rte-content" />
	</RichTextEditor.Root>
	<output data-testid="ui-rte-value">{uiValue}</output>
</section>

<section data-testid="primitive-rte-section">
	<PrimitiveRichTextEditor.Root bind:value={primitiveValue} data-testid="primitive-rte-root">
		<PrimitiveRichTextEditor.Content data-testid="primitive-rte-content" />
	</PrimitiveRichTextEditor.Root>
	<output data-testid="primitive-rte-value">{primitiveValue}</output>
</section>
