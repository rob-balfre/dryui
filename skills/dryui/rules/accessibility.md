# Accessibility

## Field.Root for Form Inputs

Field.Root generates unique IDs and links Label to the input via `for`/`id` attributes. Always use it instead of raw `<label>` elements.

```svelte
<!-- Incorrect: label not linked to input -->
<label>Email</label>
<Input bind:value={email} />

<!-- Correct: Field.Root handles accessible linking -->
<Field.Root>
	<Label>Email</Label>
	<Input bind:value={email} />
</Field.Root>
```

Field.Root also connects Description and Error parts via `aria-describedby`:

```svelte
<Field.Root>
	<Label>Password</Label>
	<Input type="password" bind:value={password} />
	<Field.Description>Must be at least 8 characters.</Field.Description>
	<Field.Error>Password is too short.</Field.Error>
</Field.Root>
```

This produces the correct ARIA relationships automatically:

- Label is linked to the input via `for`/`id`
- Description is linked via `aria-describedby`
- Error is linked via `aria-describedby` and sets `aria-invalid` on the input

## Dialog and AlertDialog

### Dialog

Dialog traps focus inside the overlay. Always provide a title and a way to close.

```svelte
<!-- Incorrect: dialog without header or close mechanism -->
<Dialog.Root bind:open={show}>
	<Dialog.Content>
		<p>Some content</p>
	</Dialog.Content>
</Dialog.Root>

<!-- Correct: header provides accessible title, close button available -->
<Dialog.Root bind:open={show}>
	<Dialog.Trigger>
		<Button>Open</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Edit Profile</Dialog.Header>
		<Dialog.Body>
			<Field.Root>
				<Label>Name</Label>
				<Input bind:value={name} />
			</Field.Root>
		</Dialog.Body>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (show = false)}>Cancel</Button>
			<Button variant="solid">Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### AlertDialog

Use AlertDialog (not Dialog) for destructive confirmations. It requires explicit user action and cannot be dismissed by clicking the overlay.

```svelte
<!-- Incorrect: using Dialog for destructive confirmation -->
<Dialog.Root bind:open={showDelete}>
	<Dialog.Content>
		<p>Delete this item?</p>
		<Button onclick={handleDelete}>Delete</Button>
	</Dialog.Content>
</Dialog.Root>

<!-- Correct: AlertDialog with Action and Cancel parts -->
<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button variant="outline">Delete</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>Delete Item</AlertDialog.Header>
		<AlertDialog.Body>
			<p>This action cannot be undone.</p>
		</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

## Button vs Anchor

Use Button for actions. Use `<a>` for navigation.

```svelte
<!-- Incorrect: anchor styled as action button -->
<a href="#" onclick={handleSave}>Save</a>

<!-- Correct: Button for actions -->
<Button onclick={handleSave}>Save</Button>

<!-- Correct: anchor for navigation -->
<a href="/settings">Go to Settings</a>
```

## Icon-Only Buttons

Always add `aria-label` to buttons that contain only an icon and no visible text.

```svelte
<!-- Incorrect: icon button without accessible name -->
<Button variant="ghost" onclick={toggleMenu}>
	<MenuIcon />
</Button>

<!-- Correct: aria-label provides accessible name -->
<Button variant="ghost" onclick={toggleMenu} aria-label="Open menu">
	<MenuIcon />
</Button>
```

## Avatar

Always provide `alt` text for Avatar images.

```svelte
<!-- Incorrect: no alt text -->
<Avatar src="/photo.jpg" />

<!-- Correct: descriptive alt text -->
<Avatar src="/photo.jpg" alt="Jane Doe's profile photo" />
```

## Keyboard Navigation

DryUI components handle keyboard navigation automatically:

- **Tabs**: Arrow keys move between triggers, Enter/Space activates
- **Accordion**: Arrow keys navigate triggers, Enter/Space toggles
- **DropdownMenu**: Arrow keys navigate items, Enter selects, Escape closes
- **Select**: Arrow keys navigate items, Enter selects, Escape closes
- **Dialog/AlertDialog**: Tab cycles through focusable elements, Escape closes (Dialog only)

No extra code needed for standard keyboard behavior. Avoid overriding `onkeydown` on these components unless you have a specific accessibility need.

## Form Submission

Use `type="submit"` on the primary form action button so that pressing Enter in any input submits the form.

```svelte
<!-- Incorrect: button without type, won't submit on Enter -->
<form onsubmit={handleSubmit}>
	<Field.Root>
		<Label>Search</Label>
		<Input bind:value={query} />
	</Field.Root>
	<Button variant="solid" onclick={handleSubmit}>Search</Button>
</form>

<!-- Correct: type="submit" enables Enter key submission -->
<form onsubmit={handleSubmit}>
	<Field.Root>
		<Label>Search</Label>
		<Input bind:value={query} />
	</Field.Root>
	<Button type="submit" variant="solid">Search</Button>
</form>
```

## Loading States

Use `disabled` and descriptive text or `aria-label` during loading states.

```svelte
<!-- Incorrect: no indication of loading -->
<Button onclick={save}>
	{#if saving}
		<Spinner />
	{:else}
		Save
	{/if}
</Button>

<!-- Correct: disabled and labeled during loading -->
<Button onclick={save} disabled={saving} aria-label={saving ? 'Saving...' : undefined}>
	{#if saving}
		<Spinner /> Saving...
	{:else}
		Save
	{/if}
</Button>
```

## Checklist

Before shipping a page with DryUI components:

1. Every form input is wrapped in `Field.Root` with a `Label`
2. Every Dialog/AlertDialog has a header or `aria-label`
3. Every icon-only Button has `aria-label`
4. Destructive confirmations use `AlertDialog`, not `Dialog`
5. Primary form buttons use `type="submit"`
6. Avatar images have `alt` text
7. No `<a href="#">` used as action buttons
