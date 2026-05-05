<script lang="ts">
	import { Timeline } from '@dryui/ui';
</script>

<Timeline.Root>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Created</Timeline.Title>
			<Timeline.Time datetime="2026-04-09">Apr 9</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>

	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Reviewed</Timeline.Title>
			<Timeline.Time datetime="2026-04-15">Apr 15</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>

	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Merged</Timeline.Title>
			<Timeline.Time datetime="2026-04-18">Apr 18</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>
