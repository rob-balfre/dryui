<script lang="ts">
	import { Kbd, Menubar } from '@dryui/ui';

	const fileItems = [
		{ label: 'New file', kbd: 'Cmd+N' },
		{ label: 'Open recent.', kbd: 'Cmd+O' },
		{ label: 'Save', kbd: 'Cmd+S' },
		{ label: 'Save as.', kbd: 'Cmd+Shift+S' },
		{ label: 'Export report', kbd: '' }
	];
</script>

<div class="stage">
	<Menubar.Root>
		<Menubar.Menu>
			<Menubar.Trigger>File</Menubar.Trigger>
			<Menubar.Content>
				{#each fileItems as item (item.label)}
					<Menubar.Item>
						<span class="item-row"
							><span>{item.label}</span>{#if item.kbd}<Kbd>{item.kbd}</Kbd>{/if}</span
						>
					</Menubar.Item>
				{/each}
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>Edit</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Item><span class="item-row"><span>Undo</span><Kbd>Cmd+Z</Kbd></span></Menubar.Item>
				<Menubar.Item disabled
					><span class="item-row"><span>Redo</span><Kbd>Cmd+Shift+Z</Kbd></span></Menubar.Item
				>
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>View</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Item>Toggle sidebar</Menubar.Item>
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>Help</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Item>Documentation</Menubar.Item>
			</Menubar.Content>
		</Menubar.Menu>
	</Menubar.Root>

	<section class="flyout" aria-label="File menu preview">
		<p class="eyebrow">File menu preview</p>
		<ul>
			{#each fileItems as item, index (item.label)}
				{#if index === 2 || index === 4}
					<li class="sep" aria-hidden="true"></li>
				{/if}
				<li class="menu-item">
					<span>{item.label}</span>
					{#if item.kbd}<Kbd>{item.kbd}</Kbd>{/if}
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		align-items: start;
	}

	.item-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.flyout {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 45%, transparent);
		max-inline-size: 22em;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	ul {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.menu-item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.sep {
		display: block;
		block-size: 1px;
		background: color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
		margin-block: var(--dry-space-1);
	}
</style>
