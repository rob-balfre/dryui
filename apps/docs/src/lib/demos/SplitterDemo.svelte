<script lang="ts">
	import { Badge, Heading, Splitter, Text } from '@dryui/ui';
</script>

<div class="splitter-demo">
	<Splitter.Root>
		<Splitter.Panel index={0}>
			<div class="panel">
				<div class="panel-stack">
					<Badge variant="outline" color="gray">Navigation</Badge>
					<Heading level={4}>Project workspace</Heading>
					<Text color="secondary"
						>Keep the navigation panel compact while the main workspace expands.</Text
					>
					<ul class="panel-list">
						<li>Overview</li>
						<li>Automations</li>
						<li>Deployments</li>
					</ul>
				</div>
			</div>
		</Splitter.Panel>
		<Splitter.Handle index={0} />
		<Splitter.Panel index={1}>
			<div class="panel">
				<div class="panel-stack">
					<Badge variant="outline" color="gray">Editor</Badge>
					<Heading level={4}>Resizable content area</Heading>
					<Text color="secondary"
						>Drag the handle or use the arrow keys to rebalance space between the two panels.</Text
					>
					<div class="status-grid" aria-hidden="true">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		</Splitter.Panel>
	</Splitter.Root>
</div>

<style>
	.splitter-demo {
		min-height: 18rem;
	}

	.panel {
		padding: var(--dry-space-6);
		background: var(--dry-color-bg-raised);
	}

	.panel-stack {
		display: grid;
		gap: var(--dry-space-3);
		align-content: start;
		min-height: 100%;
	}

	.panel-list {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding-left: var(--dry-space-5);
		color: var(--dry-color-text-weak);
	}

	.status-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
		margin-top: auto;
		padding-top: var(--dry-space-2);
	}

	.status-grid span {
		display: block;
		min-height: var(--dry-space-12);
		border-radius: var(--dry-radius-md);
		border: 1px solid var(--dry-color-stroke-weak);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 72%, transparent);
	}
</style>
