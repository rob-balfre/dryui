<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Textarea } from '../../../packages/ui/src/textarea/index.js';
	import { Field } from '../../../packages/ui/src/field/index.js';
	import { Label } from '../../../packages/ui/src/label/index.js';

	let { initialValue: value = '' }: { initialValue?: string } = $props();
</script>

<div data-testid="bound-value">{value}</div>

<div data-testid="default">
	<Textarea bind:value data-testid="default-textarea" />
</div>

<div data-testid="sizes">
	<Textarea size="sm" data-testid="sm-textarea" />
	<Textarea size="lg" data-testid="lg-textarea" />
</div>

<div data-testid="disabled">
	<Textarea disabled data-testid="disabled-textarea" />
</div>

<Field.Root error="Too short">
	<Label data-testid="field-label">Notes</Label>
	<Textarea data-testid="field-textarea" />
	<Field.Error>Too short</Field.Error>
</Field.Root>
