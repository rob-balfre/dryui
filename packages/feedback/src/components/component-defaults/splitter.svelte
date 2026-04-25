<script lang="ts">
	import { Splitter } from '@dryui/ui';
</script>

<Splitter.Root>
	<Splitter.Panel index={0}>
		<div>Navigation panel</div>
	</Splitter.Panel>
	<Splitter.Handle index={0} />
	<Splitter.Panel index={1}>
		<div>Editor content</div>
	</Splitter.Panel>
</Splitter.Root>
