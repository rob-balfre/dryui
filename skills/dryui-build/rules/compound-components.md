# Compound Components

Use this file when selecting DryUI component APIs. Assume a component is compound until the component metadata, `index.ts`, or nearby usage proves otherwise.

## Core Rule

Compound components use `.Root` as their container. Parts must be nested under the matching root.

```svelte
<!-- Incorrect -->
<Dialog>Content</Dialog>

<!-- Correct -->
<Dialog.Root>
	<Dialog.Content>Content</Dialog.Content>
</Dialog.Root>
```

## Common Parts

Verify exact exports in `packages/ui/src/<component>/index.ts` when using an unfamiliar component.

| Component      | Common structure                                                             |
| -------------- | ---------------------------------------------------------------------------- |
| `Dialog`       | `Root`, `Trigger`, `Content`, `Header`, `Body`, `Footer`                     |
| `Drawer`       | `Root`, `Trigger`, `Content`, `Header`, `Body`, `Footer`                     |
| `AlertDialog`  | `Root`, `Trigger`, `Content`, `Header`, `Body`, `Footer`, `Cancel`, `Action` |
| `Tabs`         | `Root`, `List`, `Trigger`, `Content`                                         |
| `Accordion`    | `Root`, `Item`, `Trigger`, `Content`                                         |
| `DropdownMenu` | `Root`, `Trigger`, `Content`, `Item`, `Separator`                            |
| `Select`       | `Root`, `Trigger`, `Content`, `Item`, `Value`                                |
| `Field`        | `Root`, `Description`, `Error` with separate `Label` and input component     |
| `Table`        | `Root`, `Header`, `Body`, `Row`, `Head`, `Cell`                              |
| `Popover`      | `Root`, `Trigger`, `Content`                                                 |
| `Combobox`     | `Root`, `Input`, `List`, `Option`                                            |

## Examples

```svelte
<Tabs.Root value={tab} onValueChange={(next) => (tab = next)}>
	<Tabs.List>
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="billing">Billing</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="overview">Summary</Tabs.Content>
	<Tabs.Content value="billing">Invoices</Tabs.Content>
</Tabs.Root>
```

```svelte
<Select.Root bind:value={status}>
	<Select.Trigger>
		<Select.Value placeholder="Status" />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="open">Open</Select.Item>
		<Select.Item value="closed">Closed</Select.Item>
	</Select.Content>
</Select.Root>
```

```svelte
<Field.Root>
	<Label>Project</Label>
	<Input bind:value={projectName} />
	<Field.Description>Visible to teammates.</Field.Description>
</Field.Root>
```

## Mistakes

- Using the bare component name for a compound component.
- Rendering parts outside their root.
- Mixing parts from different components.
- Passing `class=` to style compound internals.
- Guessing `bind:value`, `bind:open`, or `bind:checked` without checking the component API.

## Full Compound Set

Accordion, AlertDialog, Breadcrumb, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DatePicker, Dialog, DragAndDrop, Drawer, DropdownMenu, EmptyState, Field, FileUpload, FloatButton, Pagination, Popover, RadioGroup, RichTextEditor, Select, Splitter, Stepper, Table, Tabs, TagsInput, Toast, ToggleGroup, Toolbar, Tooltip, Tour, Transfer.
