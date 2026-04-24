<script lang="ts">
	import { Badge, ScrollArea } from '@dryui/ui';

	const releases = [
		{
			version: '1.4.0',
			date: 'Apr 24',
			tag: 'minor',
			notes: 'DataGrid sorting, MarkdownRenderer, Pagination keyboard paths.'
		},
		{
			version: '1.3.7',
			date: 'Apr 18',
			tag: 'patch',
			notes: 'Fix focus trap leaking past AlertDialog close, Safari 17 date parsing.'
		},
		{
			version: '1.3.6',
			date: 'Apr 15',
			tag: 'reverted',
			notes: 'Rolled back due to a Tree selection regression with empty defaultExpanded.'
		},
		{
			version: '1.3.5',
			date: 'Apr 9',
			tag: 'patch',
			notes: 'Deprecate --dry-color-accent in favor of --dry-color-primary.'
		},
		{
			version: '1.3.4',
			date: 'Apr 2',
			tag: 'patch',
			notes: 'Tooltip respects prefers-reduced-motion on open.'
		},
		{
			version: '1.3.3',
			date: 'Mar 28',
			tag: 'patch',
			notes: 'Combobox: filter state no longer survives dismissal.'
		},
		{
			version: '1.3.2',
			date: 'Mar 22',
			tag: 'patch',
			notes: 'Calendar: correct week-start offset when locale sets Sunday.'
		},
		{
			version: '1.3.1',
			date: 'Mar 17',
			tag: 'patch',
			notes: 'AlertDialog traps focus even when triggered programmatically.'
		},
		{
			version: '1.3.0',
			date: 'Mar 10',
			tag: 'minor',
			notes: 'Tree component, MultiSelectCombobox, semantic color aliases.'
		}
	] as const;

	function color(tag: string) {
		if (tag === 'minor') return 'blue';
		if (tag === 'reverted') return 'red';
		return 'gray';
	}
</script>

<div class="frame">
	<ScrollArea>
		<ul class="log">
			{#each releases as release (release.version)}
				<li class="entry">
					<div class="head">
						<span class="version">v{release.version}</span>
						<Badge variant="soft" color={color(release.tag)} size="sm">{release.tag}</Badge>
						<span class="date">{release.date}</span>
					</div>
					<p class="notes">{release.notes}</p>
				</li>
			{/each}
		</ul>
	</ScrollArea>
</div>

<style>
	.frame {
		display: grid;
		block-size: 14rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.log {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: var(--dry-space-4);
		list-style: none;
	}

	.entry {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.version {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.date {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		margin-left: auto;
	}

	.notes {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}
</style>
