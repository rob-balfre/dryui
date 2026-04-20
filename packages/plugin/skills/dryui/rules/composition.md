# Composition

## Layout with CSS Grid

All layout uses raw `display: grid` in scoped `<style>` blocks with `--dry-space-*` tokens. No flexbox, no inline styles, no layout components (Stack, Flex, Grid, Spacer).

### Vertical stack

```svelte
<div class="stack">
	<p>First</p>
	<p>Second</p>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

### Horizontal row

```svelte
<div class="row">
	<span>Label</span>
	<Button>Action</Button>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
```

### Responsive columns with @container

```svelte
<div class="grid-container">
	<div class="grid">
		<div>A</div>
		<div>B</div>
		<div>C</div>
	</div>
</div>

<style>
	.grid-container {
		container-type: inline-size;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--dry-space-6);
	}
	@container (min-width: 40rem) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
```

### Centered max-width content

Use `Container` (simple component, no `.Root`) for constrained content width:

```svelte
<Container>
	<h1>Page Title</h1>
</Container>
```

## Form Composition

### Basic form

Wrap each input in Field.Root, stack them with grid, put everything in a Card.

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import { Card, Field, Label, Input, Button } from '@dryui/ui';

	let name = $state('');
	let email = $state('');
</script>

<Card.Root>
	<Card.Header>Contact Info</Card.Header>
	<Card.Content>
		<form class="form-stack">
			<Field.Root>
				<Label>Name</Label>
				<Input bind:value={name} />
			</Field.Root>
			<Field.Root>
				<Label>Email</Label>
				<Input type="email" bind:value={email} />
			</Field.Root>
			<Button type="submit" variant="solid">Save contact</Button>
		</form>
	</Card.Content>
</Card.Root>

<style>
	.form-stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
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

<form class="form-stack">
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
		<div class="checkbox-row">
			<Checkbox bind:checked={agreed} />
			<Label>I agree to the terms</Label>
		</div>
	</Field.Root>

	<Button type="submit" variant="solid">Submit form</Button>
</form>

<style>
	.form-stack {
		display: grid;
		gap: var(--dry-space-4);
	}
	.checkbox-row {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
```

## Page Patterns

### Page with sidebar

```svelte
<div class="page-with-sidebar">
	<nav class="sidebar">
		<Button variant="ghost">Dashboard</Button>
		<Button variant="ghost">Settings</Button>
		<Button variant="ghost">Profile</Button>
	</nav>
	<main class="content">
		<h1>Dashboard</h1>
		<p>Main content here.</p>
	</main>
</div>

<style>
	.page-with-sidebar {
		display: grid;
		grid-template-columns: 15rem 1fr;
		gap: var(--dry-space-6);
	}
	.sidebar {
		display: grid;
		gap: var(--dry-space-2);
		align-content: start;
	}
	.content {
		display: grid;
		gap: var(--dry-space-6);
		align-content: start;
	}
</style>
```

### Card grid

```svelte
<div class="card-grid-container">
	<div class="card-grid">
		{#each items as item (item.id)}
			<Card.Root>
				<Card.Header>{item.title}</Card.Header>
				<Card.Content>
					<p>{item.description}</p>
				</Card.Content>
				<Card.Footer>
					<Button variant="outline">View details</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>

<style>
	.card-grid-container {
		container-type: inline-size;
	}
	.card-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--dry-space-6);
	}
	@container (min-width: 40rem) {
		.card-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
```

### Settings page with tabs

```svelte
<script>
	let activeTab = $state('general');
	let displayName = $state('');
</script>

<Container>
	<div class="settings-stack">
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
						<form class="form-stack">
							<Field.Root>
								<Label>Display Name</Label>
								<Input bind:value={displayName} />
							</Field.Root>
							<Button type="submit" variant="solid">Save settings</Button>
						</form>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
			<Tabs.Content value="security">
				<!-- Security settings -->
			</Tabs.Content>
		</Tabs.Root>
	</div>
</Container>

<style>
	.settings-stack {
		display: grid;
		gap: var(--dry-space-8);
	}
	.form-stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

### Data table page

```svelte
<Container>
	<div class="page-stack">
		<div class="page-header">
			<h1>Users</h1>
			<Button variant="solid">Add user</Button>
		</div>
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
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-6);
	}
	.page-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}
</style>
```

## Anti-Patterns

### Using flexbox or inline styles

```svelte
<!-- Wrong: flexbox -->
<div style="display: flex; gap: 1rem;">...</div>

<!-- Wrong: inline styles -->
<div style="max-width: 1200px; margin: 0 auto;">...</div>

<!-- Right: scoped grid -->
<div class="layout">...</div>
<Container>...</Container>

<style>
	.layout {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

### Forgetting Card.Root in form layouts

```svelte
<!-- Wrong: bare Card -->
<Card>
	<Card.Content>...</Card.Content>
</Card>

<!-- Right: Card.Root -->
<Card.Root>
	<Card.Content>...</Card.Content>
</Card.Root>
```

## Component Selection Quick Reference

Before using any component, call `dryui compose "<query>"` or `dryui info <Component>` to get the correct component and usage snippet. If MCP is available, `ask --scope recipe` and `ask --scope component` are equivalent. This table is a quick reference — the CLI and MCP surfaces both return the fuller snippets and anti-patterns.

| UI Need           | Use This                               | NOT This                     |
| ----------------- | -------------------------------------- | ---------------------------- |
| Date picker       | `DatePicker.Root`                      | `<input type="date">`        |
| Date range        | `DateRangePicker.Root`                 | Two `<input type="date">`    |
| Time input        | `TimeInput`                            | `<input type="time">`        |
| Dropdown select   | `Select.Root`                          | `<select>`                   |
| Searchable select | `Combobox.Root`                        | `<input>` + custom dropdown  |
| Modal dialog      | `Dialog.Root`                          | `<dialog>` or manual overlay |
| Confirmation      | `AlertDialog.Root`                     | `window.confirm()`           |
| Side panel        | `Drawer.Root`                          | Fixed-position div           |
| Data table        | `Table.Root`                           | `<table>`                    |
| Person image      | `Avatar`                               | Emoji or bare `<img>`        |
| Content image     | `Image`                                | Bare `<img>`                 |
| Multi-step flow   | `Stepper.Root`                         | Manual step divs             |
| Progress bar      | `Progress`                             | CSS-only bar                 |
| Inline chart      | `Sparkline`                            | Manual SVG                   |
| Full chart        | `Chart.Root`                           | External chart library       |
| Max-width wrapper | `Container`                            | `max-width` + `margin: auto` |
| Form field        | `Field.Root` + `Label` + Input         | `<label>` + `<input>`        |
| Status indicator  | `Badge`                                | Colored `<span>`             |
| Loading state     | `Skeleton` or `Spinner`                | Text "Loading..."            |
| Empty state       | `EmptyState.Root`                      | Custom empty div             |
| Notifications     | `Toast`                                | Alert div                    |
| Keyboard shortcut | `Kbd`                                  | `<code>`                     |
| Code display      | `CodeBlock`                            | `<pre><code>`                |
| File upload       | `FileUpload.Root`                      | `<input type="file">`        |
| Color picker      | `ColorPicker.Root`                     | `<input type="color">`       |
| Collapsible       | `Accordion.Root` or `Collapsible.Root` | Manual toggle with if/else   |

## Composition Recipes

Call `dryui compose "<recipe>"` with any recipe name to get a full working snippet. If MCP is available, `ask --scope recipe "<recipe>"` is equivalent.

| Recipe                    | Description               | Key Components                         |
| ------------------------- | ------------------------- | -------------------------------------- |
| `search-form`             | Search bar with filters   | Input, DatePicker, Select, Button      |
| `data-table-with-actions` | Table with header actions | Table, Badge, Avatar, Button           |
| `checkout-flow`           | Multi-step checkout       | Stepper, Card, Field, RadioGroup       |
| `hotel-listing-card`      | Product/listing card      | Card, Image, Badge, Button, Text       |
| `stat-card-grid`          | KPI dashboard cards       | StatCard, Chart, Sparkline, Container  |
| `settings-page`           | Settings with tabs        | Tabs, Card, Field, Input, Select       |
| `form-with-validation`    | Form with error handling  | Card, Field, Label, Input, Field.Error |
| `sidebar-layout`          | Page with sidebar nav     | Sidebar, PageHeader, Container         |
| `dashboard-page`          | Full dashboard layout     | Sidebar, StatCard, Chart, Table        |
| `user-profile-card`       | User info card            | Card, Avatar, Text, Badge, Button      |
| `notification-list`       | Notification feed         | Card, Avatar, Text, Badge              |
| `command-bar`             | Command palette trigger   | CommandPalette, Hotkey                 |
| `file-upload-form`        | File upload with progress | Card, FileUpload, Progress, Button     |
| `pricing-table`           | Pricing comparison        | Card, Text, Button, Badge              |

## State-heavy form flows

DryUI is a presentation and accessibility system, not a workflow engine. For dependent-field planners, approvals, and booking-style state machines:

- Normalize route/session state in script before rendering DryUI inputs.
- Reset dependent `Select.Root` values when their parent choice changes; do not rely on stale child state surviving domain changes.
- Use raw CSS grid to lay out planner sections, and keep orchestration logic in route-level stores or derived state.
- Run `dryui info <Component>` or `dryui compose "<pattern>"` before introducing a new field shape, then use MCP `check` if it is available after the flow is wired. Without MCP, rely on the `@dryui/lint` preprocessor plus the project's normal build and test commands.

```svelte
<script lang="ts">
  let country = $state('');
  let airport = $state('');

  const airportOptions = $derived(getAirports(country));

  $effect(() => {
    if (!airportOptions.some((option) => option.value === airport)) {
      airport = '';
    }
  });
</script>

<div class="planner">
  <Field.Root>
    <Label>Country</Label>
    <Select.Root bind:value={country}>
      <Select.Trigger><Select.Value placeholder="Choose country" /></Select.Trigger>
      <Select.Content>{/* items */}</Select.Content>
    </Select.Root>
  </Field.Root>

  <Field.Root>
    <Label>Airport</Label>
    <Select.Root bind:value={airport} disabled={!country}>
      <Select.Trigger><Select.Value placeholder="Choose airport" /></Select.Trigger>
      <Select.Content>{/* filtered items */}</Select.Content>
    </Select.Root>
  </Field.Root>
</div>

<style>
  .planner {
    display: grid;
    gap: var(--dry-space-4);
  }
</style>
```
