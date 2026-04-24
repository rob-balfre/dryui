<script lang="ts">
	import { RadioGroup, Field, Label } from '@dryui/ui';

	let target = $state('preview');
</script>

<div class="panel">
	<Field.Root>
		<Label>Deploy target</Label>
		<RadioGroup.Root bind:value={target} name="deploy-target">
			<RadioGroup.Item value="production">Production (api.dryui.dev)</RadioGroup.Item>
			<RadioGroup.Item value="preview">Preview (pr-284.dryui.dev)</RadioGroup.Item>
			<RadioGroup.Item value="staging">Staging (staging.dryui.dev)</RadioGroup.Item>
			<RadioGroup.Item value="local" disabled>Local only (requires tunnel)</RadioGroup.Item>
		</RadioGroup.Root>
	</Field.Root>
	<p class="note">Selected: {target}. Deploys trigger the <code>build</code> workflow.</p>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
