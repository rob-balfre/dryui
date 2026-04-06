<script lang="ts">
	import { RadioGroup } from '@dryui/ui';

	let choice = $state('one');
</script>

<RadioGroup.Root bind:value={choice}>
	<RadioGroup.Item value="one">Option one</RadioGroup.Item>
	<RadioGroup.Item value="two">Option two</RadioGroup.Item>
	<RadioGroup.Item value="three">Option three</RadioGroup.Item>
</RadioGroup.Root>
