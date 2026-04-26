<script lang="ts">
	import { RelativeTime } from '@dryui/ui';

	const moments = Date.now() - 1000 * 60 * 7;
</script>

<RelativeTime date={new Date(moments)} />
