<script lang="ts">
	import { Chart } from '@dryui/ui';

	const mrr = [
		{ label: 'Nov', value: 94200 },
		{ label: 'Dec', value: 101800 },
		{ label: 'Jan', value: 108400 },
		{ label: 'Feb', value: 112600 },
		{ label: 'Mar', value: 118900 },
		{ label: 'Apr', value: 128465 }
	];

	const latency = [
		{ label: '00:00', value: 142 },
		{ label: '04:00', value: 138 },
		{ label: '08:00', value: 156 },
		{ label: '12:00', value: 214 },
		{ label: '16:00', value: 198 },
		{ label: '20:00', value: 164 },
		{ label: '24:00', value: 148 }
	];
</script>

<div class="panels">
	<section class="panel">
		<header class="heading">
			<div>
				<p class="eyebrow">Revenue</p>
				<p class="title">Monthly recurring revenue</p>
			</div>
			<p class="stat">$128,465</p>
		</header>
		<Chart.Root
			data={mrr}
			width={480}
			height={180}
			summary="MRR grew from $94.2K in November to $128.5K in April"
		>
			<Chart.Bars radius={4} />
			<Chart.XAxis />
			<Chart.YAxis ticks={4} />
		</Chart.Root>
	</section>

	<section class="panel">
		<header class="heading">
			<div>
				<p class="eyebrow">p95 latency</p>
				<p class="title">Edge response time, today</p>
			</div>
			<p class="stat">164ms</p>
		</header>
		<Chart.Root
			data={latency}
			width={480}
			height={180}
			summary="p95 latency peaked at 214ms between 12:00 and 16:00"
		>
			<Chart.Area strokeWidth={2} showDots />
			<Chart.XAxis />
			<Chart.YAxis ticks={4} />
		</Chart.Root>
	</section>
</div>

<style>
	.panels {
		display: grid;
		gap: var(--dry-space-4);
		container-type: inline-size;
	}

	.panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 52%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 68%, transparent)
		);
	}

	.heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: baseline;
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
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.stat {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xl-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	@container (min-width: 48rem) {
		.panels {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
