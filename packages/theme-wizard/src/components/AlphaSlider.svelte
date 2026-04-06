<script lang="ts">
	import { AlphaSlider } from '@dryui/ui/alpha-slider';

	interface Props {
		value?: number;
		color?: string;
		onchange?: (value: number) => void;
	}

	let { value = $bindable(50), color = 'hsl(230, 65%, 55%)', onchange }: Props = $props();
</script>

<AlphaSlider bind:value {color} {...(onchange ? { onchange } : {})} />
