<script lang="ts">
	interface Props {
		name: string;
		value: string;
		showValue?: boolean;
	}

	let { name, value, showValue = true }: Props = $props();

	import { bg } from '../actions';

	let label = $derived(name.replace(/^--dry-/, ''));
</script>

<div class="token-preview">
	<div class="swatch" use:bg={value}></div>
	<div class="token-info">
		<span class="token-name">{label}</span>
		{#if showValue}
			<span class="token-value">{value}</span>
		{/if}
	</div>
</div>

<style>
	.token-preview {
		display: grid;
		grid-template-columns: 2rem 1fr;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.swatch {
		aspect-ratio: 1;
		border-radius: var(--dry-radius-sm, 4px);
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.token-info {
		display: grid;
		gap: var(--dry-space-1);
	}

	.token-name {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-strong);
	}

	.token-value {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-type-xs-size, 0.7rem);
		color: var(--dry-color-text-weak);
	}
</style>
