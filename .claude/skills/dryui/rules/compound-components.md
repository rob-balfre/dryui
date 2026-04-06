# Compound Components

## Core Rule

Every compound component uses `.Root` as the container. Never use the bare name.

```svelte
<!-- Incorrect -->
<Card>...</Card>
<Dialog>...</Dialog>
<Tabs>...</Tabs>

<!-- Correct -->
<Card.Root>...</Card.Root>
<Dialog.Root>...</Dialog.Root>
<Tabs.Root>...</Tabs.Root>
```

## Parts Reference

Below are the parts for the most commonly used compound components. Always run `bunx @dryui/cli info <name>` for the full, up-to-date parts list.

### Card

Parts: Root, Header, Content, Footer

```svelte
<Card.Root>
	<Card.Header>Title</Card.Header>
	<Card.Content>
		<p>Body content goes here.</p>
	</Card.Content>
	<Card.Footer>
		<Button variant="solid">Action</Button>
	</Card.Footer>
</Card.Root>
```

### Dialog

Parts: Root, Trigger, Content, Overlay, Header, Body, Footer, Close

```svelte
<script>
	let showDialog = $state(false);
</script>

<Dialog.Root bind:open={showDialog}>
	<Dialog.Trigger>
		<Button>Open Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Confirm Action</Dialog.Header>
		<Dialog.Body>
			<p>Are you sure you want to proceed?</p>
		</Dialog.Body>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDialog = false)}>Cancel</Button>
			<Button variant="solid">Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### Drawer

Parts: Root, Trigger, Content, Overlay, Header, Body, Footer, Close

Same structure as Dialog but slides in from the side.

```svelte
<script>
	let showDrawer = $state(false);
</script>

<Drawer.Root bind:open={showDrawer}>
	<Drawer.Trigger>
		<Button>Open Drawer</Button>
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>Settings</Drawer.Header>
		<Drawer.Body>
			<p>Drawer content here.</p>
		</Drawer.Body>
		<Drawer.Footer>
			<Button variant="solid">Save</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

### Tabs

Parts: Root, List, Trigger, Content

Use `bind:value` on Root to track the active tab.

```svelte
<script>
	let activeTab = $state('one');
</script>

<Tabs.Root bind:value={activeTab}>
	<Tabs.List>
		<Tabs.Trigger value="one">Tab 1</Tabs.Trigger>
		<Tabs.Trigger value="two">Tab 2</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="one">First panel</Tabs.Content>
	<Tabs.Content value="two">Second panel</Tabs.Content>
</Tabs.Root>
```

### Accordion

Parts: Root, Item, Trigger, Content

```svelte
<Accordion.Root>
	<Accordion.Item value="a">
		<Accordion.Trigger>Section A</Accordion.Trigger>
		<Accordion.Content>Content for section A.</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="b">
		<Accordion.Trigger>Section B</Accordion.Trigger>
		<Accordion.Content>Content for section B.</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

### AlertDialog

Parts: Root, Trigger, Content, Overlay, Header, Body, Footer, Action, Cancel

Use AlertDialog for destructive confirmations. It traps focus and requires explicit user action.

```svelte
<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button variant="outline">Delete Account</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>Are you sure?</AlertDialog.Header>
		<AlertDialog.Body>
			<p>This action cannot be undone.</p>
		</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>
				<Button variant="outline">Cancel</Button>
			</AlertDialog.Cancel>
			<AlertDialog.Action>
				<Button variant="solid">Delete</Button>
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

### DropdownMenu

Parts: Root, Trigger, Content, Item, Separator, Group, Label

```svelte
<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline">Options</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={handleEdit}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleDuplicate}>Duplicate</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={handleDelete}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

### Select

Parts: Root, Trigger, Content, Item, Value

```svelte
<script>
	let selected = $state('');
</script>

<Select.Root bind:value={selected}>
	<Select.Trigger>
		<Select.Value placeholder="Choose..." />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="a">Alpha</Select.Item>
		<Select.Item value="b">Beta</Select.Item>
		<Select.Item value="c">Gamma</Select.Item>
	</Select.Content>
</Select.Root>
```

### Field

Parts: Root, Description, Error

Field.Root wraps a Label and input component. The Label and input (Input, Select, Textarea, etc.) are direct children, not Field parts.

```svelte
<Field.Root>
	<Label>Username</Label>
	<Input bind:value={username} />
	<Field.Description>Choose a unique username.</Field.Description>
	<Field.Error>Username is already taken.</Field.Error>
</Field.Root>
```

### Table

Parts: Root, Header, Body, Footer, Row, Head, Cell, Caption

```svelte
<Table.Root>
	<Table.Caption>User list</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Name</Table.Head>
			<Table.Head>Email</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each users as user (user.id)}
			<Table.Row>
				<Table.Cell>{user.name}</Table.Cell>
				<Table.Cell>{user.email}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
```

### Popover

Parts: Root, Trigger, Content

```svelte
<Popover.Root>
	<Popover.Trigger>
		<Button variant="ghost">Info</Button>
	</Popover.Trigger>
	<Popover.Content>
		<p>Additional details here.</p>
	</Popover.Content>
</Popover.Root>
```

### Combobox

Parts: Root, Input, Content, Item, Empty

```svelte
<script>
	let query = $state('');
</script>

<Combobox.Root bind:value={query}>
	<Combobox.Input placeholder="Search..." />
	<Combobox.Content>
		<Combobox.Item value="apple" index={0}>Apple</Combobox.Item>
		<Combobox.Item value="banana" index={1}>Banana</Combobox.Item>
		<Combobox.Empty>No results found.</Combobox.Empty>
	</Combobox.Content>
</Combobox.Root>
```

## Common Mistakes

### Using bare compound name

```svelte
<!-- Incorrect: bare name -->
<Tabs>...</Tabs>
<Select>...</Select>

<!-- Correct: always .Root -->
<Tabs.Root>...</Tabs.Root>
<Select.Root>...</Select.Root>
```

### Orphaned parts without Root

```svelte
<!-- Incorrect: parts without their Root wrapper -->
<Card.Header>Title</Card.Header>
<Card.Content>Body</Card.Content>

<!-- Correct: parts inside Root -->
<Card.Root>
	<Card.Header>Title</Card.Header>
	<Card.Content>Body</Card.Content>
</Card.Root>
```

### Mixing parts from different components

```svelte
<!-- Incorrect: Dialog.Header inside Drawer -->
<Drawer.Root>
	<Dialog.Header>Title</Dialog.Header>
</Drawer.Root>

<!-- Correct: use matching parts -->
<Drawer.Root>
	<Drawer.Header>Title</Drawer.Header>
</Drawer.Root>
```

## Full Compound Component List

Run `bunx @dryui/cli info <name>` for any component's complete parts list:

Accordion, Alert, AlertDialog, Breadcrumb, Card, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DatePicker, Dialog, DragAndDrop, Drawer, DropdownMenu, EmptyState, Field, FileUpload, FloatButton, Pagination, Popover, RadioGroup, RichTextEditor, Select, Splitter, Stepper, Table, Tabs, TagsInput, Toast, ToggleGroup, Toolbar, Tooltip, Tour, Transfer
