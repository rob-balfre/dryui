<script lang="ts">
	import { Badge, Glass, Text } from '@dryui/ui';
</script>

<div class="demo-shell">
	<div class="card-lane">
		<div class="glass-card">
			<Glass blur={22} tint="rgba(20, 24, 34, 0.34)" saturation={165}>
				<div class="glass-content">
					<div class="glass-meta">
						<Badge variant="outline" color="gray">Backdrop aware</Badge>
						<p class="glass-kicker">Static demonstration</p>
					</div>

					<div class="glass-copy">
						<h3 class="glass-title">Frosted glass effect</h3>
						<Text color="secondary">
							Blur, tint, and saturation only read clearly when the surface sits over layered
							color and detail.
						</Text>
					</div>

					<div class="signal-row" aria-hidden="true">
						<span class="signal signal-warm"></span>
						<span class="signal signal-cool"></span>
						<span class="signal signal-violet"></span>
					</div>
				</div>
			</Glass>
		</div>
	</div>
</div>

<style>
	.demo-shell {
		position: relative;
		overflow: hidden;
		container-type: inline-size;
		display: grid;
		align-items: center;
		padding: var(--dry-space-6);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: var(--dry-radius-xl);
		background:
			linear-gradient(
				145deg,
				color-mix(in srgb, var(--dry-color-bg-base) 82%, var(--dry-color-bg-overlay)),
				color-mix(in srgb, var(--dry-color-bg-overlay) 94%, transparent)
			);
		isolation: isolate;
	}

	.demo-shell::before {
		content: '';
		position: absolute;
		inset: -12%;
		background:
			radial-gradient(circle at 16% 18%, rgba(251, 146, 60, 0.62) 0, transparent 24%),
			radial-gradient(circle at 82% 22%, rgba(56, 189, 248, 0.58) 0, transparent 28%),
			radial-gradient(circle at 52% 78%, rgba(168, 85, 247, 0.42) 0, transparent 24%),
			repeating-linear-gradient(
				120deg,
				rgba(255, 255, 255, 0.08) 0 1rem,
				transparent 1rem 2.35rem
			);
		transform: scale(1.04);
	}

	.demo-shell::after {
		content: '';
		position: absolute;
		inset: 12%;
		border: 1px solid color-mix(in srgb, white 18%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.1);
		opacity: 0.2;
	}

	.card-lane {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 40rem);
	}

	.glass-card {
		overflow: hidden;
		border-radius: calc(var(--dry-radius-xl) * 1.05);
		border: 1px solid color-mix(in srgb, white 16%, transparent);
		box-shadow:
			0 22px 48px color-mix(in srgb, black 26%, transparent),
			inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
	}

	.glass-content,
	.glass-meta,
	.glass-copy,
	.signal-row {
		display: grid;
	}

	.glass-content {
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
	}

	.glass-meta {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.glass-copy {
		gap: var(--dry-space-2);
		grid-template-columns: minmax(0, 30rem);
	}

	.glass-kicker,
	.glass-title {
		margin: 0;
	}

	.glass-kicker {
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.glass-title {
		font-size: var(--dry-text-2xl-size);
		line-height: 1.05;
		color: var(--dry-color-text-strong);
	}

	.signal-row {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.signal {
		display: block;
		block-size: 0.9rem;
		border-radius: 999px;
		box-shadow: 0 0 0 1px color-mix(in srgb, white 10%, transparent);
	}

	.signal-warm {
		padding-inline: 2.25rem;
		background: linear-gradient(90deg, rgba(251, 146, 60, 0.88), rgba(244, 114, 182, 0.72));
	}

	.signal-cool {
		padding-inline: 1.5rem;
		background: linear-gradient(90deg, rgba(14, 165, 233, 0.88), rgba(34, 197, 94, 0.72));
	}

	.signal-violet {
		padding-inline: 1rem;
		background: linear-gradient(90deg, rgba(167, 139, 250, 0.9), rgba(59, 130, 246, 0.72));
	}

	@container (max-width: 44rem) {
		.card-lane,
		.glass-copy {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
