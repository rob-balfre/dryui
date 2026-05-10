# Accessibility

Use this file when building forms, dialogs, controls, tables, loading states, or icon-only interactions with DryUI.

## Fields

Every form control gets `Field.Root` and `Label`. `Field.Root` wires IDs, `aria-describedby`, errors, and descriptions.

```svelte
<Field.Root>
	<Label>Email</Label>
	<Input bind:value={email} type="email" />
	<Field.Description>Used for account notices.</Field.Description>
	<Field.Error>{emailError}</Field.Error>
</Field.Root>
```

Do not use raw `<label>` with raw `<input>` in route markup.

## Buttons and Links

- Use `Button` for actions.
- Use `<a>` for navigation.
- Add `aria-label` to every icon-only button.
- Use `type="submit"` on the primary form action.
- Use `aria-disabled` only when an element cannot be truly disabled; otherwise use the real disabled state.

```svelte
<Button variant="ghost" aria-label="Open menu" onclick={openMenu}>
	<MenuIcon />
</Button>
```

## Dialogs

Use `Dialog.Root` for modal tasks and `AlertDialog.Root` for destructive confirmation.

```svelte
<Dialog.Root bind:open={editing}>
	<Dialog.Trigger>
		<Button>Edit profile</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Edit profile</Dialog.Header>
		<Dialog.Body>
			<Field.Root>
				<Label>Name</Label>
				<Input bind:value={name} />
			</Field.Root>
		</Dialog.Body>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (editing = false)}>Cancel</Button>
			<Button type="submit" variant="solid">Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

Destructive actions need explicit cancel/action affordances:

```svelte
<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button variant="outline">Delete</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>Delete customer?</AlertDialog.Header>
		<AlertDialog.Body>This cannot be undone.</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

## Keyboard Behavior

DryUI handles standard keyboard behavior for compound widgets such as Tabs, Accordion, DropdownMenu, Select, Dialog, and AlertDialog. Do not override keyboard handlers unless the product interaction requires it and the replacement is fully accessible.

## Loading and Async States

- Keep the triggering control in place while work runs.
- Set disabled or busy state on controls that cannot be used during the operation.
- Use status text or a progress component for operations that last long enough to need feedback.
- Do not rely on color alone for error, warning, or success state.

## Images and Avatars

- Provide meaningful `alt` text for informative avatars or images.
- Use empty alt text only for decorative images.
- Do not use initials-only avatars when the design or data provides profile imagery.

## Checklist

1. Inputs use `Field.Root` and `Label`.
2. Destructive confirmation uses `AlertDialog`, not `Dialog`.
3. Dialog content has a header or accessible name.
4. Icon-only buttons have accessible names.
5. Form submit buttons use `type="submit"`.
6. Disabled, busy, error, and empty states are visible and announced where needed.
