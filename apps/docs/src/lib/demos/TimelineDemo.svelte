<script lang="ts">
	import { Timeline } from '@dryui/ui';
</script>

<Timeline.Root>
	<Timeline.Item>
		<Timeline.Content>
			<Timeline.Title>Deployment started</Timeline.Title>
			<Timeline.Description>Pipeline triggered by main branch push.</Timeline.Description>
			<Timeline.Time>2 hours ago</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
	<Timeline.Item>
		<Timeline.Content>
			<Timeline.Title>Tests passed</Timeline.Title>
			<Timeline.Description>All 142 tests passed.</Timeline.Description>
			<Timeline.Time>1 hour ago</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>
