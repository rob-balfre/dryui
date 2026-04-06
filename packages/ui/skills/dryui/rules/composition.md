# Composition

## Layout Components

DryUI provides five layout primitives. Use them instead of manual CSS.

### Stack (vertical layout)

Stacks children vertically with consistent gap.

```svelte
<!-- Incorrect -->
<div style="display: flex; flex-direction: column; gap: 1rem;">
	<p>First</p>
	<p>Second</p>
</div>

<!-- Correct -->
<Stack gap="md">
	<p>First</p>
	<p>Second</p>
</Stack>
```

Gap values: `"sm"`, `"md"`, `"lg"`, `"xl"`

### Flex (horizontal layout)

Flexible row layout with alignment controls.

```svelte
<!-- Incorrect -->
<div style="display: flex; justify-content: space-between; align-items: center;">
	<span>Label</span>
	<Button>Action</Button>
</div>

<!-- Correct -->
<Flex justify="between" align="center">
	<span>Label</span>
	<Button>Action</Button>
</Flex>
```

Props: `gap`, `justify` (start, center, end, between, around, evenly), `align` (start, center, end, stretch, baseline), `wrap` (boolean)

### Grid (CSS grid)

Grid layout configured entirely via `--dry-grid-*` CSS custom properties.

```svelte
<!-- Incorrect -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
	<div>A</div>
	<div>B</div>
	<div>C</div>
</div>

<!-- Correct -->
<Grid --dry-grid-columns="repeat(3, 1fr)" --dry-grid-gap="var(--dry-space-6)">
	<div>A</div>
	<div>B</div>
	<div>C</div>
</Grid>
```

For 2D layouts with named areas, use Grid.Area:

```svelte
<Grid
	--dry-grid-areas="'header header' 'nav content'"
	--dry-grid-columns="16rem 1fr"
	--dry-grid-rows="auto 1fr"
	--dry-grid-gap="var(--dry-space-4)"
>
	<Grid.Area --dry-grid-area="header">...</Grid.Area>
	<Grid.Area --dry-grid-area="nav">...</Grid.Area>
	<Grid.Area --dry-grid-area="content">...</Grid.Area>
</Grid>
```

### Container (centered max-width)

Centers content with a max-width constraint.

```svelte
<!-- Incorrect -->
<div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
	<h1>Page Title</h1>
</div>

<!-- Correct -->
<Container>
	<h1>Page Title</h1>
</Container>
```

### Spacer (flexible space)

Fills available space between flex/stack items.

```svelte
<Flex align="center">
	<h2>Title</h2>
	<Spacer />
	<Button>Action</Button>
</Flex>
```

## Form Composition

### Basic form

Wrap each input in Field.Root, stack them vertically, and put everything in a Card.

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import { Card, Stack, Field, Label, Input, Button } from '@dryui/ui';

	let name = $state('');
	let email = $state('');
</script>

<Card.Root>
	<Card.Header>Contact Info</Card.Header>
	<Card.Content>
		<Stack gap="md">
			<Field.Root>
				<Label>Name</Label>
				<Input bind:value={name} />
			</Field.Root>
			<Field.Root>
				<Label>Email</Label>
				<Input type="email" bind:value={email} />
			</Field.Root>
			<Button type="submit" variant="solid">Save</Button>
		</Stack>
	</Card.Content>
</Card.Root>
```

### Form with validation

Use Field.Error to show validation messages.

```svelte
<script>
	let email = $state('');
	let error = $derived(email && !email.includes('@') ? 'Please enter a valid email' : '');
</script>

<Field.Root>
	<Label>Email</Label>
	<Input type="email" bind:value={email} />
	{#if error}
		<Field.Error>{error}</Field.Error>
	{/if}
</Field.Root>
```

### Form with multiple input types

```svelte
<script>
	let name = $state('');
	let bio = $state('');
	let country = $state('');
	let agreed = $state(false);
</script>

<Stack gap="md">
	<Field.Root>
		<Label>Name</Label>
		<Input bind:value={name} />
	</Field.Root>

	<Field.Root>
		<Label>Bio</Label>
		<Textarea bind:value={bio} />
	</Field.Root>

	<Field.Root>
		<Label>Country</Label>
		<Select.Root bind:value={country}>
			<Select.Trigger>
				<Select.Value placeholder="Select country..." />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="us">United States</Select.Item>
				<Select.Item value="uk">United Kingdom</Select.Item>
			</Select.Content>
		</Select.Root>
	</Field.Root>

	<Field.Root>
		<Flex align="center" gap="sm">
			<Checkbox bind:checked={agreed} />
			<Label>I agree to the terms</Label>
		</Flex>
	</Field.Root>

	<Button type="submit" variant="solid">Submit</Button>
</Stack>
```

## Page Patterns

### Page with sidebar

```svelte
<Flex gap="lg">
	<nav style="width: 240px;">
		<Stack gap="sm">
			<Button variant="ghost">Dashboard</Button>
			<Button variant="ghost">Settings</Button>
			<Button variant="ghost">Profile</Button>
		</Stack>
	</nav>
	<main style="flex: 1;">
		<Stack gap="lg">
			<h1>Dashboard</h1>
			<p>Main content here.</p>
		</Stack>
	</main>
</Flex>
```

### Card grid

```svelte
<Grid --dry-grid-columns="repeat(3, 1fr)" --dry-grid-gap="var(--dry-space-6)">
	{#each items as item (item.id)}
		<Card.Root>
			<Card.Header>{item.title}</Card.Header>
			<Card.Content>
				<p>{item.description}</p>
			</Card.Content>
			<Card.Footer>
				<Button variant="outline">View</Button>
			</Card.Footer>
		</Card.Root>
	{/each}
</Grid>
```

### Settings page with tabs

```svelte
<script>
	let activeTab = $state('general');
	let displayName = $state('');
</script>

<Container>
	<Stack gap="xl">
		<h1>Settings</h1>
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List>
				<Tabs.Trigger value="general">General</Tabs.Trigger>
				<Tabs.Trigger value="security">Security</Tabs.Trigger>
				<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="general">
				<Card.Root>
					<Card.Content>
						<Stack gap="md">
							<Field.Root>
								<Label>Display Name</Label>
								<Input bind:value={displayName} />
							</Field.Root>
							<Button variant="solid">Save</Button>
						</Stack>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
			<Tabs.Content value="security">
				<!-- Security settings -->
			</Tabs.Content>
		</Tabs.Root>
	</Stack>
</Container>
```

### Data table page

```svelte
<Container>
	<Stack gap="lg">
		<Flex justify="between" align="center">
			<h1>Users</h1>
			<Button variant="solid">Add User</Button>
		</Flex>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each users as user (user.id)}
					<Table.Row>
						<Table.Cell>{user.name}</Table.Cell>
						<Table.Cell>{user.email}</Table.Cell>
						<Table.Cell>
							<Badge variant="soft">{user.role}</Badge>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>
</Container>
```

## Anti-Patterns

### Nesting layout components unnecessarily

```svelte
<!-- Incorrect: redundant nesting -->
<Stack gap="md">
	<Stack gap="sm">
		<p>One item</p>
	</Stack>
</Stack>

<!-- Correct: flat when possible -->
<Stack gap="md">
	<p>One item</p>
</Stack>
```

### Using div wrappers instead of layout components

```svelte
<!-- Incorrect: manual div wrappers -->
<div class="flex items-center justify-between">
	<h2>Title</h2>
	<button>Action</button>
</div>

<!-- Correct: use DryUI layout -->
<Flex justify="between" align="center">
	<h2>Title</h2>
	<Button>Action</Button>
</Flex>
```

### Forgetting Card.Root in form layouts

```svelte
<!-- Incorrect: bare Card -->
<Card>
	<Card.Content>
		<Stack gap="md">...</Stack>
	</Card.Content>
</Card>

<!-- Correct: Card.Root -->
<Card.Root>
	<Card.Content>
		<Stack gap="md">...</Stack>
	</Card.Content>
</Card.Root>
```

## Component Selection Quick Reference

Before using any component, call `compose` to get the correct component and usage snippet. This table is a quick reference — `compose` has full snippets and anti-patterns.

| UI Need           | Use This                               | NOT This                                |
| ----------------- | -------------------------------------- | --------------------------------------- |
| Date picker       | `DatePicker.Root`                      | `<Input type="date">`                   |
| Date range        | `DateRangePicker.Root`                 | Two `<Input type="date">`               |
| Time input        | `TimeInput`                            | `<Input type="time">`                   |
| Dropdown select   | `Select.Root`                          | `<select>`                              |
| Searchable select | `Combobox.Root`                        | `<input>` + custom dropdown             |
| Modal dialog      | `Dialog.Root`                          | `<dialog>` or manual overlay            |
| Confirmation      | `AlertDialog.Root`                     | `window.confirm()`                      |
| Side panel        | `Drawer.Root`                          | Fixed-position div                      |
| Data table        | `Table.Root`                           | `<table>`                               |
| Person image      | `Avatar`                               | Emoji or bare `<img>`                   |
| Content image     | `Image`                                | Bare `<img>`                            |
| Multi-step flow   | `Stepper.Root`                         | Manual step divs                        |
| Progress bar      | `Progress`                             | CSS-only bar                            |
| Inline chart      | `Sparkline`                            | Manual SVG                              |
| Full chart        | `Chart.Root`                           | External chart library                  |
| Vertical layout   | `Stack`                                | `display: flex; flex-direction: column` |
| Horizontal layout | `Flex`                                 | `display: flex`                         |
| Grid layout       | `Grid`                                 | `display: grid`                         |
| Max-width wrapper | `Container`                            | `max-width` + `margin: 0 auto`          |
| Form field        | `Field.Root` + `Label` + Input         | `<label>` + `<input>`                   |
| Status indicator  | `Badge`                                | Colored `<span>`                        |
| Loading state     | `Skeleton` or `Spinner`                | Text "Loading..."                       |
| Empty state       | `EmptyState.Root`                      | Custom empty div                        |
| Notifications     | `Toast`                                | Alert div                               |
| Keyboard shortcut | `Kbd`                                  | `<code>`                                |
| Code display      | `CodeBlock`                            | `<pre><code>`                           |
| File upload       | `FileUpload.Root`                      | `<input type="file">`                   |
| Color picker      | `ColorPicker.Root`                     | `<input type="color">`                  |
| Collapsible       | `Accordion.Root` or `Collapsible.Root` | Manual toggle with if/else              |

## Composition Recipes

Call `compose` with any recipe name to get a full working snippet.

| Recipe                    | Description               | Key Components                         |
| ------------------------- | ------------------------- | -------------------------------------- |
| `search-form`             | Search bar with filters   | Input, DatePicker, Select, Button      |
| `data-table-with-actions` | Table with header actions | Table, Badge, Avatar, Button           |
| `checkout-flow`           | Multi-step checkout       | Stepper, Card, Field, RadioGroup       |
| `hotel-listing-card`      | Product/listing card      | Card, Image, Badge, Button, Text       |
| `stat-card-grid`          | KPI dashboard cards       | Grid, StatCard, Chart, Sparkline       |
| `settings-page`           | Settings with tabs        | Tabs, Card, Field, Input, Select       |
| `form-with-validation`    | Form with error handling  | Card, Field, Label, Input, Field.Error |
| `sidebar-layout`          | Page with sidebar nav     | Grid, Sidebar, PageHeader              |
| `dashboard-page`          | Full dashboard layout     | Grid, Sidebar, StatCard, Chart, Table  |
| `user-profile-card`       | User info card            | Card, Avatar, Text, Badge, Button      |
| `notification-list`       | Notification feed         | Stack, Card, Avatar, Text, Badge       |
| `command-bar`             | Command palette trigger   | CommandPalette, Hotkey                 |
| `file-upload-form`        | File upload with progress | Card, FileUpload, Progress, Button     |
| `pricing-table`           | Pricing comparison        | Grid, Card, Text, Button, Badge        |
