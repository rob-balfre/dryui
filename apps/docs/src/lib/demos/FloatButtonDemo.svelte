<script lang="ts">
	import { FloatButton } from '@dryui/ui';
</script>

<div class="frame">
	<div class="copy">
		<p class="eyebrow">Inbox</p>
		<p class="title">42 unread threads</p>
		<p class="note">
			The compose action stays pinned to the corner while the conversation list scrolls behind it.
		</p>
	</div>

	<FloatButton.Root>
		<FloatButton.Trigger>+</FloatButton.Trigger>
		<FloatButton.Action>New thread</FloatButton.Action>
		<FloatButton.Action>Invite teammate</FloatButton.Action>
		<FloatButton.Action>Schedule message</FloatButton.Action>
	</FloatButton.Root>
</div>

<style>
	.frame {
		--dry-fab-position: absolute;
		--dry-fab-offset: var(--dry-space-5);

		position: relative;
		min-height: 18rem;
		overflow: hidden;
		display: grid;
		padding: var(--dry-space-5);
		border-radius: var(--dry-radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 58%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 72%, transparent)
		);
	}

	.copy {
		display: grid;
		gap: var(--dry-space-1);
		padding-inline-end: var(--dry-space-16);
		max-inline-size: 42ch;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
