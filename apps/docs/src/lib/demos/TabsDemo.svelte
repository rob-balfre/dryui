<script lang="ts">
	import { Badge, Tabs } from '@dryui/ui';
</script>

<Tabs.Root value="members">
	<Tabs.List>
		<Tabs.Trigger value="general">General</Tabs.Trigger>
		<Tabs.Trigger value="members">Members</Tabs.Trigger>
		<Tabs.Trigger value="billing">Billing</Tabs.Trigger>
		<Tabs.Trigger value="integrations">Integrations</Tabs.Trigger>
		<Tabs.Trigger value="webhooks">Webhooks</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="general">
		<div class="panel">
			<p class="eyebrow">Workspace / General</p>
			<p class="body">Name, slug, timezone, and default region for every new project.</p>
		</div>
	</Tabs.Content>

	<Tabs.Content value="members">
		<div class="panel">
			<div class="panel-head">
				<div>
					<p class="eyebrow">Workspace / Members</p>
					<p class="title">4 members, 2 invites pending</p>
				</div>
				<Badge variant="soft" color="blue">Seats 4 / 10</Badge>
			</div>
			<ul class="member-list">
				<li>
					<span class="who">@rianne</span><Badge variant="outline" color="gray" size="sm"
						>Owner</Badge
					>
				</li>
				<li>
					<span class="who">@marco</span><Badge variant="outline" color="gray" size="sm"
						>Admin</Badge
					>
				</li>
				<li>
					<span class="who">@priya</span><Badge variant="outline" color="gray" size="sm"
						>Developer</Badge
					>
				</li>
				<li>
					<span class="who">@ada</span><Badge variant="outline" color="gray" size="sm"
						>Developer</Badge
					>
				</li>
			</ul>
		</div>
	</Tabs.Content>

	<Tabs.Content value="billing">
		<div class="panel">
			<p class="eyebrow">Workspace / Billing</p>
			<p class="body">Plan, invoices, and the card on file for this workspace.</p>
		</div>
	</Tabs.Content>

	<Tabs.Content value="integrations">
		<div class="panel">
			<p class="eyebrow">Workspace / Integrations</p>
			<p class="body">GitHub, Slack, Linear, and 12 more. Connect with OAuth.</p>
		</div>
	</Tabs.Content>

	<Tabs.Content value="webhooks">
		<div class="panel">
			<p class="eyebrow">Workspace / Webhooks</p>
			<p class="body">Outbound webhooks for deploy events, with signed payloads and retries.</p>
		</div>
	</Tabs.Content>
</Tabs.Root>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) 0;
	}

	.panel-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: var(--dry-space-1) 0 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.member-list {
		display: grid;
		gap: var(--dry-space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.member-list li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.who {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
