<script lang="ts">
	import { Badge } from '@dryui/ui/badge';
	import { contrastBetweenCssColors } from '../engine/derivation.js';

	interface Props {
		foreground: string;
		background: string;
		threshold?: number;
	}

	let { foreground, background, threshold = 4.5 }: Props = $props();

	let ratio = $derived(contrastBetweenCssColors(foreground, background));

	let passes = $derived(ratio !== null && ratio >= threshold);
	let ratioLabel = $derived(ratio !== null ? `${ratio.toFixed(1)}:1` : '---');
	let badgeColor = $derived<'success' | 'danger' | 'gray'>(
		ratio === null ? 'gray' : passes ? 'success' : 'danger'
	);
</script>

<Badge variant="soft" color={badgeColor} size="sm">{ratioLabel}</Badge>
