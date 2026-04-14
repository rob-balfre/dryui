<script lang="ts">
	import { Badge, FlipCard, Heading, Kbd, Text } from '@dryui/ui';
</script>

<div class="demo-shell">
	<div class="flip-card">
		<FlipCard.Root trigger="hover">
			<FlipCard.Front>
				<div class="face-card face-front">
					<div class="face-hero face-hero-front">
						<div class="face-topline">
							<Badge variant="soft">Front face</Badge>
							<Text as="span" size="sm" color="secondary">Member pass preview</Text>
						</div>

						<div class="face-copy">
							<Heading level={4}>Studio Pass</Heading>
							<Text color="secondary">
								A proper front face with hierarchy, metadata, and a visible card surface.
							</Text>
						</div>

						<div class="hero-panel">
							<Text as="span" size="xs" color="secondary" variant="label">Tier</Text>
							<Heading level={4}>Gold</Heading>
							<Text as="span" size="sm" color="secondary">Renews on 28 Apr</Text>
						</div>
					</div>

					<div class="face-content face-content-front">
						<div class="stat-grid">
							<div class="stat stat-highlight">
								<Text as="span" size="xs" color="secondary" variant="label">Status</Text>
								<Text as="span" weight="semibold">Active</Text>
							</div>

							<div class="stat">
								<Text as="span" size="xs" color="secondary" variant="label">Visits</Text>
								<Text as="span" weight="semibold">24 available</Text>
							</div>

							<div class="stat">
								<Text as="span" size="xs" color="secondary" variant="label">Bonus</Text>
								<Text as="span" weight="semibold">Guest pass</Text>
							</div>
						</div>

						<div class="summary-row">
							<div class="summary-chip">
								<Text as="span" size="xs" color="secondary" variant="label">Entry</Text>
								<Text as="span" weight="medium">Priority check-in</Text>
							</div>

							<div class="summary-chip">
								<Text as="span" size="xs" color="secondary" variant="label">Access</Text>
								<Text as="span" weight="medium">All studio classes</Text>
							</div>
						</div>
					</div>

					<div class="face-footer">
						<div class="footer-row">
							<Text as="span" size="sm" color="secondary">Flip trigger</Text>
							<Kbd>Hover</Kbd>
						</div>
					</div>
				</div>
			</FlipCard.Front>

			<FlipCard.Back>
				<div class="face-card face-back">
					<div class="face-hero">
						<div class="face-topline">
							<Badge variant="soft">Back face</Badge>
							<Text as="span" size="sm" color="secondary">Hidden details</Text>
						</div>

						<div class="face-copy">
							<Heading level={4}>Included Perks</Heading>
							<Text color="secondary">
								The reverse side now reads like the back of a real card instead of a text row.
							</Text>
						</div>
					</div>

					<div class="face-content">
						<div class="detail-list">
							<div class="detail-item">
								<Text as="span" size="xs" color="secondary" variant="label">Access</Text>
								<Text as="span" weight="medium">Priority studio check-in</Text>
							</div>

							<div class="detail-item">
								<Text as="span" size="xs" color="secondary" variant="label">Bonus</Text>
								<Text as="span" weight="medium">One guest pass each month</Text>
							</div>

							<div class="detail-item">
								<Text as="span" size="xs" color="secondary" variant="label">Support</Text>
								<Text as="span" weight="medium">Concierge setup on arrival</Text>
							</div>

							<div class="detail-item detail-item-wide">
								<Text as="span" size="xs" color="secondary" variant="label">Notes</Text>
								<Text as="span" weight="medium">
									Bring one guest each month and skip the standby queue during peak sessions.
								</Text>
							</div>
						</div>
					</div>

					<div class="face-footer">
						<div class="footer-row">
							<Text as="span" size="sm" color="secondary">Direction</Text>
							<Text as="span" weight="semibold">Horizontal flip</Text>
						</div>
					</div>
				</div>
			</FlipCard.Back>
		</FlipCard.Root>
	</div>
</div>

<style>
	.demo-shell {
		display: grid;
		grid-template-columns: minmax(0, 40rem);
	}

	.flip-card {
		--dry-flip-card-duration: 700ms;

		min-block-size: 22rem;
	}

	.face-card {
		--demo-panel-bg: var(--dry-color-fill);
		--demo-panel-border: var(--dry-color-stroke-weak);

		display: grid;
		container-type: inline-size;
		min-block-size: 22rem;
		grid-template-rows: auto 1fr auto;
		gap: var(--dry-space-5);
		padding: var(--dry-space-6);
		background: var(--dry-card-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-card-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-2xl);
		box-shadow: var(--dry-shadow-raised);
	}

	.face-front {
		--dry-card-bg: var(--dry-color-bg-overlay);
		--dry-card-border: var(--dry-color-stroke-weak);
	}

	.face-back {
		--dry-card-bg: var(--dry-color-fill-brand-weak);
		--dry-card-border: var(--dry-color-stroke-brand-weak);
		--demo-panel-bg: var(--dry-color-bg-base);
		--demo-panel-border: var(--dry-color-stroke-brand-weak);
	}

	.face-hero {
		display: grid;
		gap: var(--dry-space-4);
	}

	.face-hero-front {
		align-items: start;
	}

	.face-topline {
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.face-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.face-content,
	.face-footer {
		display: grid;
	}

	.hero-panel {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		background: var(--dry-color-fill);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
	}

	.face-content-front {
		gap: var(--dry-space-4);
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-3);
		align-items: start;
	}

	.detail-list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-3);
	}

	.stat,
	.detail-item {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3);
		background: var(--demo-panel-bg);
		border: 1px solid var(--demo-panel-border);
		border-radius: var(--dry-radius-xl);
	}

	.stat-highlight {
		background: var(--dry-color-fill-brand-weak);
		border-color: var(--dry-color-stroke-brand-weak);
	}

	.summary-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-3);
	}

	.summary-chip {
		display: grid;
		gap: var(--dry-space-1);
		padding-block: var(--dry-space-3);
		padding-inline: var(--dry-space-4);
		background: var(--dry-color-fill-weaker);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
	}

	.footer-row {
		display: grid;
		grid-template-columns: 1fr max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	@container (min-width: 30rem) {
		.face-hero-front {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.9fr);
			align-items: start;
		}

		.face-hero-front .face-topline,
		.face-hero-front .face-copy {
			grid-column: 1;
		}

		.face-hero-front .hero-panel {
			grid-column: 2;
			grid-row: 1 / span 2;
			align-self: start;
		}

		.stat-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.summary-row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.detail-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.detail-item-wide {
			grid-column: 1 / -1;
		}
	}
</style>
