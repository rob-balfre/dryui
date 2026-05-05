<script lang="ts">
	import { FloatButton } from '@dryui/ui';
</script>

<div class="frame">
	<FloatButton.Root open>
		<FloatButton.Trigger aria-label="Actions">+</FloatButton.Trigger>
		<FloatButton.Action>Edit</FloatButton.Action>
		<FloatButton.Action>Share</FloatButton.Action>
		<FloatButton.Action>More</FloatButton.Action>
	</FloatButton.Root>
</div>

<style>
	.frame {
		--dry-fab-position: absolute;
		--dry-fab-offset: var(--dry-space-5);

		position: relative;
		min-height: 18rem;
		overflow: hidden;
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
	}
</style>
