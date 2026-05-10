# Composition

Use this file when choosing markup structure for a DryUI screen. The goal is simple markup, specific layout hooks, and route-level structure that lint can verify.

## Page Layout in `src/layout.css`

- Page and section layout uses `[data-layout]` and `[data-layout-area]` hooks in markup.
- Structural CSS lives in `src/layout.css`, scoped to `[data-layout='<name>']`.
- Visual CSS lives in app or component CSS, not in `src/layout.css`.
- DryUI ships no `Stack`, `Flex`, `Grid`, `Spacer`, or `Card` layout component. Use plain markup plus layout hooks.
- Every interior raw element needs either `data-layout="<specific-name>"` or `data-layout-area="<area>"`.
- Do not use generic names: `ui`, `wrapper`, `box`, `container`, `div`, `block`, `el`, `elem`, `element`, `layout`, `inner`, `outer`.
- No page-level grid/flex in component styles, no inline styles, no layout components.

## `src/layout.css`

Allowed property groups: `display`, grid properties, flex properties, container properties, `block-size`/`min-block-size`/`max-block-size`, tokenized spacing, and alignment.

Forbidden here: color, background, border, shadow, font, text styling, position, z-index, transform, animation, overflow, cursor, width, height, inline-size, and visual decoration.

Responsive layout is mobile-first. Use only `@container page (...)` for layout breakpoints.

Global app chrome such as `body { font-family: var(--dry-font-sans); }` belongs in `src/app.css`, not `src/layout.css`.

```css
[data-layout='split-page'] {
	display: grid;
	grid-template-areas: 'main' 'aside';
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-5);
}

[data-layout='split-page'] > [data-layout-area='main'] {
	grid-area: main;
	display: grid;
	gap: var(--dry-space-4);
}

[data-layout='split-page'] > [data-layout-area='aside'] {
	grid-area: aside;
}

@container page (min-width: 56rem) {
	[data-layout='split-page'] {
		grid-template-areas: 'main aside';
		grid-template-columns: minmax(0, 1fr) 18rem;
	}
}
```

## Markup Pattern

```svelte
<main data-layout="split-page">
	<section data-layout-area="main">
		<Heading>Customers</Heading>
		<Text>Accounts needing review.</Text>
	</section>

	<aside data-layout-area="aside">
		<Button variant="solid">New customer</Button>
	</aside>
</main>
```

Use `data-layout-area` only for children participating in named grid areas. Auto-flow grids and flex rows can use nested `data-layout` hooks instead.

## Forms

Wrap controls with `Field.Root`; do not pair raw `<label>` with raw inputs.

```svelte
<form data-layout="account-form" onsubmit={save}>
	<Field.Root>
		<Label>Email</Label>
		<Input bind:value={email} type="email" />
		<Field.Description>Used for billing notices.</Field.Description>
		<Field.Error>{emailError}</Field.Error>
	</Field.Root>

	<Button type="submit" variant="solid">Save</Button>
</form>
```

```css
[data-layout='account-form'] {
	display: grid;
	gap: var(--dry-space-4);
}
```

## Component Selection

| Need                | Use                              | Avoid                     |
| ------------------- | -------------------------------- | ------------------------- |
| Action              | `Button`                         | raw `<button>`            |
| Text field          | `Field.Root` + `Label` + `Input` | raw `<label>` + `<input>` |
| Select              | `Select.Root`                    | raw `<select>`            |
| Date                | `DatePicker`                     | `<input type="date">`     |
| Modal task          | `Dialog.Root`                    | raw `<dialog>`            |
| Destructive confirm | `AlertDialog.Root`               | `window.confirm()`        |
| Separator           | `Separator`                      | raw `<hr>`                |
| Data grid/table     | `Table` or `DataGrid`            | raw `<table>` in routes   |

## Anti-Patterns

- Putting route-level `display: grid` or `display: flex` in a component `<style>` block.
- Using inline `style=` or `style:` directives for layout.
- Adding `class=` to DryUI components to style internals.
- Shrinking `html` or `body` font-size to make the layout fit.
- Adding width or inline-size hacks instead of fixing grid tracks.
- Creating visual cards by default. If the product design wants panels, style app-owned wrappers deliberately.
