<script lang="ts">
	import { Badge, Timeline } from '@dryui/ui';
</script>

<Timeline.Root>
	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>
				<span class="row">1.4.0 <Badge variant="soft" color="green" size="sm">live</Badge></span>
			</Timeline.Title>
			<Timeline.Description>
				Ship Pagination, DataGrid sorting, and a new MarkdownRenderer. 3 breaking changes in the
				release notes.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-24">Today at 09:12 UTC</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>

	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>
				<span class="row">1.3.7 <Badge variant="outline" color="gray" size="sm">patch</Badge></span>
			</Timeline.Title>
			<Timeline.Description>
				Fix focus trap leaking past AlertDialog close, plus Safari 17 date parsing regression.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-18">Apr 18</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>

	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>
				<span class="row"
					>1.3.6 <Badge variant="outline" color="red" size="sm">reverted</Badge></span
				>
			</Timeline.Title>
			<Timeline.Description>
				Rolled back due to a regression in Tree selection when defaultExpanded was empty.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-15">Apr 15</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>

	<Timeline.Item>
		<Timeline.Icon />
		<Timeline.Content>
			<Timeline.Title>1.3.5</Timeline.Title>
			<Timeline.Description>
				Token surface consolidation. Deprecate `--dry-color-accent` in favor of
				`--dry-color-primary`.
			</Timeline.Description>
			<Timeline.Time datetime="2026-04-09">Apr 9</Timeline.Time>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
