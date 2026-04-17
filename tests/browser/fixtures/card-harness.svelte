<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Card } from '../../../packages/ui/src/card/index.js';

	let { onButtonClick = () => {} }: { onButtonClick?: (event: MouseEvent) => void } = $props();
</script>

<div data-testid="default">
	<Card.Root>
		<Card.Header data-testid="default-header">Header</Card.Header>
		<Card.Content data-testid="default-content">Body copy</Card.Content>
		<Card.Footer data-testid="default-footer">Footer</Card.Footer>
	</Card.Root>
</div>

<div data-testid="variant">
	<Card.Root variant="elevated" size="sm">
		<Card.Content>Elevated</Card.Content>
	</Card.Root>
</div>

<div data-testid="selected">
	<Card.Root selected>
		<Card.Content>Selected</Card.Content>
	</Card.Root>
</div>

<div data-testid="horizontal">
	<Card.Root orientation="horizontal">
		<Card.Content>Horizontal</Card.Content>
	</Card.Root>
</div>

<div data-testid="button-card-wrap">
	<Card.Root as="button" onclick={onButtonClick}>
		<Card.Content>Clickable</Card.Content>
	</Card.Root>
</div>

<div data-testid="disabled-button-wrap">
	<Card.Root as="button" disabled onclick={onButtonClick}>
		<Card.Content>Disabled</Card.Content>
	</Card.Root>
</div>

<div data-testid="no-padding">
	<Card.Root>
		<Card.Content noPadding data-testid="no-padding-content">Flush</Card.Content>
	</Card.Root>
</div>
