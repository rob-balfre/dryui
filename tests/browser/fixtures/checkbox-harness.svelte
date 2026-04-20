<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Checkbox } from '../../../packages/ui/src/checkbox/index.js';

	let {
		initialChecked: checked = false,
		indeterminate = false
	}: { initialChecked?: boolean; indeterminate?: boolean } = $props();
</script>

<div data-testid="bound-checked">{String(checked)}</div>

<div data-testid="default">
	<Checkbox bind:checked data-testid="default-input" />
</div>

<div data-testid="with-label">
	<Checkbox data-testid="with-label-input">Accept terms</Checkbox>
</div>

<div data-testid="sizes">
	<Checkbox size="sm" data-testid="sm-input" />
	<Checkbox size="lg" data-testid="lg-input" />
</div>

<div data-testid="disabled">
	<Checkbox disabled data-testid="disabled-input" />
</div>

<div data-testid="indeterminate">
	<Checkbox {indeterminate} data-testid="indeterminate-input" />
</div>
