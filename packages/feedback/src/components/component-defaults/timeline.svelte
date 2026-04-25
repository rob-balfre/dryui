<script lang="ts">
	import { Timeline } from '@dryui/ui';
</script>

<Timeline.Root>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Release 1.4.0 shipped</Timeline.Title>
			<Timeline.Description>
				Pagination, DataGrid sorting, and a new MarkdownRenderer landed in production.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-24">Today at 09:12 UTC</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Patch 1.3.7</Timeline.Title>
			<Timeline.Description>
				Fix focus trap leaking past AlertDialog close, plus Safari date parsing regression.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-18">Apr 18</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Reverted 1.3.6</Timeline.Title>
			<Timeline.Description>
				Rolled back due to a regression in Tree selection when defaultExpanded was empty.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-15">Apr 15</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>Token consolidation 1.3.5</Timeline.Title>
			<Timeline.Description>
				Deprecate --dry-color-accent in favor of --dry-color-primary.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-09">Apr 9</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>
