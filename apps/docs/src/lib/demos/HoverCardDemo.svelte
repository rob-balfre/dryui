<script lang="ts">
	import { Avatar, HoverCard } from '@dryui/ui';
</script>

<HoverCard.Root>
	<HoverCard.Trigger>
		<span class="trigger">Hover me</span>
	</HoverCard.Trigger>
	<HoverCard.Content>
		<div class="card">
			<Avatar size="md" fallback="JL" status="online" />
			<div>
				<p class="name">Jane Doe</p>
				<p class="handle">@jane</p>
			</div>
		</div>
	</HoverCard.Content>
</HoverCard.Root>

<style>
	.trigger {
		color: var(--dry-color-text-brand);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: default;
	}

	.card {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
		min-inline-size: 14em;
	}

	.name {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.handle {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
