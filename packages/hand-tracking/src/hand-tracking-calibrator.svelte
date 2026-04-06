<script lang="ts">
	import { getHandTrackingContext } from './context.svelte.js';

	interface Props {
		class?: string;
		title?: string;
	}

	let { class: className, title = 'Hand calibration' }: Props = $props();
	const context = getHandTrackingContext();
	let status = $state<'idle' | 'running' | 'complete'>('idle');

	async function beginCalibration(): Promise<void> {
		status = 'running';
		try {
			await context.start();
			status = 'complete';
		} catch {
			status = 'idle';
		}
	}
</script>

<section class={className} aria-label={title}>
	<header>
		<strong>{title}</strong>
	</header>
	<p>{context.isCalibrated ? 'Calibration ready' : 'Calibration required'}</p>
	<button type="button" onclick={beginCalibration} disabled={status === 'running'}>
		{status === 'running' ? 'Starting...' : 'Start calibration'}
	</button>
</section>
