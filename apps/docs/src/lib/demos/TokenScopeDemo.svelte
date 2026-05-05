<script lang="ts">
	import { Badge, Button, TokenScope } from '@dryui/ui';

	const scope = {
		'--dry-color-fill-brand': 'oklch(60% 0.16 152)',
		'--dry-color-fill-brand-hover': 'oklch(54% 0.16 152)',
		'--dry-color-text-brand': 'oklch(60% 0.16 152)',
		'--dry-color-stroke-brand': 'oklch(60% 0.16 152 / 0.5)'
	};
</script>

<div class="stack">
	<div class="row">
		<Button variant="solid">Default</Button>
		<Badge variant="solid">Default</Badge>
	</div>

	<TokenScope tokens={scope}>
		<div class="row">
			<Button variant="solid">Scoped</Button>
			<Badge variant="solid">Scoped</Badge>
		</div>
	</TokenScope>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}
</style>
