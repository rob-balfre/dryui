<script lang="ts">
	import { Accordion } from '@dryui/ui';
</script>

<Accordion.Root>
	<Accordion.Item value="features">
		<Accordion.Trigger>Features</Accordion.Trigger>
		<Accordion.Content
			>Zero-dependency components built on native browser APIs with full keyboard navigation and
			ARIA support.</Accordion.Content
		>
	</Accordion.Item>
	<Accordion.Item value="theming">
		<Accordion.Trigger>Theming</Accordion.Trigger>
		<Accordion.Content
			>Semantic CSS custom properties with a two-tier token system for easy customisation across
			light and dark modes.</Accordion.Content
		>
	</Accordion.Item>
	<Accordion.Item value="accessibility">
		<Accordion.Trigger>Accessibility</Accordion.Trigger>
		<Accordion.Content
			>Every component follows WAI-ARIA patterns with proper roles, states, and keyboard
			interactions out of the box.</Accordion.Content
		>
	</Accordion.Item>
</Accordion.Root>
