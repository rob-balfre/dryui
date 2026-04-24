<script lang="ts">
	import { Avatar, Badge, Button, DropdownMenu } from '@dryui/ui';
</script>

<div class="stage">
	<div class="row">
		<Avatar size="md" fallback="MA" />
		<div class="who">
			<p class="name">Martina Alves</p>
			<p class="handle">martina@dryui.dev. Joined 14 Mar 2025</p>
		</div>
		<Badge variant="soft" size="sm">Admin</Badge>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="ghost" size="sm" aria-label="Actions for Martina Alves">...</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content placement="bottom-end">
				<DropdownMenu.Label>Member actions</DropdownMenu.Label>
				<DropdownMenu.Item>View profile</DropdownMenu.Item>
				<DropdownMenu.Item>Change role</DropdownMenu.Item>
				<DropdownMenu.Item>Reset 2FA</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Suspend account</DropdownMenu.Item>
				<DropdownMenu.Item>Remove from workspace</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<section class="menu" aria-label="Member actions menu preview">
		<p class="label">Member actions</p>
		<ul>
			<li class="item">View profile</li>
			<li class="item">Change role</li>
			<li class="item">Reset 2FA</li>
			<li class="sep" aria-hidden="true"></li>
			<li class="item">Suspend account</li>
			<li class="item danger">Remove from workspace</li>
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		gap: var(--dry-space-5);
		align-items: start;
	}

	.row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.who {
		display: grid;
		gap: 2px;
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

	.menu {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2);
		min-inline-size: 14em;
		border-radius: var(--dry-radius-md);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-shadow) 35%, transparent);
	}

	.label {
		margin: 0;
		padding: var(--dry-space-1) var(--dry-space-2);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	ul {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		padding: var(--dry-space-2);
		border-radius: var(--dry-radius-sm);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.item.danger {
		color: var(--dry-color-text-danger);
	}

	.sep {
		display: block;
		block-size: 1px;
		margin-block: var(--dry-space-1);
		background: color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
	}
</style>
