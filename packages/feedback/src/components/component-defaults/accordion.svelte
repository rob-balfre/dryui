<script lang="ts">
	import { Accordion } from '@dryui/ui';
</script>

<Accordion.Root type="single">
	<Accordion.Item value="one">
		<Accordion.Trigger>What is DryUI?</Accordion.Trigger>
		<Accordion.Content>
			A zero-dependency Svelte 5 component library focused on theming and accessibility.
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="two">
		<Accordion.Trigger>How do I install it?</Accordion.Trigger>
		<Accordion.Content>Run bunx @dryui/cli init in a Svelte project.</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
