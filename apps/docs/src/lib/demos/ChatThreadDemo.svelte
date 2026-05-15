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

	const startsGroup = (i: number) => i === 0 || messages[i - 1]?.role !== messages[i]?.role;
	const endsGroup = (i: number) =>
		i === messages.length - 1 || messages[i + 1]?.role !== messages[i]?.role;
</script>

<ChatThread messageCount={messages.length}>
	{#snippet children({ index })}
		{@const msg = messages[index]}
		{@const first = startsGroup(index)}
		{@const last = endsGroup(index)}
		{#if msg}
			<div class="row" data-role={msg.role} data-first={first} data-last={last}>
				<div class="gutter">
					{#if msg.role === 'support' && first}
						<Avatar size="sm" fallback={msg.name[0]} />
					{/if}
				</div>
				<div class="stack">
					{#if first}
						<div class="head">
							<span class="name">{msg.name}</span>
							{#if msg.role === 'support'}
								<Badge variant="soft" color="blue" size="sm">Support</Badge>
							{/if}
						</div>
					{/if}
					<div class="bubble">
						<p class="text">{msg.body}</p>
					</div>
					{#if last}
						<span class="time">{msg.time}</span>
					{/if}
				</div>
			</div>
		{/if}
	{/snippet}
</ChatThread>

<style>
	.row {
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: end;
	}

	.row[data-role='customer'] {
		grid-template-columns: minmax(0, 1fr) 32px;
	}

	.row[data-role='customer'] .gutter {
		order: 2;
	}

	.row[data-role='customer'] .stack {
		order: 1;
		justify-items: end;
	}

	.gutter {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		block-size: 100%;
	}

	.stack {
		display: grid;
		gap: var(--dry-space-1);
		justify-items: start;
		min-inline-size: 0;
	}

	.head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-inline: var(--dry-space-1);
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
		padding-inline: var(--dry-space-1);
	}

	.bubble {
		max-inline-size: 60ch;
		padding: var(--dry-space-2) var(--dry-space-3);
		background: var(--dry-color-fill);
		border-radius: var(--dry-radius-3, 12px);
		border-end-start-radius: var(--dry-radius-3, 12px);
	}

	.row[data-role='support'] .bubble {
		border-end-start-radius: var(--dry-radius-1, 4px);
	}

	.row[data-role='customer'] .bubble {
		background: var(--dry-color-fill-accent);
		border-end-end-radius: var(--dry-radius-1, 4px);
	}

	.row[data-role='customer'] .text {
		color: var(--dry-color-on-accent);
	}

	.text {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		line-height: 1.55;
		color: var(--dry-color-text-strong);
		word-wrap: break-word;
	}

	.row[data-first='false'] {
		margin-block-start: calc(var(--dry-space-2) * -1);
	}
</style>
