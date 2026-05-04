<script lang="ts">
	import { Breadcrumb } from '../../../packages/primitives/src/breadcrumb/index.js';
	import { Field } from '../../../packages/primitives/src/field/index.js';
	import { Input } from '../../../packages/primitives/src/input/index.js';
	import { Label } from '../../../packages/primitives/src/label/index.js';
	import { Link } from '../../../packages/primitives/src/link/index.js';
	import { NavigationMenu } from '../../../packages/primitives/src/navigation-menu/index.js';
	import { Toast } from '../../../packages/primitives/src/toast/index.js';

	interface Props {
		includeDescription?: boolean;
		includeError?: boolean;
	}

	let { includeDescription = false, includeError = false }: Props = $props();

	let clicks = $state(0);
</script>

<div data-testid="link-clicks">{clicks}</div>

<Link
	href="/settings"
	disabled
	data-testid="disabled-link"
	onclick={() => {
		clicks += 1;
	}}
>
	Settings
</Link>

<Field.Root error="Required field">
	<Label>Email</Label>
	<Input data-testid="field-input" />
	{#if includeDescription}
		<Field.Description data-testid="field-description">We will never share it.</Field.Description>
	{/if}
	{#if includeError}
		<Field.Error data-testid="field-error">Required field</Field.Error>
	{/if}
</Field.Root>

<NavigationMenu.Root>
	<NavigationMenu.List data-testid="navigation-list">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
			<NavigationMenu.Content>Panel</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>

<Breadcrumb.Link current data-testid="navbar-item">Home</Breadcrumb.Link>

<Toast.Root id="toast-info" variant="info" data-testid="toast-info">Saved</Toast.Root>
<Toast.Root id="toast-error" variant="error" data-testid="toast-error">Failed</Toast.Root>
