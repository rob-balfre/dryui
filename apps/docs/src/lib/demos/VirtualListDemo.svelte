<script lang="ts">
	import { Badge, VirtualList } from '@dryui/ui';

	type Event = {
		id: number;
		actor: string;
		action: string;
		target: string;
		level: 'info' | 'warn' | 'error';
	};

	const actors: string[] = ['rianne', 'marco', 'priya', 'ada', 'kenji', 'deploy-bot', 'webhook'];
	const actions: string[] = [
		'updated',
		'created',
		'deleted',
		'invited',
		'rotated key on',
		'archived',
		'restored'
	];
	const targets: string[] = [
		'project/atlas',
		'secret/stripe',
		'user/fran',
		'env/staging',
		'role/admin',
		'token/cli'
	];
	const levels: Event['level'][] = ['info', 'info', 'info', 'info', 'warn', 'error'];

	const events: Event[] = Array.from({ length: 1000 }, (_, i) => ({
		id: i,
		actor: actors[i % actors.length]!,
		action: actions[i % actions.length]!,
		target: targets[i % targets.length]!,
		level: levels[i % levels.length]!
	}));

	const levelColor = { info: 'gray', warn: 'yellow', error: 'red' } as const;
</script>

<div class="log">
	<div class="log-head">
		<p class="eyebrow">Audit log</p>
		<p class="count">{events.length.toLocaleString()} events</p>
	</div>
	<div class="log-frame">
		<VirtualList items={events} itemHeight={44}>
			{#snippet children({ item, style })}
				<div class="row" {style}>
					<span class="id">#{String(item.id).padStart(5, '0')}</span>
					<Badge variant="soft" color={levelColor[item.level]} size="sm">{item.level}</Badge>
					<span class="actor">@{item.actor}</span>
					<span class="action">{item.action}</span>
					<span class="target">{item.target}</span>
				</div>
			{/snippet}
		</VirtualList>
	</div>
</div>

<style>
	.log {
		display: grid;
		gap: var(--dry-space-3);
	}

	.log-head {
		display: grid;
		grid-auto-flow: column;
		justify-content: space-between;
		align-items: end;
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

	.count {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.log-frame {
		block-size: 22rem;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.row {
		display: grid;
		grid-template-columns: max-content max-content max-content 1fr max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: 0 var(--dry-space-4);
		border-bottom: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 50%, transparent);
		font-size: var(--dry-text-sm-size);
	}

	.id,
	.actor,
	.target {
		font-family: var(--dry-font-mono);
	}

	.id {
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.actor,
	.target {
		color: var(--dry-color-text-strong);
	}

	.action {
		color: var(--dry-color-text-weak);
	}
</style>
