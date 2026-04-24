<script lang="ts">
	import { Badge, Button, NotificationCenter } from '@dryui/ui';

	let notifications = $state([
		{ id: 'n1', variant: 'info' as const, read: false },
		{ id: 'n2', variant: 'info' as const, read: false },
		{ id: 'n3', variant: 'warning' as const, read: false },
		{ id: 'n4', variant: 'info' as const, read: true }
	]);
</script>

<div class="stage">
	<div class="bar">
		<NotificationCenter.Root bind:items={notifications}>
			<NotificationCenter.Trigger>
				{#snippet children({ unreadCount })}
					<span class="trigger">
						<span class="bell" aria-hidden="true">
							<svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true">
								<path
									d="M8 2.5a3.5 3.5 0 0 0-3.5 3.5v1.4L3 9.5h10l-1.5-2.1V6A3.5 3.5 0 0 0 8 2.5Zm-1.25 9a1.25 1.25 0 0 0 2.5 0"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.3"
								/>
							</svg>
						</span>
						Inbox
						{#if unreadCount > 0}
							<Badge variant="solid" color="red" size="sm">{unreadCount}</Badge>
						{/if}
					</span>
				{/snippet}
			</NotificationCenter.Trigger>
			<NotificationCenter.Panel>
				<NotificationCenter.Group label="Today">
					<NotificationCenter.Item id="n1" variant="info">
						<div class="copy">
							<p class="title">Deploy finished on <code>main</code></p>
							<p class="note">api-gateway. 42s. 3 services updated.</p>
						</div>
					</NotificationCenter.Item>
					<NotificationCenter.Item id="n2" variant="info">
						<div class="copy">
							<p class="title">Review requested by @jules</p>
							<p class="note">PR #481. Migrate billing webhooks to v2.</p>
						</div>
					</NotificationCenter.Item>
					<NotificationCenter.Item id="n3" variant="warning">
						<div class="copy">
							<p class="title">Card expires next week</p>
							<p class="note">Update before 30 Apr to avoid a pause.</p>
						</div>
					</NotificationCenter.Item>
				</NotificationCenter.Group>
				<NotificationCenter.Group label="Earlier">
					<NotificationCenter.Item id="n4" read>
						<div class="copy">
							<p class="title">Usage at 80% for April</p>
							<p class="note">18% drop in cold starts. 3 new environments.</p>
						</div>
					</NotificationCenter.Item>
				</NotificationCenter.Group>
			</NotificationCenter.Panel>
		</NotificationCenter.Root>
	</div>

	<section class="panel" aria-label="Inbox preview">
		<p class="eyebrow">Today</p>
		<ul>
			<li class="item unread">
				<span class="dot" data-tone="info" aria-hidden="true"></span>
				<div class="copy">
					<p class="title">Deploy finished on <code>main</code></p>
					<p class="note">api-gateway. 42s. 3 services updated.</p>
				</div>
				<Button variant="ghost" size="sm">View</Button>
			</li>
			<li class="item unread">
				<span class="dot" data-tone="info" aria-hidden="true"></span>
				<div class="copy">
					<p class="title">Review requested by @jules</p>
					<p class="note">PR #481. Migrate billing webhooks to v2.</p>
				</div>
				<Button variant="ghost" size="sm">Open</Button>
			</li>
			<li class="item unread">
				<span class="dot" data-tone="warning" aria-hidden="true"></span>
				<div class="copy">
					<p class="title">Card expires next week</p>
					<p class="note">Update before 30 Apr to avoid a pause.</p>
				</div>
				<Button variant="ghost" size="sm">Billing</Button>
			</li>
		</ul>
		<p class="eyebrow">Earlier</p>
		<ul>
			<li class="item">
				<span class="dot" data-tone="muted" aria-hidden="true"></span>
				<div class="copy">
					<p class="title">Usage at 80% for April</p>
					<p class="note">18% drop in cold starts. 3 new environments.</p>
				</div>
			</li>
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}
	.bar {
		display: grid;
		justify-items: end;
	}

	.trigger {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.bell {
		display: grid;
		place-items: center;
		color: var(--dry-color-text-strong);
	}
	.bell svg {
		display: block;
		block-size: 1em;
		aspect-ratio: 1;
	}

	.panel {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 45%, transparent);
		max-inline-size: 26em;
		justify-self: end;
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
		gap: var(--dry-space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
	}

	.item.unread {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 6%, transparent);
	}

	.dot {
		display: block;
		block-size: 0.55em;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-text-weak) 55%, transparent);
	}
	.dot[data-tone='info'] {
		background: var(--dry-color-fill-brand);
	}
	.dot[data-tone='warning'] {
		background: var(--dry-color-fill-warning);
	}

	.copy {
		display: grid;
		gap: 2px;
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	code {
		font-family: var(--dry-font-mono);
	}
</style>
