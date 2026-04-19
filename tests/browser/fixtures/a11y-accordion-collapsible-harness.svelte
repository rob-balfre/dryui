<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Accordion as PrimitiveAccordion } from '../../../packages/primitives/src/accordion/index.js';
	import { Collapsible as PrimitiveCollapsible } from '../../../packages/primitives/src/collapsible/index.js';
	import { Accordion } from '../../../packages/ui/src/accordion/index.js';
	import { Collapsible } from '../../../packages/ui/src/collapsible/index.js';
</script>

<Accordion.Root>
	<Accordion.Item value="ui-overview">
		<Accordion.Trigger data-testid="ui-accordion-trigger">UI Overview</Accordion.Trigger>
		<Accordion.Content data-testid="ui-accordion-content">
			UI accordion content
			<button type="button">Nested action</button>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

<PrimitiveAccordion.Root>
	<PrimitiveAccordion.Item value="primitive-overview">
		<PrimitiveAccordion.Trigger data-testid="primitive-accordion-trigger">
			Primitive Overview
		</PrimitiveAccordion.Trigger>
		<PrimitiveAccordion.Content data-testid="primitive-accordion-content">
			Primitive accordion content
			<button type="button">Nested action</button>
		</PrimitiveAccordion.Content>
	</PrimitiveAccordion.Item>
</PrimitiveAccordion.Root>

<Collapsible.Root>
	<Collapsible.Trigger data-testid="ui-collapsible-trigger">UI Details</Collapsible.Trigger>
	<Collapsible.Content data-testid="ui-collapsible-content">
		UI collapsible content
		<button type="button">Nested action</button>
	</Collapsible.Content>
</Collapsible.Root>

<PrimitiveCollapsible.Root>
	<PrimitiveCollapsible.Trigger data-testid="primitive-collapsible-trigger">
		Primitive Details
	</PrimitiveCollapsible.Trigger>
	<PrimitiveCollapsible.Content data-testid="primitive-collapsible-content">
		Primitive collapsible content
		<button type="button">Nested action</button>
	</PrimitiveCollapsible.Content>
</PrimitiveCollapsible.Root>
