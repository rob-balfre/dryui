<script lang="ts">
	import { Toast } from '@dryui/ui';
</script>

<Toast.Root id="demo-toast" variant="success">
	<div class="toast-copy">
		<Toast.Title>Changes saved</Toast.Title>
		<Toast.Description>Your settings have been updated.</Toast.Description>
	</div>
	<Toast.Close>&times;</Toast.Close>
</Toast.Root>

<style>
	.toast-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-1);
	}
</style>
