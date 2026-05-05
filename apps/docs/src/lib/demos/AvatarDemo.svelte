<script lang="ts">
	import { Avatar } from '@dryui/ui';
</script>

<div class="row">
	<Avatar fallback="JD" alt="Jane Doe" size="md" />
	<Avatar
		src="https://i.pravatar.cc/160?img=47"
		fallback="AM"
		alt="Avery Morales"
		size="lg"
		status="online"
	/>
	<Avatar
		src="https://i.pravatar.cc/160?img=68"
		fallback="JK"
		alt="Jules Kwon"
		size="lg"
		status="busy"
	/>
	<Avatar
		src="https://i.pravatar.cc/160?img=49"
		fallback="RT"
		alt="Rhea Tanaka"
		size="lg"
		status="away"
	/>
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
