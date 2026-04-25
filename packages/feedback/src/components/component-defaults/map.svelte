<script lang="ts">
	import { Map } from '@dryui/ui';
</script>

<Map.Root center={[-122.4194, 37.7749]} zoom={11}>
	<Map.Controls position="top-right" navigation />
	<Map.Marker position={[-122.4194, 37.7749]} color="var(--dry-color-fill-brand)" />
</Map.Root>
