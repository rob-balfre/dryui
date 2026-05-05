<script lang="ts">
	import { Sparkline } from '@dryui/ui';

	const data = [4, 7, 3, 9, 12, 6, 14, 8, 11, 15];
</script>

<Sparkline {data} width={160} height={40} filled highlightLast strokeWidth={1.5} />
