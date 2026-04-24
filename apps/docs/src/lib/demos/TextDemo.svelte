<script lang="ts">
	import { Text } from '@dryui/ui';
</script>

<div class="stack">
	<Text as="p" size="lg" weight="semibold">
		The deploy pipeline now reports per-stage duration.
	</Text>
	<Text as="p" color="secondary" maxMeasure="default">
		Build, test, and upload stages each emit a span so regressions surface in the timeline before
		they reach production. Older runs are backfilled for the last 30 days.
	</Text>
	<Text as="p" color="muted" size="sm">
		Tracked as DRY-412. Rollout is gated behind the telemetry flag until next Tuesday.
	</Text>
	<Text as="span" font="mono" size="xs" color="muted">
		commit 8f21c3e written by ci@dryui.dev at 09:42 UTC
	</Text>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}
</style>
