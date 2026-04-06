<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Badge, Card, Heading, Link, Text } from '@dryui/ui';

	interface BadgeItem {
		label: string;
		variant?: 'solid' | 'outline' | 'soft' | 'dot';
		color?: 'gray' | 'blue' | 'green' | 'orange';
		size?: 'sm' | 'md';
	}

	interface Props {
		title: string;
		description: string;
		href: string;
		linkLabel?: string;
		badges?: BadgeItem[];
		children?: Snippet;
	}

	let { title, description, href, linkLabel = 'Open', badges = [], children }: Props = $props();
</script>

<div class="link-card">
	<Card.Root>
		<Card.Header>
			<div class="card-header-content">
				<Heading level={3}>{title}</Heading>
				<Text color="secondary">{description}</Text>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="card-body">
				{#if badges.length > 0}
					<div class="card-badges">
						{#each badges as badge (`${badge.label}-${badge.variant ?? 'soft'}-${badge.color ?? 'gray'}`)}
							<Badge
								variant={badge.variant ?? 'soft'}
								color={badge.color ?? 'gray'}
								size={badge.size ?? 'sm'}
							>
								{badge.label}
							</Badge>
						{/each}
					</div>
				{/if}

				{@render children?.()}

				<Text as="span" weight="semibold">
					<Link {href} underline="always">{linkLabel}</Link>
				</Text>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.link-card {
		height: 100%;
	}

	.card-header-content {
		display: grid;
		gap: var(--dry-space-2);
	}

	.card-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.card-badges {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}
</style>
