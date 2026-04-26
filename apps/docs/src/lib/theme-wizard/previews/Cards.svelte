<script lang="ts">
	import { Avatar, Badge, Button, Card, Progress, Text } from '@dryui/ui';
	import { CircleCheck, ChevronRight, Sparkles, ShieldCheck, Bell, X } from 'lucide-svelte';
</script>

<div class="cards-grid">
	<Card.Root>
		<Card.Content>
			<div class="profile-card">
				<div class="profile-row">
					<Avatar fallback="MP" size="lg" />
					<div class="profile-meta">
						<Text as="span" weight="semibold">Maya Patel</Text>
						<Text size="sm" color="muted">Staff engineer · aurora team</Text>
					</div>
					<Badge variant="soft" color="success" size="sm">Online</Badge>
				</div>

				<div class="profile-stats">
					<div class="profile-stat">
						<Text size="xs" color="muted">Reviews</Text>
						<Text as="span" weight="semibold">128</Text>
					</div>
					<div class="profile-stat">
						<Text size="xs" color="muted">Merged</Text>
						<Text as="span" weight="semibold">94</Text>
					</div>
					<div class="profile-stat">
						<Text size="xs" color="muted">Shipped</Text>
						<Text as="span" weight="semibold">31</Text>
					</div>
				</div>

				<div class="card-actions">
					<Button variant="secondary" size="sm">Message</Button>
					<Button variant="solid" size="sm">View profile</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<div class="card-head-row">
				<div class="card-head">
					<Text as="span" weight="semibold">Pro plan</Text>
					<Text size="sm" color="muted">Renews 3 May 2026</Text>
				</div>
				<Badge variant="solid" color="blue" size="sm">$24/mo</Badge>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="stack">
				<div class="usage">
					<div class="usage-row">
						<Text size="sm">Builds</Text>
						<Text size="sm" color="muted">3,200 / 5,000</Text>
					</div>
					<Progress value={64} size="sm" />
				</div>
				<div class="usage">
					<div class="usage-row">
						<Text size="sm">Bandwidth</Text>
						<Text size="sm" color="muted">128 GB / 200 GB</Text>
					</div>
					<Progress value={64} size="sm" />
				</div>
				<div class="usage">
					<div class="usage-row">
						<Text size="sm">Seats</Text>
						<Text size="sm" color="muted">7 / 10</Text>
					</div>
					<Progress value={70} size="sm" />
				</div>

				<div class="divider"></div>

				<div class="card-head-row">
					<Text size="sm" color="muted">Auto-renew enabled</Text>
					<Button variant="ghost" size="sm">Manage</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content>
			<div class="dialog">
				<div class="dialog-icon" aria-hidden="true">
					<ShieldCheck size={20} />
				</div>
				<div class="dialog-body">
					<Text as="span" weight="semibold">Confirm domain ownership</Text>
					<Text size="sm" color="muted">
						We'll add a DNS TXT record to dryui.dev. The change is reversible at any time.
					</Text>
					<div class="card-actions">
						<Button variant="ghost" size="sm">Cancel</Button>
						<Button variant="solid" size="sm">Add record</Button>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root size="sm" variant="interactive" selected>
		<Card.Content>
			<div class="notice-row">
				<div class="notice-leading">
					<Sparkles size={16} aria-hidden="true" />
					<div class="notice-copy">
						<Text as="span" weight="medium">3 new feedback annotations</Text>
						<Text size="sm" color="muted">From the live preview review.</Text>
					</div>
				</div>
				<ChevronRight size={16} aria-hidden="true" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root size="sm">
		<Card.Content>
			<div class="toast">
				<CircleCheck size={16} aria-hidden="true" />
				<div class="toast-copy">
					<Text as="span" weight="medium">Theme saved as draft</Text>
					<Text size="sm" color="muted">You can publish anytime from the share menu.</Text>
				</div>
				<Button variant="ghost" size="icon-sm" aria-label="Dismiss">
					<X size={14} aria-hidden="true" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root size="sm">
		<Card.Content>
			<div class="toast" data-tone="warning">
				<Bell size={16} aria-hidden="true" />
				<div class="toast-copy">
					<Text as="span" weight="medium">Build queue is busy</Text>
					<Text size="sm" color="muted">Average wait 3 minutes.</Text>
				</div>
				<Button variant="ghost" size="icon-sm" aria-label="Dismiss">
					<X size={14} aria-hidden="true" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: var(--dry-space-3);
		container-type: inline-size;
	}

	.profile-card {
		display: grid;
		gap: var(--dry-space-3);
	}

	.profile-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.profile-meta {
		display: grid;
		gap: var(--dry-space-0_5);
	}

	.profile-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 60%, var(--dry-color-bg-raised));
	}

	.profile-stat {
		display: grid;
		gap: var(--dry-space-0_5);
	}

	.card-actions {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: end;
	}

	.card-head-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.card-head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.usage {
		display: grid;
		gap: var(--dry-space-1);
	}

	.usage-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.divider {
		block-size: 1px;
		background: var(--dry-color-stroke-weak);
	}

	.dialog {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: start;
	}

	.dialog-icon {
		display: inline-grid;
		grid-template-columns: 2.5rem;
		grid-template-rows: 2.5rem;
		place-items: center;
		border-radius: 50%;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 16%, var(--dry-color-bg-overlay));
		color: var(--dry-color-text-brand);
	}

	.dialog-body {
		display: grid;
		gap: var(--dry-space-2);
	}

	.notice-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.notice-leading {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-space-2_5);
		color: var(--dry-color-text-brand);
	}

	.notice-copy {
		display: grid;
		gap: var(--dry-space-0_5);
		color: var(--dry-color-text-strong);
	}

	.toast {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2_5);
		color: var(--dry-color-text-success);
	}

	.toast[data-tone='warning'] {
		color: var(--dry-color-text-warning);
	}

	.toast-copy {
		display: grid;
		gap: var(--dry-space-0_5);
		color: var(--dry-color-text-strong);
	}
</style>
