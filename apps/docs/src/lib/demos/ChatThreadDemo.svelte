<script lang="ts">
	import { Avatar } from '@dryui/ui/avatar';
	import { Badge } from '@dryui/ui/badge';
	import { ChatThread } from '@dryui/ui/chat-thread';

	type Msg = { role: 'customer' | 'support'; name: string; body: string; time: string };

	const messages: Msg[] = [
		{
			role: 'customer',
			name: 'Fran K.',
			body: 'Our production deploy has been queued for 18 minutes. Workspace: acme-prod.',
			time: '09:02'
		},
		{
			role: 'support',
			name: 'Marco',
			body: 'Taking a look. Can you share the build id from the banner?',
			time: '09:03'
		},
		{
			role: 'customer',
			name: 'Fran K.',
			body: 'build_4a19c2f. The staging deploy 10 minutes earlier went through fine.',
			time: '09:04'
		},
		{
			role: 'support',
			name: 'Marco',
			body: 'Found it. The us-east runner pool is saturated. I am draining a stuck worker now.',
			time: '09:06'
		},
		{
			role: 'support',
			name: 'Marco',
			body: 'Your build just picked up. Should finish in ~2 minutes. I will leave this ticket open until you confirm.',
			time: '09:08'
		}
	];
</script>

<ChatThread messageCount={messages.length}>
	{#snippet children({ index })}
		{@const msg = messages[index]}
		{#if msg}
			<div class="msg" data-role={msg.role}>
				<Avatar size="sm" fallback={msg.name[0]} />
				<div class="body">
					<div class="head">
						<span class="name">{msg.name}</span>
						{#if msg.role === 'support'}
							<Badge variant="soft" color="blue" size="sm">Support</Badge>
						{/if}
						<span class="time">{msg.time}</span>
					</div>
					<p class="text">{msg.body}</p>
				</div>
			</div>
		{/if}
	{/snippet}
</ChatThread>

<style>
	.msg {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) 0;
	}

	.body {
		display: grid;
		gap: var(--dry-space-1);
	}

	.head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.name {
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.time {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.text {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		line-height: 1.55;
		color: var(--dry-color-text-strong);
		max-inline-size: 60ch;
	}
</style>
