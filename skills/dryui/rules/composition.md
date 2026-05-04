# Composition

## Page Layout in `src/layout.css`

Page and section layout uses `[data-layout]` and `[data-layout-area]` hooks in markup, with grid, flex, container queries, and spacing rules in `src/layout.css`. No page-level grid/flex in component `<style>` blocks, no inline styles, no layout components (Stack, Flex, Grid, Spacer).

### Vertical stack

```svelte
<div data-layout="stack">
	<p>First</p>
	<p>Second</p>
</div>
```

```css
[data-layout='stack'] {
	display: grid;
	gap: var(--dry-space-4);
}
```

### Horizontal row

```svelte
<div data-layout="row">
	<span>Label</span>
	<Button>Action</Button>
</div>
```

```css
[data-layout='row'] {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: center;
	gap: var(--dry-space-4);
}
```

### Responsive columns with @container

```svelte
<div data-layout="grid">
	<div>A</div>
	<div>B</div>
	<div>C</div>
</div>
```

```css
[data-layout='grid'] {
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--dry-space-6);
}

@container page (min-width: 40rem) {
	[data-layout='grid'] {
		grid-template-columns: repeat(3, 1fr);
	}
}
```

### Centered max-width content

Use `src/layout.css` grid tracks for page-level width. Use `Container` only inside component recipes that explicitly need constrained content measure:

```svelte
<main data-layout="content-page">
	<section data-layout-area="main">
		<h1>Page Title</h1>
	</section>
</main>
```

```css
[data-layout='content-page'] {
	display: grid;
	grid-template-columns: minmax(0, 64rem);
	justify-content: center;
	padding: var(--dry-space-6);
}
```

## Form Composition

### Basic form

Wrap each input in Field.Root, stack them with grid, and put everything in a semantic surface.

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import { Field, Label, Input, Button } from '@dryui/ui';

	let name = $state('');
	let email = $state('');
</script>

<section class="form-surface" aria-labelledby="contact-info-title">
	<h2 id="contact-info-title">Contact Info</h2>
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
</section>

<style>
	.form-surface {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-6);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
	}

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
<div data-layout="sidebar-page">
	<nav data-layout-area="sidebar">
		<Button variant="ghost">Dashboard</Button>
		<Button variant="ghost">Settings</Button>
		<Button variant="ghost">Profile</Button>
	</nav>
	<main data-layout-area="main">
		<h1>Dashboard</h1>
		<p>Main content here.</p>
	</main>
</div>
```

```css
[data-layout='sidebar-page'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	grid-template-areas:
		'sidebar'
		'main';
	gap: var(--dry-space-6);
}

[data-layout='sidebar-page'] > [data-layout-area='sidebar'] {
	grid-area: sidebar;
	display: grid;
	gap: var(--dry-space-2);
	align-content: start;
}

[data-layout='sidebar-page'] > [data-layout-area='main'] {
	grid-area: main;
	display: grid;
	gap: var(--dry-space-6);
	align-content: start;
}

@container page (min-width: 56rem) {
	[data-layout='sidebar-page'] {
		grid-template-columns: 15rem minmax(0, 1fr);
		grid-template-areas: 'sidebar main';
	}
}
```

### Panel grid

```svelte
<div data-layout="card-grid">
	{#each items as item (item.id)}
		<article class="panel-card">
			<h2>{item.title}</h2>
			<p>{item.description}</p>
			<Button variant="outline">View details</Button>
		</article>
	{/each}
</div>
```

```css
[data-layout='card-grid'] {
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--dry-space-6);
}

@container page (min-width: 40rem) {
	[data-layout='card-grid'] {
		grid-template-columns: repeat(3, 1fr);
	}
}
```

### Settings page with tabs

```svelte
<script>
	let activeTab = $state('general');
	let displayName = $state('');
</script>

<main data-layout="settings-page">
	<section data-layout-area="main">
		<h1>Settings</h1>
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List>
				<Tabs.Trigger value="general">General</Tabs.Trigger>
				<Tabs.Trigger value="security">Security</Tabs.Trigger>
				<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="general">
				<form class="form-stack settings-panel">
					<Field.Root>
						<Label>Display Name</Label>
						<Input bind:value={displayName} />
					</Field.Root>
					<Button type="submit" variant="solid">Save settings</Button>
				</form>
			</Tabs.Content>
			<Tabs.Content value="security">
				<!-- Security settings -->
			</Tabs.Content>
		</Tabs.Root>
	</section>
</main>
```

```css
[data-layout='settings-page'] {
	display: grid;
	grid-template-columns: minmax(0, 64rem);
	justify-content: center;
	padding: var(--dry-space-6);
}

[data-layout='settings-page'] > [data-layout-area='main'] {
	display: grid;
	gap: var(--dry-space-8);
}
```

```svelte
<style>
	.form-stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

### Data table page

```svelte
<main data-layout="data-page">
	<section data-layout-area="main">
		<header data-layout-area="header">
			<h1>Users</h1>
			<Button variant="solid">Add user</Button>
		</header>
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
	</section>
</main>
```

```css
[data-layout='data-page'] {
	display: grid;
	grid-template-columns: minmax(0, 72rem);
	justify-content: center;
	padding: var(--dry-space-6);
}

[data-layout='data-page'] > [data-layout-area='main'] {
	display: grid;
	gap: var(--dry-space-6);
}

[data-layout='data-page'] [data-layout-area='header'] {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: center;
}
```

## Anti-Patterns

### Putting page layout in component styles or inline styles

```svelte
<!-- Wrong: inline page layout -->
<div style="display: flex; gap: 1rem;">...</div>

<!-- Wrong: inline styles -->
<div style="max-width: 1200px; margin: 0 auto;">...</div>

<!-- Right: layout hook + src/layout.css -->
<div data-layout="layout">
	<section data-layout-area="main">...</section>
</div>
```

```css
[data-layout='layout'] {
	display: grid;
	gap: var(--dry-space-4);
}
```

### Using the removed Card component

```svelte
<!-- Wrong: Card is no longer exported -->
<Card.Root>...</Card.Root>

<!-- Right: semantic surface plus current DryUI controls -->
<section class="surface">
	<Button>Continue</Button>
</section>
```

## Component Selection Quick Reference

Before using any component, call `dryui ask --scope recipe "<pattern>"` (for layouts) or `dryui ask --scope component "<Component>"` (for APIs) to get the correct component and usage snippet. If MCP is available, call MCP `ask` with the same `scope` and `query`. This table is a quick reference. The CLI and MCP surfaces both return the fuller snippets and anti-patterns.

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
| Page width        | `src/layout.css` grid tracks           | `max-width` + `margin: auto` |
| Content measure   | `Container` in component recipes only  | page-shell wrapper           |
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

Call `dryui ask --scope recipe "<recipe>"` with any recipe name to get a full working snippet, or call MCP `ask` with `scope: "recipe"`.

| Recipe                    | Description               | Key Components                    |
| ------------------------- | ------------------------- | --------------------------------- |
| `search-form`             | Search bar with filters   | Input, DatePicker, Select, Button |
| `data-table-with-actions` | Table with header actions | Table, Badge, Avatar, Button      |
| `checkout-flow`           | Multi-step checkout       | Stepper, Field, RadioGroup        |
| `hotel-listing-card`      | Product/listing card      | Image, Badge, Button, Text        |
| `stat-card-grid`          | KPI dashboard cards       | StatCard, Chart, Sparkline        |
| `settings-page`           | Settings with tabs        | Tabs, Field, Input, Select        |
| `form-with-validation`    | Form with error handling  | Field, Label, Input, Field.Error  |
| `sidebar-layout`          | Page with sidebar nav     | Sidebar, PageHeader               |
| `dashboard-page`          | Full dashboard layout     | Sidebar, StatCard, Chart, Table   |
| `user-profile-card`       | User info card            | Avatar, Text, Badge, Button       |
| `notification-list`       | Notification feed         | Avatar, Text, Badge               |
| `command-bar`             | Command palette trigger   | CommandPalette, Hotkey            |
| `file-upload-form`        | File upload with progress | FileUpload, Progress, Button      |
| `pricing-table`           | Pricing comparison        | Text, Button, Badge               |

## State-heavy form flows

DryUI is a presentation and accessibility system, not a workflow engine. For dependent-field planners, approvals, and booking-style state machines:

- Normalize route/session state in script before rendering DryUI inputs.
- Reset dependent `Select.Root` values when their parent choice changes; do not rely on stale child state surviving domain changes.
- Use `data-layout` hooks plus `src/layout.css` for route-level planner sections, and keep orchestration logic in route-level stores or derived state.
- Run `dryui ask --scope component "<Component>"` or `dryui ask --scope recipe "<pattern>"` before introducing a new field shape. If MCP is available, call MCP `ask` with the same `scope` and `query`. Then run `dryui check [path]` or MCP `check` after the flow is wired.

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

<div data-layout="planner-fields">
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
```

```css
[data-layout='planner-fields'] {
	display: grid;
	gap: var(--dry-space-4);
}
```
