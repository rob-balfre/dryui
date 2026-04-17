<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { RadioGroup } from '../../../packages/ui/src/radio-group/index.js';

	let {
		initialValue = '',
		orientation = 'vertical',
		disabled = false
	}: {
		initialValue?: string;
		orientation?: 'horizontal' | 'vertical';
		disabled?: boolean;
	} = $props();

	let value = $state(initialValue);
</script>

<div data-testid="bound-value">{value}</div>

<RadioGroup.Root bind:value {orientation} {disabled} name="plan" data-testid="radio-root">
	<RadioGroup.Item value="free" data-testid="item-free">Free</RadioGroup.Item>
	<RadioGroup.Item value="pro" data-testid="item-pro">Pro</RadioGroup.Item>
	<RadioGroup.Item value="enterprise" disabled data-testid="item-enterprise"
		>Enterprise</RadioGroup.Item
	>
</RadioGroup.Root>
