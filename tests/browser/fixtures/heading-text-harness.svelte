<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Heading } from '../../../packages/ui/src/heading/index.js';
	import { Text } from '../../../packages/ui/src/text/index.js';
</script>

<!-- ── Heading: all maxMeasure values ────────────────────────────────────── -->

<div data-testid="heading-narrow">
	<Heading level={1} variant="display" maxMeasure="narrow">Inference is all you need.</Heading>
</div>

<div data-testid="heading-default">
	<Heading level={2} maxMeasure="default">
		A slightly wider headline that should wrap around the default measure.
	</Heading>
</div>

<div data-testid="heading-wide">
	<Heading level={2} maxMeasure="wide">Widest headline preset for long titles.</Heading>
</div>

<div data-testid="heading-uncapped">
	<Heading level={2}>Default Heading without maxMeasure.</Heading>
</div>

<div data-testid="heading-explicit-false">
	<Heading level={2} maxMeasure={false}>Explicit opt-out.</Heading>
</div>

<!-- ── Text: all maxMeasure values ───────────────────────────────────────── -->

<div data-testid="text-narrow">
	<Text maxMeasure="narrow">Body copy constrained to the narrow measure.</Text>
</div>

<div data-testid="text-default">
	<Text maxMeasure="default">Body copy at the default measure.</Text>
</div>

<div data-testid="text-wide">
	<Text maxMeasure="wide">Body copy at the wide measure.</Text>
</div>

<div data-testid="text-uncapped">
	<Text>Body copy without maxMeasure.</Text>
</div>
