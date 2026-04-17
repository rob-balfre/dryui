<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Button } from '../../../packages/ui/src/button/index.js';

	let {
		onDefaultClick = () => {},
		onDisabledClick = () => {}
	}: {
		onDefaultClick?: (event: MouseEvent) => void;
		onDisabledClick?: (event: MouseEvent) => void;
	} = $props();
</script>

<div data-testid="default">
	<Button onclick={onDefaultClick}>Click me</Button>
</div>

<div data-testid="ghost-lg-danger">
	<Button variant="ghost" size="lg" color="danger">Delete</Button>
</div>

<div data-testid="disabled">
	<Button disabled onclick={onDisabledClick}>Submit</Button>
</div>

<div data-testid="link">
	<Button href="https://example.com">Go</Button>
</div>

<div data-testid="disabled-link">
	<Button href="https://example.com" disabled>Go</Button>
</div>

<div data-testid="icon-aria">
	<Button size="icon" aria-label="Close panel">X</Button>
</div>

<div data-testid="icon-sm-text">
	<Button size="icon-sm">Save</Button>
</div>

<div data-testid="toggle-pressed">
	<Button variant="toggle" aria-pressed="true">Grid</Button>
</div>
