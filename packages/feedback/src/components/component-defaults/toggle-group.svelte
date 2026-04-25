<script lang="ts">
	import { ToggleGroup } from '@dryui/ui';
</script>

<ToggleGroup.Root type="single" value={['center']}>
	<ToggleGroup.Item value="left">Left</ToggleGroup.Item>
	<ToggleGroup.Item value="center">Center</ToggleGroup.Item>
	<ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>
