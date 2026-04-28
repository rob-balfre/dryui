<script lang="ts">
	import { Badge, ChromaticAberration, Text } from '@dryui/ui';

	const bars = [
		{ tone: 'ok', key: 'b1' },
		{ tone: 'ok', key: 'b2' },
		{ tone: 'ok', key: 'b3' },
		{ tone: 'ok', key: 'b4' },
		{ tone: 'err', key: 'b5' },
		{ tone: 'err', key: 'b6' },
		{ tone: 'err', key: 'b7' },
		{ tone: 'err', key: 'b8' }
	] as const;
</script>

<div class="stage">
	<div class="meta">
		<Badge variant="soft" color="danger">Major outage</Badge>
		<span class="timestamp">04:17 UTC · us-east-1</span>
	</div>

	<ChromaticAberration offset={3} angle={18}>
		<h3 class="title">Checkout API unreachable</h3>
	</ChromaticAberration>

	<Text color="secondary" size="sm">
		Channel-offset glitch dramatises an incident headline without moving the underlying text. Ideal
		for status pages and postmortem covers.
	</Text>

	<div class="trace">
		<p class="trace-label">Last 5 minutes</p>
		<div class="trace-bars" aria-hidden="true">
			{#each bars as bar, i (bar.key)}
				<span class="bar" data-tone={bar.tone} data-step={i}></span>
			{/each}
		</div>
	</div>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-fill-error) 10%, var(--dry-color-bg-base)),
			color-mix(in srgb, var(--dry-color-bg-base) 94%, var(--dry-color-fill-error))
		);
	}

	.meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.timestamp {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.04em;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: clamp(1.85rem, 3.6vw, 2.75rem);
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: var(--dry-color-text-strong);
	}

	.trace {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 64%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 58%, transparent);
	}

	.trace-label {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.trace-bars {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		align-items: end;
		gap: var(--dry-space-1);
		block-size: 3rem;
	}

	.bar {
		display: block;
		border-radius: 2px;
	}

	.bar[data-tone='ok'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-fill-success) 72%, transparent),
			color-mix(in srgb, var(--dry-color-fill-success) 24%, transparent)
		);
	}

	.bar[data-tone='err'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-fill-error) 82%, transparent),
			color-mix(in srgb, var(--dry-color-fill-error) 30%, transparent)
		);
	}

	.bar[data-step='0'] {
		block-size: 28%;
	}
	.bar[data-step='1'] {
		block-size: 34%;
	}
	.bar[data-step='2'] {
		block-size: 22%;
	}
	.bar[data-step='3'] {
		block-size: 18%;
	}
	.bar[data-step='4'] {
		block-size: 90%;
	}
	.bar[data-step='5'] {
		block-size: 96%;
	}
	.bar[data-step='6'] {
		block-size: 88%;
	}
	.bar[data-step='7'] {
		block-size: 92%;
	}
</style>
