<script lang="ts">
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | number;
		class?: string;
	}

	let { size = 'md', class: className }: Props = $props();
</script>

<span
	data-thumbnail
	data-size={typeof size === 'string' ? size : undefined}
	class={className}
	use:applySizeVars={size}
>
	<Svg viewBox="0 0 120 80" aria-label="diagram thumbnail" width="100%" height="100%">
		<!-- Node 1 -->
		<rect
			x="10"
			y="8"
			width="40"
			height="16"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Node 2 -->
		<rect
			x="70"
			y="8"
			width="40"
			height="16"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Edge 1->2 -->
		<path
			d="M 50 16 C 55 16 65 16 70 16"
			stroke="var(--dry-color-stroke-strong)"
			stroke-width="1.5"
			fill="none"
			marker-end="url(#thumb-arrow)"
		/>
		<!-- Node 3 -->
		<rect
			x="10"
			y="50"
			width="40"
			height="16"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Node 4 -->
		<rect
			x="70"
			y="50"
			width="40"
			height="16"
			rx="4"
			fill="var(--dry-color-fill-success)"
			opacity="0.7"
		/>
		<!-- Edge 2->4 -->
		<path
			d="M 90 24 C 90 34 90 40 90 50"
			stroke="var(--dry-color-stroke-strong)"
			stroke-width="1.5"
			fill="none"
			marker-end="url(#thumb-arrow)"
		/>
		<!-- Edge 1->3 -->
		<path
			d="M 30 24 C 30 34 30 40 30 50"
			stroke="var(--dry-color-stroke-strong)"
			stroke-width="1.5"
			fill="none"
			marker-end="url(#thumb-arrow)"
		/>
		<!-- Edge 3->4 -->
		<path
			d="M 50 58 C 55 58 65 58 70 58"
			stroke="var(--dry-color-stroke-strong)"
			stroke-width="1.5"
			fill="none"
			marker-end="url(#thumb-arrow)"
		/>
		<!-- Cluster box -->
		<rect
			x="62"
			y="42"
			width="54"
			height="30"
			rx="6"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3 2"
		/>
		<!-- Arrow marker -->
		<defs>
			<marker
				id="thumb-arrow"
				viewBox="0 0 10 10"
				refX="10"
				refY="5"
				markerWidth="5"
				markerHeight="5"
				orient="auto-start-reverse"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--dry-color-stroke-strong)" />
			</marker>
		</defs>
	</Svg>
</span>

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
