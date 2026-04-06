<script lang="ts">
	import { Spacer, Text } from '@dryui/ui';
</script>

<div class="demo">
	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="xs" />
	<div class="label"><Text size="xs" color="secondary">xs</Text></div>

	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="sm" />
	<div class="label"><Text size="xs" color="secondary">sm</Text></div>

	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="md" />
	<div class="label"><Text size="xs" color="secondary">md</Text></div>

	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="lg" />
	<div class="label"><Text size="xs" color="secondary">lg</Text></div>

	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="xl" />
	<div class="label"><Text size="xs" color="secondary">xl</Text></div>

	<div class="block"><Text size="sm" color="secondary">Content above</Text></div>
	<Spacer size="2xl" />
	<div class="label"><Text size="xs" color="secondary">2xl</Text></div>
</div>

<style>
	.demo {
		display: grid;
		gap: 0;
	}

	.block {
		background: var(--dry-color-bg-raised);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-sm);
	}

	.label {
		text-align: right;
	}
</style>
