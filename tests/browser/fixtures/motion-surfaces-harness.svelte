<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Aurora } from '../../../packages/ui/src/aurora/index.js';
	import { Marquee } from '../../../packages/ui/src/marquee/index.js';
	import { Noise } from '../../../packages/ui/src/noise/index.js';
	import { Reveal } from '../../../packages/ui/src/reveal/index.js';
	import { Spotlight } from '../../../packages/ui/src/spotlight/index.js';

	type MotionKind = 'reveal' | 'spotlight' | 'aurora' | 'noise' | 'marquee';

	let { kind }: { kind: MotionKind } = $props();
</script>

{#if kind === 'reveal'}
	<Reveal data-testid="reveal" once={false} variant="slide-up">
		<div>Reveal content</div>
	</Reveal>
{:else if kind === 'spotlight'}
	<Spotlight data-testid="spotlight" intensity={0.55}>
		<div>Spotlight content</div>
	</Spotlight>
{:else if kind === 'aurora'}
	<Aurora data-testid="aurora" palette={['#020617', '#2563eb', '#14b8a6']} speed={0.8}>
		<div>Aurora content</div>
	</Aurora>
{:else if kind === 'marquee'}
	<Marquee data-testid="marquee" speed={50} pauseOnHover>
		<span>Item A</span>
		<span>Item B</span>
		<span>Item C</span>
	</Marquee>
{:else}
	<Noise data-testid="noise" opacity={0.12} blend="overlay" animated grain="fine">
		<div>Noise content</div>
	</Noise>
{/if}
