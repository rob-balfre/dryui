<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Accordion } from '../../../packages/ui/src/accordion/index.js';
</script>

<Accordion.Root>
	<Accordion.Item value="features">
		<Accordion.Trigger>Features</Accordion.Trigger>
		<Accordion.Content>
			Zero-dependency components built on native browser APIs with full keyboard navigation and
			ARIA support.
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="theming">
		<Accordion.Trigger>Theming</Accordion.Trigger>
		<Accordion.Content>
			Semantic CSS custom properties with a two-tier token system for easy customisation across
			light and dark modes.
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
