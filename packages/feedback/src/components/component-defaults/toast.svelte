<script lang="ts">
	import { Toast } from '@dryui/ui';
</script>

<Toast.Provider position="bottom-right">
	<Toast.Root id="toast-preview" variant="success">
		<Toast.Title>Deployed to production</Toast.Title>
		<Toast.Description>api-gateway. 42s. 3 services updated.</Toast.Description>
		<Toast.Close aria-label="Dismiss">
			<span aria-hidden="true">&times;</span>
		</Toast.Close>
	</Toast.Root>
</Toast.Provider>
