<script lang="ts">
	import { getHandTrackingContext } from '@dryui/hand-tracking';

	const context = getHandTrackingContext();
</script>

<div class="debug-info" aria-label="Hand tracking debug">
	<span>{context.debug.engine}</span>
	<span>{context.debug.stage}</span>
	<span>{context.debug.ready ? 'ready' : 'not ready'}</span>
	<span>{context.isTracking ? 'tracking' : 'off'}</span>
	<span>{context.debug.frameWidth}x{context.debug.frameHeight}</span>
	<span>hands: {context.debug.detectedHands}</span>
	<span>{context.debug.latencyMs.toFixed(1)}ms</span>
	<span>{Math.round(context.fps)} fps</span>
	{#if context.debug.error}
		<span class="error">{context.debug.error}</span>
	{/if}
</div>

<style>
	.debug-info {
		position: fixed;
		top: 0;
		right: 0;
		display: flex;
		gap: 6px;
		align-items: center;
		padding: 10px 12px;
		color: #666;
		font:
			500 11px ui-monospace,
			'SF Mono',
			Menlo,
			monospace;
		white-space: nowrap;
		z-index: 10;
		pointer-events: auto;
	}

	.debug-info span {
		padding: 2px 6px;
		background: #222;
		border-radius: 3px;
	}

	.error {
		color: #f66;
	}
</style>
