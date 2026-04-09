<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';
	import { thumbnailMap } from './index.js';

	interface Props {
		name?: string;
		size?: 'sm' | 'md' | 'lg' | number;
		class?: string;
		children?: Snippet;
	}

	let { name, size = 'md', children, ...rest }: Props = $props();
</script>

{#if children}
	<span
		data-thumbnail
		data-size={typeof size === 'string' ? size : undefined}
		{...rest}
		use:applySizeVars={size}
	>
		{@render children()}
	</span>
{:else if name}
	{@const Component = thumbnailMap[name]}
	{#if Component}
		<Component {size} {...rest} />
	{/if}
{/if}

<style>
	[data-thumbnail] {
		display: inline-grid;
		width: var(--thumbnail-w, 80px);
		height: var(--thumbnail-h, 53px);
	}

	[data-thumbnail][data-size='sm'] {
		--thumbnail-w: 32px;
		--thumbnail-h: 21px;
	}
	[data-thumbnail][data-size='md'] {
		--thumbnail-w: 80px;
		--thumbnail-h: 53px;
	}
	[data-thumbnail][data-size='lg'] {
		--thumbnail-w: 160px;
		--thumbnail-h: 107px;
	}
</style>
