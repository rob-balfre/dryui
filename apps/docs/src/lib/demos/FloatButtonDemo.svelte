<script>
	import { FloatButton } from '@dryui/ui';
</script>

<div class="preview-frame">
	<div class="preview-copy">
		<p>Keep the primary action pinned while related actions expand from the same corner.</p>
		<p>The docs preview contains the button inside this surface so it does not bleed into the page.</p>
	</div>

	<FloatButton.Root>
		<FloatButton.Trigger>+</FloatButton.Trigger>
		<FloatButton.Action>New item</FloatButton.Action>
	</FloatButton.Root>
</div>

<style>
	.preview-frame {
		--dry-fab-position: absolute;
		--dry-fab-offset: var(--dry-space-4);

		position: relative;
		min-height: 14rem;
		overflow: hidden;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
		padding: var(--dry-space-4);
	}

	.preview-copy {
		display: grid;
		gap: var(--dry-space-3);
		padding-right: var(--dry-space-16);
	}

	p {
		margin: 0;
		line-height: 1.6;
	}
</style>
