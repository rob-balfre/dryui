<script lang="ts">
	import { HandTracking, type GestureEvent } from '@dryui/hand-tracking';
	import { Badge, Button, Card, Separator, Switch } from '@dryui/ui';

	interface Props {
		enabled: boolean;
		calibrationStep: number;
		onToggleEnabled: () => void;
		onAdvanceCalibration: () => void;
		onGesture?: (event: GestureEvent) => void;
	}

	let { enabled, calibrationStep, onToggleEnabled, onAdvanceCalibration, onGesture }: Props =
		$props();

	const steps = ['Place hand in frame', 'Sample lighting', 'Validate tracking', 'Save profile'];
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">Webcam</Badge>
					<h2>Hand tracking</h2>
				</div>
				<p>Toggle live mode and walk through a short calibration pass.</p>
			</Card.Header>
		</div>

		<div class="panel-body">
			<Card.Content>
				<div class="toggle-row">
					<Switch checked={enabled} onclick={onToggleEnabled} />
					<span>{enabled ? 'Live tracking enabled' : 'Camera offline'}</span>
				</div>

				{#if enabled}
					<HandTracking.Root
						class="hand-tracking-stage"
						autoStart={true}
						showCalibrator={false}
						showVideo={true}
						overlayWidth={320}
						overlayHeight={240}
						{...onGesture ? { ongesture: onGesture } : {}}
					/>
				{:else}
					<div class="camera-frame" aria-label="Webcam preview">
						<div class="camera-glow"></div>
						<div class="camera-copy">
							<Badge variant="solid" color="gray">idle</Badge>
							<strong>Calibrate to start</strong>
							<span>Gesture hints appear here once the camera is active.</span>
						</div>
					</div>
				{/if}

				<Separator />

				<div class="step-stack">
					{#each steps as step, index (step)}
						<div class={`step ${calibrationStep >= index ? 'active' : ''}`}>
							<span class="step-index">{index + 1}</span>
							<span>{step}</span>
						</div>
					{/each}
				</div>

				<Button type="button" variant="solid" onclick={onAdvanceCalibration}
					>Advance calibration</Button
				>
			</Card.Content>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2 {
		margin: 0;
	}

	.panel-header p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.camera-frame {
		position: relative;
		min-height: 184px;
		border-radius: var(--dry-radius-xl);
		border: 1px solid var(--dry-color-border);
		overflow: hidden;
		background:
			radial-gradient(
				circle at 50% 45%,
				color-mix(in srgb, var(--dry-color-primary) 24%, transparent),
				transparent 40%
			),
			linear-gradient(160deg, var(--dry-color-surface-raised), var(--dry-color-surface));
		display: grid;
		place-items: center;
	}

	.camera-glow {
		position: absolute;
		inset: 18%;
		border-radius: 999px;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--dry-color-primary) 38%, transparent),
			transparent 70%
		);
		filter: blur(8px);
	}

	.camera-copy {
		position: relative;
		z-index: 1;
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
		text-align: center;
		max-width: 18rem;
	}

	.hand-tracking-stage {
		position: relative;
		overflow: hidden;
		min-height: 184px;
		border-radius: var(--dry-radius-xl);
		border: 1px solid var(--dry-color-border);
		background: var(--dry-color-surface-raised);
	}

	.hand-tracking-stage video {
		display: block;
		width: 100%;
		min-height: 184px;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.hand-tracking-stage canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.camera-copy strong {
		font-size: var(--dry-text-lg-size);
	}

	.camera-copy span {
		color: var(--dry-color-text-muted);
	}

	.step-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.step {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		border: 1px solid transparent;
		color: var(--dry-color-text-muted);
	}

	.step.active {
		color: var(--dry-color-text);
		border-color: var(--dry-color-border);
		background: var(--dry-color-surface-raised);
	}

	.step-index {
		display: inline-grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-primary) 22%, transparent);
	}
</style>
