<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Input } from '../../../packages/ui/src/input/index.js';
	import { Field } from '../../../packages/ui/src/field/index.js';
	import { Label } from '../../../packages/ui/src/label/index.js';

	let { initialValue = '' }: { initialValue?: string } = $props();

	let boundValue = $state(initialValue);
</script>

<div data-testid="bound-value">{boundValue}</div>

<div data-testid="default">
	<Input bind:value={boundValue} data-testid="default-input" />
</div>

<div data-testid="sized">
	<Input size="sm" data-testid="sm-input" />
	<Input size="lg" data-testid="lg-input" />
</div>

<div data-testid="ghost">
	<Input variant="ghost" data-testid="ghost-input" />
</div>

<div data-testid="disabled">
	<Input disabled data-testid="disabled-input" />
</div>

<div data-testid="placeholder">
	<Input placeholder="Search..." data-testid="placeholder-input" />
</div>

<Field.Root error="Required">
	<Label data-testid="field-label">Username</Label>
	<Input data-testid="field-input" />
	<Field.Error>Required</Field.Error>
</Field.Root>
