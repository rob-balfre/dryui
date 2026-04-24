<script lang="ts">
	import { CodeBlock } from '@dryui/ui';

	const svelteSnippet = `<script lang="ts">
	import { Button } from '@dryui/ui';
	let count = $state(0);
<\/script>

<Button onclick={() => count++}>Clicked {count}</Button>`;

	const curlSnippet = `curl -X POST https://api.dryui.dev/v1/themes \\
  -H "Authorization: Bearer $DRYUI_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"aurora","preset":"dark"}'`;

	const envSnippet = `# .env.local
DRYUI_TOKEN=dry_live_7a3f...
DRYUI_WORKSPACE=acme-prod
DRYUI_TELEMETRY=off`;
</script>

<div class="stack">
	<CodeBlock code={svelteSnippet} language="svelte" showLineNumbers />
	<CodeBlock code={curlSnippet} language="bash" />
	<CodeBlock code={envSnippet} language="ini" />
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
