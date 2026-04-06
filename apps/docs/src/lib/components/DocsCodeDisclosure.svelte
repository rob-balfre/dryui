<script lang="ts">
	import { CodeBlock, Collapsible } from '@dryui/ui';

	interface Props {
		code: string;
		language?: string;
		label?: string;
		linkResolver?: (text: string, type: string) => string | undefined;
	}

	let { code, language = 'svelte', label = 'Show code', linkResolver }: Props = $props();
</script>

<Collapsible.Root>
	<div class="disclosure-trigger"><Collapsible.Trigger>{label}</Collapsible.Trigger></div>
	<Collapsible.Content>
		<div class="code-panel">
			<CodeBlock
				{code}
				{language}
				showCopyButton={true}
				{...linkResolver ? { linkResolver } : {}}
			/>
		</div>
	</Collapsible.Content>
</Collapsible.Root>

<!-- svelte-ignore css_unused_selector -->
<style>
	.disclosure-trigger {
		margin-bottom: var(--dry-space-3);
		background: var(--dry-color-bg-raised);
		color: var(--dry-color-text-weak);
		padding: var(--dry-space-2) var(--dry-space-3);
	}

	.code-panel {
		border-radius: var(--dry-radius-md);
		overflow: hidden;
	}
</style>
