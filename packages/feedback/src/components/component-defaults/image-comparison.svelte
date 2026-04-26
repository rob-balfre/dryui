<script lang="ts">
	import { ImageComparison } from '@dryui/ui';
</script>

<div style="inline-size: 320px; block-size: 200px;">
	<ImageComparison>
		{#snippet before()}
			<div
				style="display: grid; place-items: center; inline-size: 100%; block-size: 100%; background: hsl(220 14% 18%); color: hsl(220 10% 70%); font-size: 14px;"
			>
				Before
			</div>
		{/snippet}
		{#snippet after()}
			<div
				style="display: grid; place-items: center; inline-size: 100%; block-size: 100%; background: hsl(25 100% 55%); color: black; font-size: 14px;"
			>
				After
			</div>
		{/snippet}
	</ImageComparison>
</div>
