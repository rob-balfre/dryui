<script lang="ts">
	import { Avatar, TypingIndicator, VisuallyHidden } from '@dryui/ui';
</script>

<div class="thread">
	<div class="msg msg-them">
		<Avatar size="sm" fallback="SA" />
		<div class="bubble">
			<p class="from">Sam, support</p>
			<p class="body">
				We can absolutely retry that webhook for you. One moment while I pull the delivery log.
			</p>
		</div>
	</div>

	<div class="msg msg-them">
		<Avatar size="sm" fallback="SA" />
		<div class="bubble bubble-typing" aria-live="polite">
			<TypingIndicator aria-label="Sam is typing" />
			<VisuallyHidden>Sam is typing.</VisuallyHidden>
		</div>
	</div>
</div>

<style>
	.thread {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 32%, transparent);
	}

	.msg {
		display: grid;
		grid-template-columns: max-content minmax(0, 32em);
		gap: var(--dry-space-3);
		align-items: start;
	}

	.bubble {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 78%, transparent);
	}

	.bubble-typing {
		padding: var(--dry-space-3) var(--dry-space-4);
	}

	.from {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		line-height: 1.55;
	}
</style>
