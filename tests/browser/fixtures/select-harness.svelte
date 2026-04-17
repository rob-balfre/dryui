<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Select } from '../../../packages/ui/src/select/index.js';

	let { initialValue = '' }: { initialValue?: string } = $props();

	let value = $state(initialValue);
	let open = $state(false);
</script>

<div data-testid="bound-value">{value}</div>
<div data-testid="bound-open">{String(open)}</div>

<div data-testid="select-wrap">
	<Select.Root bind:value bind:open name="fruit">
		<Select.Trigger data-testid="select-trigger">
			<Select.Value placeholder="Pick a fruit" />
		</Select.Trigger>
		<Select.Content data-testid="select-content">
			<Select.Item value="apple" data-testid="item-apple">Apple</Select.Item>
			<Select.Item value="banana" data-testid="item-banana">Banana</Select.Item>
			<Select.Item value="cherry" disabled data-testid="item-cherry">Cherry</Select.Item>
		</Select.Content>
	</Select.Root>
</div>
