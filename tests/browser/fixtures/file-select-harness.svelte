<script lang="ts">
	import { FileSelect } from '../../../packages/ui/src/file-select/index.js';

	let value = $state<string | null>(null);
	let requestCount = $state(0);
	let disabled = $state(false);
	let mockResult = $state<string | null>('/Users/test/project');
	let { useRequest = true, directory = true }: { useRequest?: boolean; directory?: boolean } =
		$props();

	async function onrequest(): Promise<string | null> {
		requestCount++;
		return mockResult;
	}
</script>

<div>
	<FileSelect.Root bind:value onrequest={useRequest ? onrequest : undefined} {disabled} {directory}>
		<FileSelect.Trigger data-testid="trigger">Choose folder</FileSelect.Trigger>
		<FileSelect.Value data-testid="value" placeholder="No folder selected" />
		<FileSelect.Clear data-testid="clear" />
	</FileSelect.Root>

	<output data-testid="value-output">{value ?? 'null'}</output>
	<output data-testid="request-count">{requestCount}</output>

	<button data-testid="set-disabled" onclick={() => (disabled = !disabled)}>Toggle disabled</button>
	<button data-testid="set-null-result" onclick={() => (mockResult = null)}>Set null result</button>
</div>
