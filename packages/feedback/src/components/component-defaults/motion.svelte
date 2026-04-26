<script lang="ts">
	import * as Motion from '@dryui/ui/motion';
</script>

<div style="display: grid; gap: 6px; padding: 8px;">
	{#each ['Drift', 'Settle', 'Reveal'] as label, i}
		<Motion.Enter index={i}>
			<span
				style="display: inline-grid; padding: 4px 10px; border-radius: 999px; background: hsl(220 14% 18%); color: hsl(220 10% 92%); font-size: 12px;"
			>
				{label}
			</span>
		</Motion.Enter>
	{/each}
</div>
