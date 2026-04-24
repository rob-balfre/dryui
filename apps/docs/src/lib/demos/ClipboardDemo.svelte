<script lang="ts">
	import { Button, Clipboard } from '@dryui/ui';

	const apiKey = 'dry_live_79k2v4NmPqXtR8WxZcBfLh3Y1A6Gj5Kd';
	const envBlock = `DRY_API_KEY=${apiKey}
DRY_PROJECT=dryui-studio
DRY_REGION=us-east-1`;
</script>

<div class="stack">
	<div class="row">
		<div class="context">
			<p class="eyebrow">Project key</p>
			<p class="code-inline">{apiKey}</p>
		</div>
		<Clipboard value={apiKey}>
			{#snippet children({ copied, copy })}
				<Button variant="outline" onclick={copy}>{copied ? 'Copied' : 'Copy key'}</Button>
			{/snippet}
		</Clipboard>
	</div>

	<div class="block">
		<div class="block-head">
			<p class="eyebrow">.env</p>
			<Clipboard value={envBlock}>
				{#snippet children({ copied, copy })}
					<Button variant="ghost" size="sm" onclick={copy}
						>{copied ? 'Copied' : 'Copy block'}</Button
					>
				{/snippet}
			</Clipboard>
		</div>
		<pre class="code-block">{envBlock}</pre>
	</div>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 32%, transparent);
	}

	.context,
	.block {
		display: grid;
		gap: var(--dry-space-2);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.code-inline {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		overflow-wrap: anywhere;
	}

	.block-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.code-block {
		margin: 0;
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 32%, transparent);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		white-space: pre;
		overflow: auto;
	}
</style>
