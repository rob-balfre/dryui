// Composition guidance — single source of truth.
// Consumed by: spec.json, compose MCP tool, compose CLI command, DryUI skill.

export interface Alternative {
	rank: number;
	component: string;
	useWhen: string;
	snippet: string;
}

export interface AntiPattern {
	pattern: string;
	reason: string;
	fix: string;
}

export interface ComponentComposition {
	component: string;
	useWhen: string;
	alternatives: Alternative[];
	antiPatterns: AntiPattern[];
	combinesWith: string[];
}

export interface CompositionRecipe {
	name: string;
	description: string;
	tags: string[];
	components: string[];
	snippet: string;
}

// ---------------------------------------------------------------------------
// Component Compositions
// ---------------------------------------------------------------------------

export const componentCompositions: ComponentComposition[] = [
	// ── Date / Time ──────────────────────────────────────────────────────────

	{
		component: 'DatePicker',
		useWhen: 'User needs to pick a single date',
		alternatives: [
			{
				rank: 1,
				component: 'DatePicker',
				useWhen: 'Standard date selection in forms or filters',
				snippet: `<DatePicker.Root bind:value={date}>
  <DatePicker.Trigger placeholder="Pick a date" />
  <DatePicker.Content>
    <DatePicker.Calendar />
  </DatePicker.Content>
</DatePicker.Root>`
			},
			{
				rank: 2,
				component: 'DateRangePicker',
				useWhen: 'Need a start and end date (check-in/check-out, date range filters)',
				snippet: `<DateRangePicker.Root bind:startDate bind:endDate>
  <DateRangePicker.Trigger placeholder="Select dates" />
  <DateRangePicker.Content>
    <DateRangePicker.Calendar />
  </DateRangePicker.Content>
</DateRangePicker.Root>`
			},
			{
				rank: 3,
				component: 'DateField',
				useWhen: 'Compact inline date entry with segment editing',
				snippet: `<DateField bind:value={date} />`
			},
			{
				rank: 4,
				component: 'DateTimeInput',
				useWhen: 'Need both date and time in one input',
				snippet: `<DateTimeInput bind:value={dateTime} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<Input type="date">',
				reason: 'Bypasses theme system, inconsistent across browsers, no calendar popup',
				fix: 'DatePicker'
			},
			{
				pattern: '<input type="date">',
				reason: 'Native date input — no theming, no accessibility integration',
				fix: 'DatePicker'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'Calendar',
		useWhen: 'Display a standalone calendar (not inside a picker popup)',
		alternatives: [
			{
				rank: 1,
				component: 'Calendar',
				useWhen: 'Standalone calendar display or date selection',
				snippet: `<Calendar bind:value={date} />`
			},
			{
				rank: 2,
				component: 'RangeCalendar',
				useWhen: 'Standalone calendar for selecting a date range',
				snippet: `<RangeCalendar bind:startDate bind:endDate />`
			}
		],
		antiPatterns: [],
		combinesWith: ['Card.Content']
	},

	{
		component: 'TimeInput',
		useWhen: 'User needs to enter a time value',
		alternatives: [
			{
				rank: 1,
				component: 'TimeInput',
				useWhen: 'Time-only input',
				snippet: `<TimeInput bind:value={time} />`
			},
			{
				rank: 2,
				component: 'DateTimeInput',
				useWhen: 'Need both date and time together',
				snippet: `<DateTimeInput bind:value={dateTime} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<Input type="time">',
				reason: 'Native time input — no theming, inconsistent rendering',
				fix: 'TimeInput'
			},
			{ pattern: '<input type="time">', reason: 'Native time input — no theming', fix: 'TimeInput' }
		],
		combinesWith: ['Field.Root', 'Label']
	},

	// ── Selection ────────────────────────────────────────────────────────────

	{
		component: 'Select',
		useWhen: 'User picks one option from a dropdown list',
		alternatives: [
			{
				rank: 1,
				component: 'Select',
				useWhen: 'Standard dropdown with predefined options',
				snippet: `<Select.Root bind:value={choice}>
  <Select.Trigger>
    <Select.Value placeholder="Choose..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
    <Select.Item value="b">Option B</Select.Item>
  </Select.Content>
</Select.Root>`
			},
			{
				rank: 2,
				component: 'Combobox',
				useWhen: 'Searchable/filterable dropdown (many options or user can type)',
				snippet: `<Combobox.Root bind:value={choice}>
  <Combobox.Input placeholder="Search..." />
  <Combobox.Content>
    <Combobox.Item value="a" index={0}>Option A</Combobox.Item>
    <Combobox.Item value="b" index={1}>Option B</Combobox.Item>
  </Combobox.Content>
</Combobox.Root>`
			},
			{
				rank: 3,
				component: 'RadioGroup',
				useWhen: 'Few options that should all be visible at once',
				snippet: `<RadioGroup.Root bind:value={choice}>
  <RadioGroup.Item value="a">Option A</RadioGroup.Item>
  <RadioGroup.Item value="b">Option B</RadioGroup.Item>
</RadioGroup.Root>`
			},
			{
				rank: 4,
				component: 'SegmentedControl',
				useWhen: 'Toggle between 2-4 options (like a button group)',
				snippet: `<SegmentedControl bind:value={choice} options={[
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]} />`
			},
			{
				rank: 5,
				component: 'Listbox',
				useWhen: 'Scrollable list for selecting one or multiple items',
				snippet: `<Listbox.Root bind:value={choice}>
  <Listbox.Item value="a">Option A</Listbox.Item>
  <Listbox.Item value="b">Option B</Listbox.Item>
</Listbox.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<select>',
				reason: 'Native select — no theming, limited styling, no compound structure',
				fix: 'Select'
			},
			{
				pattern: '<option>',
				reason: 'Part of native select — use Select.Item instead',
				fix: 'Select.Item'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	// ── Dialogs / Overlays ───────────────────────────────────────────────────

	{
		component: 'Dialog',
		useWhen: 'Show a modal overlay for forms, details, or complex interactions',
		alternatives: [
			{
				rank: 1,
				component: 'Dialog',
				useWhen: 'General-purpose modal with custom content',
				snippet: `<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Description and content here</Dialog.Body>
    <Dialog.Footer>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`
			},
			{
				rank: 2,
				component: 'AlertDialog',
				useWhen: 'Confirmation dialogs (delete, discard, destructive actions)',
				snippet: `<AlertDialog.Root>
  <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>Are you sure?</AlertDialog.Header>
    <AlertDialog.Body>This action cannot be undone.</AlertDialog.Body>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`
			},
			{
				rank: 3,
				component: 'Drawer',
				useWhen: 'Side panel for settings, filters, or detail views',
				snippet: `<Drawer.Root>
  <Drawer.Trigger>Open panel</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>Settings</Drawer.Header>
    <!-- content -->
  </Drawer.Content>
</Drawer.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<dialog>',
				reason: 'Native dialog — no theming, no backdrop animation, no compound structure',
				fix: 'Dialog'
			},
			{
				pattern: 'window.confirm',
				reason: 'Browser native — no theming, blocks thread',
				fix: 'AlertDialog'
			},
			{
				pattern: 'window.alert',
				reason: 'Browser native — no theming, blocks thread',
				fix: 'Dialog or Alert component'
			}
		],
		combinesWith: ['Button', 'Field.Root']
	},

	{
		component: 'Popover',
		useWhen: 'Show contextual content anchored to a trigger element',
		alternatives: [
			{
				rank: 1,
				component: 'Popover',
				useWhen: 'Rich contextual content (forms, lists, previews)',
				snippet: `<Popover.Root>
  <Popover.Trigger>More info</Popover.Trigger>
  <Popover.Content>
    <p>Popover content here</p>
  </Popover.Content>
</Popover.Root>`
			},
			{
				rank: 2,
				component: 'Tooltip',
				useWhen: 'Simple text hint on hover',
				snippet: `<Tooltip.Root>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Content>Helpful hint</Tooltip.Content>
</Tooltip.Root>`
			},
			{
				rank: 3,
				component: 'HoverCard',
				useWhen: 'Preview card on hover (user profiles, link previews)',
				snippet: `<HoverCard.Root>
  <HoverCard.Trigger>@username</HoverCard.Trigger>
  <HoverCard.Content>
    <p>User profile preview</p>
  </HoverCard.Content>
</HoverCard.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'title=',
				reason: 'Native tooltip — no styling, delayed, inaccessible',
				fix: 'Tooltip'
			}
		],
		combinesWith: ['Button', 'Text']
	},

	{
		component: 'CommandPalette',
		useWhen: 'Search/command interface (Cmd+K pattern)',
		alternatives: [
			{
				rank: 1,
				component: 'CommandPalette',
				useWhen: 'Global search and command execution',
				snippet: `<CommandPalette.Root bind:open={showPalette}>
  <CommandPalette.Input placeholder="Type a command..." />
  <CommandPalette.List>
    <CommandPalette.Group heading="Actions">
      <CommandPalette.Item value="new">New document</CommandPalette.Item>
      <CommandPalette.Item value="search">Search</CommandPalette.Item>
    </CommandPalette.Group>
  </CommandPalette.List>
</CommandPalette.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Hotkey', 'Dialog']
	},

	// ── Tables / Data ────────────────────────────────────────────────────────

	{
		component: 'Table',
		useWhen: 'Display tabular data with rows and columns',
		alternatives: [
			{
				rank: 1,
				component: 'Table',
				useWhen: 'Standard data table with headers',
				snippet: `<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Alice</Table.Cell>
      <Table.Cell><Badge>Active</Badge></Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>`
			},
			{
				rank: 2,
				component: 'DataGrid',
				useWhen: 'Advanced data table with sorting, filtering, pagination',
				snippet: `<DataGrid.Root items={rows}>
  <DataGrid.Table>
    <DataGrid.Header>
      <DataGrid.Column key="name">Name</DataGrid.Column>
      <DataGrid.Column key="status">Status</DataGrid.Column>
    </DataGrid.Header>
    <DataGrid.Body>{#snippet children({ items })}
      {#each items as row}
        <DataGrid.Row><DataGrid.Cell>{row.name}</DataGrid.Cell><DataGrid.Cell>{row.status}</DataGrid.Cell></DataGrid.Row>
      {/each}
    {/snippet}</DataGrid.Body>
  </DataGrid.Table>
  <DataGrid.Pagination />
</DataGrid.Root>`
			},
			{
				rank: 3,
				component: 'List',
				useWhen: 'Simple list of items (not tabular)',
				snippet: `<List.Root>
  <List.Item>First item</List.Item>
  <List.Item>Second item</List.Item>
</List.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<table>',
				reason: 'Native table — no theming, no consistent row/cell styling',
				fix: 'Table'
			},
			{
				pattern: '<thead>',
				reason: 'Part of native table — use Table.Header',
				fix: 'Table.Header'
			},
			{ pattern: '<tbody>', reason: 'Part of native table — use Table.Body', fix: 'Table.Body' },
			{ pattern: '<tr>', reason: 'Part of native table — use Table.Row', fix: 'Table.Row' },
			{ pattern: '<td>', reason: 'Part of native table — use Table.Cell', fix: 'Table.Cell' },
			{ pattern: '<th>', reason: 'Part of native table — use Table.Head', fix: 'Table.Head' }
		],
		combinesWith: ['Badge', 'Avatar', 'Button', 'Container']
	},

	// ── Images / Avatars ─────────────────────────────────────────────────────

	{
		component: 'Avatar',
		useWhen: 'Display a person or entity image with fallback',
		alternatives: [
			{
				rank: 1,
				component: 'Avatar',
				useWhen: 'Person/entity image with initials fallback',
				snippet: `<Avatar src="/photo.jpg" alt="Jane Smith" fallback="JS" size="md" />`
			},
			{
				rank: 2,
				component: 'Image',
				useWhen: 'Content image (not a person) with loading/error states',
				snippet: `<Image src="/hotel.jpg" alt="Hotel exterior" fallback="/placeholder.jpg" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'emoji as image placeholder',
				reason: 'Emoji renders differently per OS, not a real image placeholder',
				fix: 'Avatar with fallback prop or Image with fallback'
			},
			{
				pattern: '<img',
				reason: 'Bare img tag — no fallback, no loading state, no theming',
				fix: 'Image or Avatar'
			}
		],
		combinesWith: ['Text', 'Card.Content', 'Table.Cell']
	},

	// ── Progress / Steps ─────────────────────────────────────────────────────

	{
		component: 'Stepper',
		useWhen: 'Multi-step process indicator (wizard, checkout flow)',
		alternatives: [
			{
				rank: 1,
				component: 'Stepper',
				useWhen: 'Multi-step flow with labeled steps',
				snippet: `<Stepper.Root activeStep={1}>
  <Stepper.List>
    <Stepper.Step step={0}>Cart</Stepper.Step>
    <Stepper.Separator step={0} />
    <Stepper.Step step={1}>Shipping</Stepper.Step>
    <Stepper.Separator step={1} />
    <Stepper.Step step={2}>Payment</Stepper.Step>
    <Stepper.Separator step={2} />
    <Stepper.Step step={3}>Confirmation</Stepper.Step>
  </Stepper.List>
</Stepper.Root>`
			},
			{
				rank: 2,
				component: 'Progress',
				useWhen: 'Show completion percentage as a bar',
				snippet: `<Progress value={65} max={100} />`
			},
			{
				rank: 3,
				component: 'ProgressRing',
				useWhen: 'Circular progress indicator',
				snippet: `<ProgressRing value={65} max={100} />`
			},
			{
				rank: 4,
				component: 'Gauge',
				useWhen: 'Visual gauge or meter (health, performance)',
				snippet: `<Gauge value={72} max={100} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual step divs',
				reason: 'No consistent styling, no active/complete state management',
				fix: 'Stepper'
			},
			{
				pattern: 'CSS-only progress bar',
				reason: 'No accessibility, no theme integration',
				fix: 'Progress'
			}
		],
		combinesWith: ['Card.Content', 'Button']
	},

	// ── Charts ───────────────────────────────────────────────────────────────

	{
		component: 'Chart',
		useWhen: 'Display data visualizations (bar, line, area, donut charts)',
		alternatives: [
			{
				rank: 1,
				component: 'Chart (Bar)',
				useWhen: 'Bar chart for comparing values',
				snippet: `<Chart.Root data={chartData} width={600} height={300}>
  <Chart.Bars />
  <Chart.XAxis />
  <Chart.YAxis />
</Chart.Root>`
			},
			{
				rank: 2,
				component: 'Chart (Line)',
				useWhen: 'Line chart for trends over time',
				snippet: `<Chart.Root data={chartData} width={600} height={300}>
  <Chart.Line />
  <Chart.XAxis />
  <Chart.YAxis />
</Chart.Root>`
			},
			{
				rank: 3,
				component: 'Chart (Area)',
				useWhen: 'Area chart for volume over time',
				snippet: `<Chart.Root data={chartData} width={600} height={300}>
  <Chart.Area />
  <Chart.XAxis />
  <Chart.YAxis />
</Chart.Root>`
			},
			{
				rank: 4,
				component: 'Chart (Donut)',
				useWhen: 'Donut/pie chart for proportions',
				snippet: `<Chart.Root data={chartData} width={300} height={300}>
  <Chart.Donut />
</Chart.Root>`
			},
			{
				rank: 5,
				component: 'Chart (StackedBar)',
				useWhen: 'Stacked bar chart for part-to-whole comparisons',
				snippet: `<Chart.Root data={chartData} width={600} height={300}>
  <Chart.StackedBar />
  <Chart.XAxis />
  <Chart.YAxis />
</Chart.Root>`
			},
			{
				rank: 6,
				component: 'Sparkline',
				useWhen: 'Tiny inline chart for trends in tables or cards',
				snippet: `<Sparkline data={[10, 25, 18, 30, 22]} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'hardcoded dark background on chart',
				reason: 'Chart should inherit theme colors — do not set background manually',
				fix: 'Chart.Root inherits theme via --dry-* variables'
			},
			{
				pattern: 'external chart library',
				reason: 'DryUI has zero-dependency Chart component — no need for chart.js or d3',
				fix: 'Chart'
			}
		],
		combinesWith: ['Card.Content']
	},

	// ── Layout ───────────────────────────────────────────────────────────────

	{
		component: 'Separator',
		useWhen: 'Visual divider between sections',
		alternatives: [
			{
				rank: 1,
				component: 'Separator',
				useWhen: 'Horizontal or vertical divider line',
				snippet: `<Separator />`
			}
		],
		antiPatterns: [
			{ pattern: '<hr>', reason: 'Native hr — no theming', fix: 'Separator' },
			{ pattern: '<hr />', reason: 'Native hr — no theming', fix: 'Separator' }
		],
		combinesWith: ['Card.Content']
	},

	// ── Forms ────────────────────────────────────────────────────────────────

	{
		component: 'Field',
		useWhen: 'Wrap any form input with a label and optional error message',
		alternatives: [
			{
				rank: 1,
				component: 'Field',
				useWhen: 'Standard form field wrapper',
				snippet: `<Field.Root>
  <Label>Email</Label>
  <Input type="email" bind:value={email} />
  {#if error}
    <Field.Error>{error}</Field.Error>
  {/if}
</Field.Root>`
			},
			{
				rank: 2,
				component: 'Fieldset',
				useWhen: 'Group related form fields together',
				snippet: `<Fieldset.Root>
  <Fieldset.Legend>Personal Info</Fieldset.Legend>
  <div class="fields">
    <Field.Root>
      <Label>First name</Label>
      <Input bind:value={firstName} />
    </Field.Root>
    <Field.Root>
      <Label>Last name</Label>
      <Input bind:value={lastName} />
    </Field.Root>
  </div>
</Fieldset.Root>

<style>
  .fields { display: grid; gap: var(--dry-space-4); }
</style>`
			}
		],
		antiPatterns: [
			{
				pattern: '<label>',
				reason: 'Native label — no error state, no accessible binding to input',
				fix: 'Field.Root + Label'
			},
			{
				pattern: 'bare Input without Field.Root',
				reason: 'Missing accessible label association and error display',
				fix: 'Field.Root + Label + Input'
			},
			{
				pattern: 'custom .field div with <span> or <label> for labels',
				reason:
					'Field.Root + Label provides accessible labeling, error states, help text, and consistent spacing. Custom field markup skips accessibility and validation patterns.',
				fix: '<Field.Root><Label>Name</Label><Input /></Field.Root>'
			}
		],
		combinesWith: ['Label', 'Input', 'Textarea', 'Select', 'Checkbox', 'Card.Content']
	},

	{
		component: 'Input',
		useWhen: 'Single-line text input',
		alternatives: [
			{
				rank: 1,
				component: 'Input',
				useWhen: 'Standard text input (text, email, password, url)',
				snippet: `<Input bind:value={text} placeholder="Enter text..." />`
			},
			{
				rank: 2,
				component: 'Textarea',
				useWhen: 'Multi-line text input',
				snippet: `<Textarea bind:value={text} rows={4} />`
			},
			{
				rank: 3,
				component: 'NumberInput',
				useWhen: 'Numeric input with increment/decrement',
				snippet: `<NumberInput bind:value={num} min={0} max={100} step={1} />`
			},
			{
				rank: 4,
				component: 'PromptInput',
				useWhen: 'Chat/prompt-style input with submit action',
				snippet: `<PromptInput bind:value={message} onsubmit={handleSend} placeholder="Type a message..." />`
			},
			{
				rank: 5,
				component: 'PinInput',
				useWhen: 'PIN or verification code entry',
				snippet: `<PinInput bind:value={pin} length={6} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<input',
				reason: 'Native input — no theming, no consistent sizing',
				fix: 'Input'
			},
			{ pattern: '<textarea', reason: 'Native textarea — no theming', fix: 'Textarea' }
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'Checkbox',
		useWhen: 'Boolean toggle or multiple selections from a list',
		alternatives: [
			{
				rank: 1,
				component: 'Checkbox',
				useWhen: 'Single boolean toggle (agree to terms, enable feature)',
				snippet: `<Checkbox bind:checked={agreed} />`
			},
			{
				rank: 2,
				component: 'Toggle',
				useWhen:
					'On/off toggle with immediate effect (enable notifications) or pressed/unpressed button state',
				snippet: `<Toggle bind:pressed={active}>Bold</Toggle>`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="checkbox">',
				reason: 'Native checkbox — no theming',
				fix: 'Checkbox'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'Slider',
		useWhen: 'Select a numeric value within a range by dragging',
		alternatives: [
			{
				rank: 1,
				component: 'Slider',
				useWhen: 'Range slider for numeric values',
				snippet: `<Slider bind:value={volume} min={0} max={100} step={1} />`
			},
			{
				rank: 2,
				component: 'NumberInput',
				useWhen: 'Precise numeric entry with buttons',
				snippet: `<NumberInput bind:value={volume} min={0} max={100} />`
			},
			{
				rank: 3,
				component: 'Rating',
				useWhen: 'Star/icon rating (1-5 scale)',
				snippet: `<Rating bind:value={stars} max={5} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="range">',
				reason: 'Native range — no theming, limited customization',
				fix: 'Slider'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Text']
	},

	{
		component: 'ColorPicker',
		useWhen: 'Select a color value',
		alternatives: [
			{
				rank: 1,
				component: 'ColorPicker',
				useWhen: 'Full color picker with palette and custom input',
				snippet: `<ColorPicker.Root bind:value={color}>
  <ColorPicker.Area />
  <ColorPicker.HueSlider />
  <ColorPicker.AlphaSlider />
  <ColorPicker.Input />
</ColorPicker.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="color">',
				reason: 'Native color picker — no theming, limited UI',
				fix: 'ColorPicker'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Popover']
	},

	{
		component: 'FileUpload',
		useWhen: 'Upload files via drag-and-drop or file browser',
		alternatives: [
			{
				rank: 1,
				component: 'FileUpload',
				useWhen: 'File upload with drag-and-drop zone',
				snippet: `<FileUpload.Root bind:files={uploadedFiles} accept="image/*">
  <FileUpload.Trigger>Choose files</FileUpload.Trigger>
  <FileUpload.Dropzone>
    <p>Drag and drop files here</p>
  </FileUpload.Dropzone>
  <FileUpload.List />
</FileUpload.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="file">',
				reason: 'Native file input — no drag-and-drop, no preview, no theming',
				fix: 'FileUpload'
			}
		],
		combinesWith: ['Card.Content', 'Progress', 'Button']
	},

	{
		component: 'FileSelect',
		useWhen: 'Select a file or folder path via external picker (OS dialog, server API)',
		alternatives: [
			{
				rank: 1,
				component: 'FileSelect',
				useWhen: 'Select a file or folder path with a consumer-provided picker callback',
				snippet: `<FileSelect.Root onrequest={pickFolder} bind:value={path}>
  <FileSelect.Trigger>Choose folder</FileSelect.Trigger>
  <FileSelect.Value placeholder="No folder selected" />
  <FileSelect.Clear />
</FileSelect.Root>`
			},
			{
				rank: 2,
				component: 'FileUpload',
				useWhen: 'Upload file contents via drag-and-drop (not path selection)',
				snippet: `<FileUpload.Root bind:files={uploadedFiles}>
  <FileUpload.Trigger>Choose files</FileUpload.Trigger>
  <FileUpload.Dropzone>Drag and drop files here</FileUpload.Dropzone>
  <FileUpload.List />
</FileUpload.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Input with manual path typing',
				reason: 'FileSelect handles loading state, clear, and display automatically',
				fix: 'FileSelect'
			},
			{
				pattern: 'FileUpload for path selection',
				reason: 'FileUpload is for uploading file contents, not selecting paths',
				fix: 'FileSelect'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content', 'Button']
	},

	{
		component: 'MultiSelectCombobox',
		useWhen:
			'User needs to search and select multiple predefined options while keeping selections visible as removable tokens',
		alternatives: [
			{
				rank: 1,
				component: 'MultiSelectCombobox',
				useWhen: 'Searchable multi-select with selected tokens',
				snippet: `<MultiSelectCombobox.Root bind:value={assignees} bind:query={query}>
  <MultiSelectCombobox.SelectionList>
    {#each assignees as assignee}
      <MultiSelectCombobox.SelectionItem value={assignee}>
        {assignee}
        <MultiSelectCombobox.SelectionRemove value={assignee} />
      </MultiSelectCombobox.SelectionItem>
    {/each}
  </MultiSelectCombobox.SelectionList>
  <MultiSelectCombobox.Input placeholder="Search people..." />
  <MultiSelectCombobox.Content>
    <MultiSelectCombobox.Item value="maya">Maya Chen</MultiSelectCombobox.Item>
    <MultiSelectCombobox.Item value="jordan">Jordan Lee</MultiSelectCombobox.Item>
  </MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>`
			},
			{
				rank: 2,
				component: 'Combobox',
				useWhen: 'Searchable single selection only',
				snippet: `<Combobox.Root bind:value={assignee}>
  <Combobox.Input placeholder="Search..." />
  <Combobox.Content>
    <Combobox.Item value="maya" index={0}>Maya Chen</Combobox.Item>
  </Combobox.Content>
</Combobox.Root>`
			},
			{
				rank: 3,
				component: 'TagsInput',
				useWhen: 'Freeform token entry without a predefined option list',
				snippet: `<TagsInput.Root bind:value={tags}>
  <TagsInput.Input placeholder="Add tag..." />
</TagsInput.Root>`
			},
			{
				rank: 4,
				component: 'Transfer',
				useWhen: 'Move many items between two persistent lists',
				snippet: `<Transfer.Root {sourceItems} {targetItems}>
  <Transfer.List type="source" title="Available" />
  <Transfer.Actions />
  <Transfer.List type="target" title="Selected" />
</Transfer.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Combobox + TagsInput stitched together in app code',
				reason: 'MultiSelectCombobox centralizes keyboard handling, tokens, and form submission',
				fix: 'MultiSelectCombobox'
			},
			{
				pattern: 'TagsInput for predefined options',
				reason: 'TagsInput is freeform entry, not option selection',
				fix: 'MultiSelectCombobox'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Avatar', 'Badge']
	},

	{
		component: 'TagsInput',
		useWhen: 'Enter multiple tags or values as chips',
		alternatives: [
			{
				rank: 1,
				component: 'TagsInput',
				useWhen: 'Multi-value tag entry',
				snippet: `<TagsInput.Root bind:value={tags}>
  <TagsInput.Input placeholder="Add tag..." />
</TagsInput.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Field.Root', 'Label']
	},

	// ── Navigation ───────────────────────────────────────────────────────────

	{
		component: 'Tabs',
		useWhen: 'Switch between content panels',
		alternatives: [
			{
				rank: 1,
				component: 'Tabs',
				useWhen: 'Tabbed content panels',
				snippet: `<Tabs.Root bind:value={activeTab}>
  <Tabs.List>
    <Tabs.Trigger value="general">General</Tabs.Trigger>
    <Tabs.Trigger value="security">Security</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="general">General settings</Tabs.Content>
  <Tabs.Content value="security">Security settings</Tabs.Content>
</Tabs.Root>`
			},
			{
				rank: 2,
				component: 'SegmentedControl',
				useWhen: 'Simple toggle between 2-4 views (no content panels)',
				snippet: `<SegmentedControl bind:value={view} options={[
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual tab buttons with conditional rendering',
				reason: 'Tabs handles accessibility (ARIA roles, keyboard nav) automatically',
				fix: 'Tabs'
			}
		],
		combinesWith: ['Card.Root', 'Container']
	},

	{
		component: 'Breadcrumb',
		useWhen: 'Show navigation path hierarchy',
		alternatives: [
			{
				rank: 1,
				component: 'Breadcrumb',
				useWhen: 'Path-based navigation breadcrumbs',
				snippet: `<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link current>Current</Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual breadcrumb links',
				reason: 'Breadcrumb handles separators and ARIA automatically',
				fix: 'Breadcrumb'
			}
		],
		combinesWith: []
	},

	{
		component: 'Pagination',
		useWhen: 'Navigate between pages of content',
		alternatives: [
			{
				rank: 1,
				component: 'Pagination',
				useWhen: 'Page navigation with numbered pages',
				snippet: `<Pagination.Root bind:page={currentPage} totalPages={10}>
  <Pagination.Content>
    <Pagination.Item><Pagination.Previous>Prev</Pagination.Previous></Pagination.Item>
    <Pagination.Item><Pagination.Link page={1}>1</Pagination.Link></Pagination.Item>
    <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
    <Pagination.Item><Pagination.Link page={10}>10</Pagination.Link></Pagination.Item>
    <Pagination.Item><Pagination.Next>Next</Pagination.Next></Pagination.Item>
  </Pagination.Content>
</Pagination.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual page buttons',
				reason: 'Pagination handles page calculation and ARIA automatically',
				fix: 'Pagination'
			}
		],
		combinesWith: ['Table', 'Container']
	},

	{
		component: 'Sidebar',
		useWhen: 'Side navigation panel with grouped items',
		alternatives: [
			{
				rank: 1,
				component: 'Sidebar',
				useWhen: 'Application sidebar navigation',
				snippet: `<Sidebar.Root>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Main</Sidebar.GroupLabel>
      <Sidebar.Item href="/dashboard">Dashboard</Sidebar.Item>
      <Sidebar.Item href="/settings">Settings</Sidebar.Item>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual nav links in a div',
				reason: 'Sidebar handles grouping, active state, and accessibility',
				fix: 'Sidebar'
			}
		],
		combinesWith: []
	},

	// ── Feedback ─────────────────────────────────────────────────────────────

	{
		component: 'Alert',
		useWhen: 'Show an inline status message (info, success, warning, error)',
		alternatives: [
			{
				rank: 1,
				component: 'Alert',
				useWhen: 'Inline alert message within page content',
				snippet: `<Alert variant="warning">
  {#snippet title()}Warning{/snippet}
  {#snippet description()}Your session will expire in 5 minutes.{/snippet}
</Alert>`
			},
			{
				rank: 2,
				component: 'Toast',
				useWhen: 'Temporary notification that auto-dismisses',
				snippet: `<Toast.Provider>
  <!-- in your event handler: -->
  <!-- toast.success('Changes saved') -->
</Toast.Provider>`
			}
		],
		antiPatterns: [
			{
				pattern: 'colored div for status message',
				reason: 'Alert handles semantic colors, icons, and ARIA roles',
				fix: 'Alert'
			},
			{
				pattern: 'window.alert',
				reason: 'Browser native — blocks thread, no theming',
				fix: 'Alert or Toast'
			}
		],
		combinesWith: ['Card.Content']
	},

	{
		component: 'Badge',
		useWhen: 'Small status indicator or label',
		alternatives: [
			{
				rank: 1,
				component: 'Badge',
				useWhen: 'Status labels, counts, or tags',
				snippet: `<Badge variant="soft" color="success">Active</Badge>`
			},
			{
				rank: 2,
				component: 'Chip',
				useWhen: 'Interactive pill that can be selected or toggled',
				snippet: `<Chip selected={isActive} onclick={toggle}>Category</Chip>`
			}
		],
		antiPatterns: [
			{
				pattern: 'colored span for status',
				reason: 'Badge handles semantic colors and consistent sizing',
				fix: 'Badge'
			}
		],
		combinesWith: ['Table.Cell', 'Card.Content', 'Avatar']
	},

	{
		component: 'Skeleton',
		useWhen: 'Loading placeholder that mimics content shape',
		alternatives: [
			{
				rank: 1,
				component: 'Skeleton',
				useWhen: 'Content loading placeholder',
				snippet: `<Skeleton width="200px" height="1rem" />`
			},
			{
				rank: 2,
				component: 'Spinner',
				useWhen: 'Simple spinning loading indicator',
				snippet: `<Spinner size="md" />`
			}
		],
		antiPatterns: [
			{
				pattern: '"Loading..."',
				reason: 'Text-only loading indicator — no visual feedback',
				fix: 'Skeleton or Spinner'
			}
		],
		combinesWith: ['Card.Content', 'Table.Cell']
	},

	// ── Motion / Ambient Surfaces ───────────────────────────────────────────

	{
		component: 'Reveal',
		useWhen:
			'Enter content with browser-native in-view motion, staggered sections, or optional reveal timing. Keep it zero-dependency and respect reduced motion.',
		alternatives: [
			{
				rank: 1,
				component: 'Reveal',
				useWhen:
					'Section reveals, stat rows, or card sequences that should appear as the user scrolls',
				snippet: `<Reveal variant="fade" once>
  <Card.Root>
    <Card.Content>Visible content</Card.Content>
  </Card.Root>
</Reveal>`
			},
			{
				rank: 2,
				component: 'Fade-in with CSS',
				useWhen: 'Simple static entry without any observer logic',
				snippet: `<div class="fade-in">Content</div>`
			}
		],
		antiPatterns: [
			{
				pattern: 'perpetual entrance animation',
				reason: 'Motion should help orientation, not loop forever or compete with content',
				fix: 'Reveal'
			},
			{
				pattern: 'scroll handler thrash',
				reason: 'In-view motion should rely on IntersectionObserver, not repeated scroll listeners',
				fix: 'Reveal'
			}
		],
		combinesWith: ['Card', 'Text']
	},

	{
		component: 'Spotlight',
		useWhen:
			'Add pointer-reactive focus to cards, bento grids, or feature surfaces without shipping a shader runtime.',
		alternatives: [
			{
				rank: 1,
				component: 'Spotlight',
				useWhen: 'Radial highlight or pointer-follow accent on interactive surfaces',
				snippet: `<Spotlight radius={180} intensity={0.7} color="var(--dry-color-fill-brand)">
  <Card.Root>
    <Card.Content>Spotlight card</Card.Content>
  </Card.Root>
</Spotlight>`
			},
			{
				rank: 2,
				component: 'Static accent background',
				useWhen: 'Low-motion surfaces that should remain visually rich without pointer tracking',
				snippet: `<Card.Root class="accent-surface">
  <Card.Content>Static accent</Card.Content>
</Card.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'WebGL-only lighting for simple cards',
				reason: 'This should stay browser-native and zero-dependency',
				fix: 'Spotlight'
			},
			{
				pattern: 'heavy pointer listeners on the document',
				reason: 'Spotlight should track only the surface it decorates',
				fix: 'Spotlight'
			}
		],
		combinesWith: ['Card', 'Reveal']
	},

	{
		component: 'Aurora',
		useWhen:
			'Create ambient hero backgrounds, soft gradients, or shader-like atmosphere with CSS custom properties instead of a rendering engine.',
		alternatives: [
			{
				rank: 1,
				component: 'Aurora',
				useWhen:
					'Hero backdrops, landing-page ambiance, or section frames that need motion without content noise',
				snippet: `<Aurora palette={['#0f172a', '#1d4ed8', '#22c55e']} speed={0.7}>
  <div class="hero-shell">Hero content</div>
</Aurora>`
			},
			{
				rank: 2,
				component: 'Static gradient block',
				useWhen: 'When the layout only needs a quiet background, not animation',
				snippet: `<div class="hero-gradient">Hero content</div>`
			}
		],
		antiPatterns: [
			{
				pattern: 'large canvas or WebGPU scene for a simple backdrop',
				reason: 'Keep decorative atmosphere zero-dependency unless there is a real 3D need',
				fix: 'Aurora'
			},
			{
				pattern: 'bright animated noise behind body copy',
				reason: 'Atmosphere should support hierarchy, not fight it',
				fix: 'Aurora'
			}
		],
		combinesWith: ['Card', 'Container', 'Reveal', 'Text']
	},

	{
		component: 'Noise',
		useWhen:
			'Add subtle grain, texture, or film-like depth to cards and heroes without introducing an external graphics library.',
		alternatives: [
			{
				rank: 1,
				component: 'Noise',
				useWhen: 'Light grain overlay for premium or atmospheric surfaces',
				snippet: `<Noise opacity={0.12} blend="soft-light" animated={false} />`
			},
			{
				rank: 2,
				component: 'Static texture asset',
				useWhen: 'If the design needs a fixed texture and no animation',
				snippet: `<div class="grain-texture" aria-hidden="true"></div>`
			}
		],
		antiPatterns: [
			{
				pattern: 'large image texture downloads for a tiny grain effect',
				reason: 'Use a generated texture or CSS-backed surface instead',
				fix: 'Noise'
			},
			{
				pattern: 'high-opacity grain over body text',
				reason: 'Texture should be subtle enough to preserve readability',
				fix: 'Noise'
			}
		],
		combinesWith: ['Aurora', 'Card', 'Container', 'Reveal']
	},

	// ── Text / Typography ────────────────────────────────────────────────────

	{
		component: 'Text',
		useWhen: 'Themed text with size/weight/color control',
		alternatives: [
			{
				rank: 1,
				component: 'Text',
				useWhen: 'Body text, captions, labels',
				snippet: `<Text size="sm" color="secondary">Secondary text</Text>`
			},
			{
				rank: 2,
				component: 'Heading',
				useWhen: 'Page or section headings',
				snippet: `<Heading level={2}>Section Title</Heading>`
			},
			{
				rank: 3,
				component: 'DescriptionList',
				useWhen: 'Term-description pairs (metadata display)',
				snippet: `<DescriptionList.Root>
  <DescriptionList.Term>Status</DescriptionList.Term>
  <DescriptionList.Description>Active</DescriptionList.Description>
</DescriptionList.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'unstyled <p> in themed context',
				reason: 'Text component integrates with theme colors and spacing',
				fix: 'Text'
			},
			{
				pattern: 'unstyled <h1> to <h6>',
				reason: 'Heading component provides consistent typography scale',
				fix: 'Heading'
			}
		],
		combinesWith: ['Card.Content']
	},

	{
		component: 'Kbd',
		useWhen: 'Display keyboard shortcuts or key combinations',
		alternatives: [
			{
				rank: 1,
				component: 'Kbd',
				useWhen: 'Keyboard shortcut display',
				snippet: `<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>`
			}
		],
		antiPatterns: [
			{
				pattern: '<code> for keyboard shortcuts',
				reason: 'Kbd provides keyboard key styling, not code styling',
				fix: 'Kbd'
			}
		],
		combinesWith: ['Text', 'DropdownMenu']
	},

	{
		component: 'CodeBlock',
		useWhen: 'Display code with syntax highlighting',
		alternatives: [
			{
				rank: 1,
				component: 'CodeBlock',
				useWhen: 'Code snippet display',
				snippet: `<CodeBlock code={sourceCode} language="typescript" />`
			},
			{
				rank: 2,
				component: 'MarkdownRenderer',
				useWhen: 'Render markdown content (may include code blocks)',
				snippet: `<MarkdownRenderer content={markdownString} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<pre><code>',
				reason: 'No theming, no copy button, no syntax highlighting',
				fix: 'CodeBlock'
			}
		],
		combinesWith: ['Card.Content']
	},

	// ── Actions ──────────────────────────────────────────────────────────────

	{
		component: 'Button',
		useWhen: 'Trigger an action or navigate',
		alternatives: [
			{
				rank: 1,
				component: 'Button',
				useWhen: 'Primary action button',
				snippet: `<Button variant="solid" onclick={handleClick}>Save</Button>`
			},
			{
				rank: 2,
				component: 'Button (as link)',
				useWhen: 'Navigation that looks like a button',
				snippet: `<Button href="/settings" variant="outline">Settings</Button>`
			},
			{
				rank: 3,
				component: 'Button (editorial CTA)',
				useWhen: 'Editorial/download CTA that reads as a solid near-black pill',
				snippet: `<Button color="ink" size="lg" href="/download">Download for Mac</Button>`
			}
		],
		antiPatterns: [
			{
				pattern: '<button>',
				reason: 'Native button. No theming, no variant system.',
				fix: 'Button'
			},
			{
				pattern: '<a> styled as button',
				reason: 'Use Button with href prop for link-styled buttons',
				fix: 'Button with href'
			},
			{
				pattern: 'raw <button> with custom CSS classes',
				reason:
					'Button provides variants, sizes, loading states, icons, and theme-consistent styling. Custom buttons bypass the design system.',
				fix: '<Button variant="solid">Submit</Button>'
			},
			{
				pattern: 'className on Button',
				reason:
					"Button accepts 'class' (Svelte idiomatic). For a solid near-black editorial CTA, use the 'ink' color preset; for deeper visual overrides, wrap with --dry-btn-* token overrides or pass a scoped 'class'.",
				fix: '<Button class="..." color="ink">Download</Button>'
			},
			{
				pattern: 'span wrapper setting --dry-btn-bg / --dry-btn-color for a black CTA',
				reason:
					"The 'ink' color preset already renders a theme-aware near-black/white button via --dry-color-bg-inverse and --dry-color-text-inverse. Wrapping adds indirection and loses the data-color hook.",
				fix: '<Button color="ink">Download</Button>'
			}
		],
		combinesWith: ['Card.Footer', 'Dialog.Footer']
	},

	{
		component: 'DropdownMenu',
		useWhen: 'Action menu triggered by a button click',
		alternatives: [
			{
				rank: 1,
				component: 'DropdownMenu',
				useWhen: 'Action menu (edit, delete, share, etc.)',
				snippet: `<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="ghost">Actions</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`
			},
			{
				rank: 2,
				component: 'ContextMenu',
				useWhen: 'Right-click menu',
				snippet: `<ContextMenu.Root>
  <ContextMenu.Trigger>
    <div>Right-click this area</div>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Copy</ContextMenu.Item>
    <ContextMenu.Item>Paste</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>`
			},
			{
				rank: 3,
				component: 'Toolbar',
				useWhen: 'Row of action buttons and toggles',
				snippet: `<Toolbar.Root>
  <Toolbar.Group>
    <Toolbar.Button>Bold</Toolbar.Button>
    <Toolbar.Button>Italic</Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toolbar.Button>Undo</Toolbar.Button>
  </Toolbar.Group>
</Toolbar.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Button', 'Table.Row', 'Card.Content']
	},

	// ── Interaction ──────────────────────────────────────────────────────────

	{
		component: 'Accordion',
		useWhen: 'Collapsible content sections',
		alternatives: [
			{
				rank: 1,
				component: 'Accordion',
				useWhen: 'Multiple collapsible sections (FAQ, settings groups)',
				snippet: `<Accordion.Root>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content for section 1</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Content>Content for section 2</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`
			},
			{
				rank: 2,
				component: 'Collapsible',
				useWhen: 'Single collapsible section',
				snippet: `<Collapsible.Root>
  <Collapsible.Trigger>Show more</Collapsible.Trigger>
  <Collapsible.Content>Hidden content</Collapsible.Content>
</Collapsible.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'manual toggle with if/else',
				reason: 'Accordion/Collapsible handle animation, ARIA, and keyboard nav',
				fix: 'Accordion or Collapsible'
			}
		],
		combinesWith: ['Card.Content']
	},

	// ── Display ──────────────────────────────────────────────────────────────

	{
		component: 'Card',
		useWhen: 'Group related content in a bordered container',
		alternatives: [
			{
				rank: 1,
				component: 'Card',
				useWhen: 'Content container with optional header/footer',
				snippet: `<Card.Root>
  <Card.Header>Title</Card.Header>
  <Card.Content>
    <p>Card content</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'div with border and padding',
				reason: 'Card handles elevation, borders, and theme integration',
				fix: 'Card'
			},
			{
				pattern: '<Card> without .Root',
				reason: 'Card is a compound component — use Card.Root',
				fix: 'Card.Root'
			}
		],
		combinesWith: ['Container', 'Badge', 'Text', 'subgrid aligned-card-list']
	},

	// ── Overlay / Dialog (missing) ──────────────────────────────────────────

	{
		component: 'AlertDialog',
		useWhen: 'Require user confirmation before a destructive or irreversible action',
		alternatives: [
			{
				rank: 1,
				component: 'AlertDialog',
				useWhen: 'Confirmation dialogs (delete, discard, logout)',
				snippet: `<AlertDialog.Root>
  <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>Are you sure?</AlertDialog.Header>
    <AlertDialog.Body>This action cannot be undone.</AlertDialog.Body>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`
			},
			{
				rank: 2,
				component: 'Dialog',
				useWhen: 'General-purpose modal without forced confirmation',
				snippet: `<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <!-- content -->
  </Dialog.Content>
</Dialog.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'window.confirm',
				reason: 'Browser native — blocks thread, no theming',
				fix: 'AlertDialog'
			},
			{
				pattern: 'Dialog for destructive confirmations',
				reason: 'AlertDialog enforces explicit confirm/cancel and prevents accidental dismissal',
				fix: 'AlertDialog'
			}
		],
		combinesWith: ['Button', 'Text']
	},

	{
		component: 'Drawer',
		useWhen:
			'Show a side panel that slides in from any edge for settings, filters, or detail views',
		alternatives: [
			{
				rank: 1,
				component: 'Drawer',
				useWhen: 'Side panel for filters, settings, or detail views',
				snippet: `<Drawer.Root>
  <Drawer.Trigger>Open panel</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>Settings</Drawer.Header>
    <!-- content -->
  </Drawer.Content>
</Drawer.Root>`
			},
			{
				rank: 2,
				component: 'Dialog',
				useWhen: 'Centered modal overlay instead of side panel',
				snippet: `<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content><!-- content --></Dialog.Content>
</Dialog.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'fixed positioned div for side panel',
				reason: 'Drawer handles animation, focus trap, backdrop, and ARIA',
				fix: 'Drawer'
			}
		],
		combinesWith: ['Button', 'Separator', 'Field.Root']
	},

	{
		component: 'Backdrop',
		useWhen: 'Full-screen overlay behind modals, drawers, or custom overlays',
		alternatives: [
			{
				rank: 1,
				component: 'Backdrop',
				useWhen: 'Overlay behind custom modals or drawers',
				snippet: `<Backdrop visible={isOpen} onclick={close} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'fixed div with opacity for overlay',
				reason: 'Backdrop handles z-index, animation, and theme-consistent dimming',
				fix: 'Backdrop'
			}
		],
		combinesWith: ['Dialog', 'Drawer', 'Spinner']
	},

	{
		component: 'ContextMenu',
		useWhen: 'Show a right-click menu with contextual actions',
		alternatives: [
			{
				rank: 1,
				component: 'ContextMenu',
				useWhen: 'Right-click actions on content areas',
				snippet: `<ContextMenu.Root>
  <ContextMenu.Trigger>
    <div>Right-click this area</div>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Copy</ContextMenu.Item>
    <ContextMenu.Item>Paste</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>`
			},
			{
				rank: 2,
				component: 'DropdownMenu',
				useWhen: 'Click-triggered action menu instead of right-click',
				snippet: `<DropdownMenu.Root>
  <DropdownMenu.Trigger><Button>Actions</Button></DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'custom right-click handler with positioned div',
				reason: 'ContextMenu handles positioning, keyboard nav, and ARIA',
				fix: 'ContextMenu'
			}
		],
		combinesWith: ['Table.Row', 'Card.Root', 'Tree']
	},

	{
		component: 'HoverCard',
		useWhen: 'Show a preview card when hovering over a trigger element',
		alternatives: [
			{
				rank: 1,
				component: 'HoverCard',
				useWhen: 'Rich preview on hover (user profiles, link previews)',
				snippet: `<HoverCard.Root>
  <HoverCard.Trigger>@username</HoverCard.Trigger>
  <HoverCard.Content>
    <p>User profile preview</p>
  </HoverCard.Content>
</HoverCard.Root>`
			},
			{
				rank: 2,
				component: 'Tooltip',
				useWhen: 'Simple text hint, not a full card',
				snippet: `<Tooltip.Root>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Content>Hint text</Tooltip.Content>
</Tooltip.Root>`
			},
			{
				rank: 3,
				component: 'LinkPreview',
				useWhen: 'Preview of a URL link on hover',
				snippet: `<LinkPreview.Root>
  <LinkPreview.Trigger href="https://example.com">Example</LinkPreview.Trigger>
  <LinkPreview.Content />
</LinkPreview.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'mouseenter/mouseleave with custom popup div',
				reason: 'HoverCard handles open/close delay, positioning, and accessibility',
				fix: 'HoverCard'
			}
		],
		combinesWith: ['Avatar', 'Text', 'Link']
	},

	{
		component: 'LinkPreview',
		useWhen: 'Show a link preview popup when hovering over a URL',
		alternatives: [
			{
				rank: 1,
				component: 'LinkPreview',
				useWhen: 'URL preview on hover',
				snippet: `<LinkPreview.Root>
  <LinkPreview.Trigger href="https://example.com">Example</LinkPreview.Trigger>
  <LinkPreview.Content />
</LinkPreview.Root>`
			},
			{
				rank: 2,
				component: 'HoverCard',
				useWhen: 'Custom hover preview not tied to URLs',
				snippet: `<HoverCard.Root>
  <HoverCard.Trigger>Trigger</HoverCard.Trigger>
  <HoverCard.Content>Preview content</HoverCard.Content>
</HoverCard.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Link', 'Text']
	},

	{
		component: 'Tooltip',
		useWhen: 'Display a brief text hint on hover or focus',
		alternatives: [
			{
				rank: 1,
				component: 'Tooltip',
				useWhen: 'Simple text hint for icon buttons or abbreviated labels',
				snippet: `<Tooltip.Root>
  <Tooltip.Trigger>
    <Button variant="ghost" aria-label="Settings">⚙</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Settings</Tooltip.Content>
</Tooltip.Root>`
			},
			{
				rank: 2,
				component: 'Popover',
				useWhen: 'Rich interactive content, not just a text label',
				snippet: `<Popover.Root>
  <Popover.Trigger>More info</Popover.Trigger>
  <Popover.Content>Rich content</Popover.Content>
</Popover.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'title= attribute',
				reason: 'Native tooltip — delayed, unstyled, inaccessible',
				fix: 'Tooltip'
			},
			{
				pattern: 'Tooltip with interactive content',
				reason: 'Tooltips should only contain text; use Popover for interactive content',
				fix: 'Popover'
			}
		],
		combinesWith: ['Button', 'Kbd', 'Toggle']
	},

	{
		component: 'Toast',
		useWhen: 'Show a temporary notification that auto-dismisses',
		alternatives: [
			{
				rank: 1,
				component: 'Toast',
				useWhen: 'Temporary success/error/info notification',
				snippet: `<Toast.Provider>
  <!-- in your event handler: toast.success('Changes saved') -->
</Toast.Provider>`
			},
			{
				rank: 2,
				component: 'Alert',
				useWhen: 'Persistent inline message in page content',
				snippet: `<Alert variant="success">
  {#snippet title()}Saved{/snippet}
  {#snippet description()}Your changes have been saved.{/snippet}
</Alert>`
			}
		],
		antiPatterns: [
			{
				pattern: 'custom notification div with setTimeout',
				reason: 'Toast handles stacking, animation, auto-dismiss, and ARIA live regions',
				fix: 'Toast'
			}
		],
		combinesWith: ['Button']
	},

	{
		component: 'NotificationCenter',
		useWhen: 'Show a notification panel with trigger, groups, and items',
		alternatives: [
			{
				rank: 1,
				component: 'NotificationCenter',
				useWhen: 'Full notification panel with grouped items',
				snippet: `<NotificationCenter.Root>
  <NotificationCenter.Trigger>
    <Button variant="ghost">Notifications</Button>
  </NotificationCenter.Trigger>
  <NotificationCenter.Panel>
    <NotificationCenter.Group label="Today">
      <NotificationCenter.Item id="1">New message</NotificationCenter.Item>
    </NotificationCenter.Group>
  </NotificationCenter.Panel>
</NotificationCenter.Root>`
			},
			{
				rank: 2,
				component: 'Toast',
				useWhen: 'Ephemeral notification without a panel',
				snippet: `<Toast.Provider />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Popover with custom notification list',
				reason: 'NotificationCenter handles grouping, read states, and consistent layout',
				fix: 'NotificationCenter'
			}
		],
		combinesWith: ['Badge', 'Avatar', 'Button']
	},

	{
		component: 'Tour',
		useWhen: 'Guide users through a step-by-step feature walkthrough',
		alternatives: [
			{
				rank: 1,
				component: 'Tour',
				useWhen: 'Step-by-step onboarding or feature tour with spotlight',
				snippet: `<Tour.Root steps={tourSteps} bind:active={showTour}>
  <Tour.Tooltip />
</Tour.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'external tour library',
				reason: 'DryUI Tour integrates with the theme system and component library',
				fix: 'Tour'
			}
		],
		combinesWith: ['Button', 'Popover', 'Stepper']
	},

	// ── Selection / Input (missing) ────────────────────────────────────────

	{
		component: 'Combobox',
		useWhen: 'Searchable dropdown for selecting from a filterable list of options',
		alternatives: [
			{
				rank: 1,
				component: 'Combobox',
				useWhen: 'Filterable single-select dropdown with search',
				snippet: `<Combobox.Root bind:value={choice}>
  <Combobox.Input placeholder="Search..." />
  <Combobox.Content>
    <Combobox.Item value="a" index={0}>Option A</Combobox.Item>
    <Combobox.Item value="b" index={1}>Option B</Combobox.Item>
  </Combobox.Content>
</Combobox.Root>`
			},
			{
				rank: 2,
				component: 'Select',
				useWhen: 'Fixed option list without search',
				snippet: `<Select.Root bind:value={choice}>
  <Select.Trigger><Select.Value placeholder="Choose..." /></Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
  </Select.Content>
</Select.Root>`
			},
			{
				rank: 3,
				component: 'MultiSelectCombobox',
				useWhen: 'Searchable multi-select with removable tokens',
				snippet: `<MultiSelectCombobox.Root bind:value={items}>
  <MultiSelectCombobox.Input placeholder="Search..." />
  <MultiSelectCombobox.Content>
    <MultiSelectCombobox.Item value="a">A</MultiSelectCombobox.Item>
  </MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Input + custom dropdown for search',
				reason: 'Combobox handles filtering, keyboard nav, and ARIA combobox pattern',
				fix: 'Combobox'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'Listbox',
		useWhen: 'Scrollable list for selecting one or multiple items without a dropdown',
		alternatives: [
			{
				rank: 1,
				component: 'Listbox',
				useWhen: 'Inline selectable list (always visible)',
				snippet: `<Listbox.Root bind:value={selected}>
  <Listbox.Item value="a">Option A</Listbox.Item>
  <Listbox.Item value="b">Option B</Listbox.Item>
</Listbox.Root>`
			},
			{
				rank: 2,
				component: 'Select',
				useWhen: 'Dropdown select (collapsed by default)',
				snippet: `<Select.Root bind:value={choice}>
  <Select.Trigger><Select.Value /></Select.Trigger>
  <Select.Content>
    <Select.Item value="a">A</Select.Item>
  </Select.Content>
</Select.Root>`
			},
			{
				rank: 3,
				component: 'RadioGroup',
				useWhen: 'Small number of mutually exclusive choices',
				snippet: `<RadioGroup.Root bind:value={choice}>
  <RadioGroup.Item value="a">A</RadioGroup.Item>
</RadioGroup.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<select multiple>',
				reason: 'Native multi-select is hard to use and unstyled',
				fix: 'Listbox'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'RadioGroup',
		useWhen: 'Select one option from a small set of mutually exclusive choices',
		alternatives: [
			{
				rank: 1,
				component: 'RadioGroup',
				useWhen: 'Few visible choices (2-6 options)',
				snippet: `<RadioGroup.Root bind:value={choice}>
  <RadioGroup.Item value="a">Option A</RadioGroup.Item>
  <RadioGroup.Item value="b">Option B</RadioGroup.Item>
</RadioGroup.Root>`
			},
			{
				rank: 2,
				component: 'Select',
				useWhen: 'Many options that should be in a dropdown',
				snippet: `<Select.Root bind:value={choice}>
  <Select.Trigger><Select.Value /></Select.Trigger>
  <Select.Content>
    <Select.Item value="a">A</Select.Item>
  </Select.Content>
</Select.Root>`
			},
			{
				rank: 3,
				component: 'SegmentedControl',
				useWhen: 'Compact toggle between 2-4 options',
				snippet: `<SegmentedControl bind:value={choice} options={[
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="radio">',
				reason: 'Native radio — no theming, inconsistent styling',
				fix: 'RadioGroup'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'SegmentedControl',
		useWhen: 'Toggle between 2-4 mutually exclusive options in a compact button-like control',
		alternatives: [
			{
				rank: 1,
				component: 'SegmentedControl',
				useWhen: 'Compact toggle (grid/list view, day/week/month)',
				snippet: `<SegmentedControl bind:value={view} options={[
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]} />`
			},
			{
				rank: 2,
				component: 'Tabs',
				useWhen: 'Switching between content panels (not just a value)',
				snippet: `<Tabs.Root bind:value={tab}>
  <Tabs.List>
    <Tabs.Trigger value="a">A</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">Content A</Tabs.Content>
</Tabs.Root>`
			},
			{
				rank: 3,
				component: 'RadioGroup',
				useWhen: 'More than 4 options or vertical layout',
				snippet: `<RadioGroup.Root bind:value={choice}>
  <RadioGroup.Item value="a">A</RadioGroup.Item>
</RadioGroup.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Button group for exclusive selection',
				reason: 'SegmentedControl provides built-in selection state and ARIA',
				fix: 'SegmentedControl'
			}
		],
		combinesWith: ['Card.Header', 'Toolbar']
	},

	{
		component: 'ThemeToggle',
		useWhen:
			'Persistent dark/light theme switcher in an app header or settings surface, with a system-preference default',
		alternatives: [
			{
				rank: 1,
				component: 'ThemeToggle',
				useWhen: 'One-click dark/light switcher with Alt-click or Escape to return to system mode',
				snippet: `<ThemeToggle storageKey="my-app-theme" />`
			},
			{
				rank: 2,
				component: 'SegmentedControl',
				useWhen: 'Explicit three-way picker (system / light / dark) in a settings panel',
				snippet: `<SegmentedControl bind:value={themeMode} options={[
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]} />`
			},
			{
				rank: 3,
				component: 'createThemeController',
				useWhen: 'Custom trigger or programmatic access to mode/isDark without the default UI',
				snippet: `const theme = createThemeController({ storageKey: 'my-app-theme' });
// theme.mode, theme.isDark, theme.setMode('dark'), theme.reset()`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="checkbox" onchange={toggleDark}>',
				reason:
					'Raw checkbox bypasses the theme-auto class, data-theme attribute, and flash-prevention script',
				fix: 'ThemeToggle'
			},
			{
				pattern: '<button onclick={() => document.documentElement.classList.toggle("dark")}>',
				reason:
					'Does not persist the choice, ignores prefers-color-scheme, and causes a flash on the next load',
				fix: 'ThemeToggle'
			},
			{
				pattern: 'Swapping CSS files from JavaScript to change theme',
				reason:
					'Forces a network round-trip and a repaint; the DryUI theme system uses a single set of tokens gated by data-theme and theme-auto',
				fix: 'ThemeToggle'
			}
		],
		combinesWith: ['AppFrame', 'Toolbar', 'NavigationMenu', 'Sidebar', 'Tooltip']
	},

	{
		component: 'Toggle',
		useWhen:
			'Pressable button that toggles between active and inactive states, or on/off toggle with immediate effect',
		alternatives: [
			{
				rank: 1,
				component: 'Toggle',
				useWhen: 'Single toggle button (bold, italic, mute)',
				snippet: `<Toggle bind:pressed={active}>Bold</Toggle>`
			},
			{
				rank: 2,
				component: 'ToggleGroup',
				useWhen: 'Group of toggles with single or multiple selection',
				snippet: `<ToggleGroup.Root bind:value={selection} type="multiple">
  <ToggleGroup.Item value="bold">B</ToggleGroup.Item>
  <ToggleGroup.Item value="italic">I</ToggleGroup.Item>
</ToggleGroup.Root>`
			},
			{
				rank: 3,
				component: 'Checkbox',
				useWhen: 'Boolean toggle in a form (submitted with form data)',
				snippet: `<Checkbox bind:checked={agreed} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Button with manual active state',
				reason: 'Toggle handles pressed state and aria-pressed automatically',
				fix: 'Toggle'
			}
		],
		combinesWith: ['Toolbar', 'ToggleGroup', 'Field.Root', 'Label', 'Text']
	},

	{
		component: 'ToggleGroup',
		useWhen: 'Group of toggle buttons with single or multiple selection',
		alternatives: [
			{
				rank: 1,
				component: 'ToggleGroup',
				useWhen: 'Toolbar formatting buttons (bold, italic, underline)',
				snippet: `<ToggleGroup.Root bind:value={formatting} type="multiple">
  <ToggleGroup.Item value="bold">B</ToggleGroup.Item>
  <ToggleGroup.Item value="italic">I</ToggleGroup.Item>
  <ToggleGroup.Item value="underline">U</ToggleGroup.Item>
</ToggleGroup.Root>`
			},
			{
				rank: 2,
				component: 'SegmentedControl',
				useWhen: 'Exclusive selection from 2-4 options',
				snippet: `<SegmentedControl bind:value={view} options={[...]} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Multiple Toggle components without ToggleGroup',
				reason: 'ToggleGroup manages group selection state and keyboard nav',
				fix: 'ToggleGroup'
			}
		],
		combinesWith: ['Toolbar', 'Card.Header']
	},

	{
		component: 'Transfer',
		useWhen: 'Move items between two persistent lists (available/selected)',
		alternatives: [
			{
				rank: 1,
				component: 'Transfer',
				useWhen: 'Dual-list selection with move controls',
				snippet: `<Transfer.Root {sourceItems} {targetItems}>
  <Transfer.List type="source" title="Available" />
  <Transfer.Actions />
  <Transfer.List type="target" title="Selected" />
</Transfer.Root>`
			},
			{
				rank: 2,
				component: 'MultiSelectCombobox',
				useWhen: 'Compact multi-select with tokens (fewer items)',
				snippet: `<MultiSelectCombobox.Root bind:value={selected}>
  <MultiSelectCombobox.Input placeholder="Search..." />
  <MultiSelectCombobox.Content>
    <MultiSelectCombobox.Item value="a">A</MultiSelectCombobox.Item>
  </MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Two Listbox components with custom move logic',
				reason: 'Transfer handles item movement, keyboard nav, and consistent layout',
				fix: 'Transfer'
			}
		],
		combinesWith: ['Card.Content', 'Field.Root', 'Label']
	},

	{
		component: 'DragAndDrop',
		useWhen: 'Reorder items in a list via drag or keyboard',
		alternatives: [
			{
				rank: 1,
				component: 'DragAndDrop',
				useWhen: 'Reorderable list with drag handles and keyboard support',
				snippet: `<DragAndDrop.Root bind:items={orderedItems} onReorder={(items) => orderedItems = items}>
  {#each orderedItems as item, i (item.id)}
    <DragAndDrop.Item index={i}>{item.label}</DragAndDrop.Item>
  {/each}
</DragAndDrop.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'external drag-and-drop library',
				reason: 'DryUI DragAndDrop is zero-dependency with keyboard accessibility',
				fix: 'DragAndDrop'
			}
		],
		combinesWith: ['List', 'Card.Content']
	},

	// ── Form Inputs (missing) ──────────────────────────────────────────────

	{
		component: 'Textarea',
		useWhen: 'Multi-line text input for longer content',
		alternatives: [
			{
				rank: 1,
				component: 'Textarea',
				useWhen: 'Multi-line text (comments, descriptions, messages)',
				snippet: `<Textarea bind:value={text} rows={4} placeholder="Enter description..." />`
			},
			{
				rank: 2,
				component: 'RichTextEditor',
				useWhen: 'Formatted text with bold, italic, lists',
				snippet: `<RichTextEditor bind:value={html} />`
			},
			{
				rank: 3,
				component: 'PromptInput',
				useWhen: 'Chat or AI prompt input with submit action',
				snippet: `<PromptInput bind:value={message} onsubmit={handleSend} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<textarea>',
				reason: 'Native textarea — no theming, no consistent sizing',
				fix: 'Textarea'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'NumberInput',
		useWhen: 'Numeric input with increment/decrement controls',
		alternatives: [
			{
				rank: 1,
				component: 'NumberInput',
				useWhen: 'Precise numeric entry with step buttons',
				snippet: `<NumberInput bind:value={num} min={0} max={100} step={1} />`
			},
			{
				rank: 2,
				component: 'Slider',
				useWhen: 'Visual range selection by dragging',
				snippet: `<Slider bind:value={num} min={0} max={100} />`
			},
			{
				rank: 3,
				component: 'Input',
				useWhen: 'Simple numeric text input without step buttons',
				snippet: `<Input type="number" bind:value={num} />`
			}
		],
		antiPatterns: [
			{
				pattern: '<input type="number">',
				reason: 'Native number input — no theming, inconsistent step buttons',
				fix: 'NumberInput'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'PhoneInput',
		useWhen: 'Phone number input with country code selector',
		alternatives: [
			{
				rank: 1,
				component: 'PhoneInput',
				useWhen: 'International phone number with country code',
				snippet: `<PhoneInput bind:value={phone} defaultCountry="US" />`
			},
			{
				rank: 2,
				component: 'Input',
				useWhen: 'Simple phone number without country code',
				snippet: `<Input type="tel" bind:value={phone} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Input + Select for phone with country code',
				reason: 'PhoneInput handles formatting, validation, and flag display',
				fix: 'PhoneInput'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'PinInput',
		useWhen: 'Segmented input for PIN, OTP, or verification codes',
		alternatives: [
			{
				rank: 1,
				component: 'PinInput',
				useWhen: 'PIN or OTP verification code entry',
				snippet: `<PinInput bind:value={pin} length={6} />`
			},
			{
				rank: 2,
				component: 'Input',
				useWhen: 'Simple text input for codes without segment display',
				snippet: `<Input bind:value={code} maxlength={6} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Multiple Input components for OTP digits',
				reason: 'PinInput manages focus movement, paste, and single hidden input',
				fix: 'PinInput'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'PromptInput',
		useWhen: 'Chat or AI prompt input with auto-resize and submit action',
		alternatives: [
			{
				rank: 1,
				component: 'PromptInput',
				useWhen: 'Chat-style input with submit button',
				snippet: `<PromptInput bind:value={message} onsubmit={handleSend} placeholder="Type a message..." />`
			},
			{
				rank: 2,
				component: 'Textarea',
				useWhen: 'Multi-line text without submit action',
				snippet: `<Textarea bind:value={text} rows={4} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Textarea + Button for chat input',
				reason: 'PromptInput handles auto-resize, enter-to-submit, and submit button',
				fix: 'PromptInput'
			}
		],
		combinesWith: ['ChatThread', 'Card.Content']
	},

	{
		component: 'RichTextEditor',
		useWhen: 'Edit formatted text with a toolbar for bold, italic, lists, etc.',
		alternatives: [
			{
				rank: 1,
				component: 'RichTextEditor',
				useWhen: 'Formatted text editing with toolbar',
				snippet: `<RichTextEditor bind:value={html} />`
			},
			{
				rank: 2,
				component: 'Textarea',
				useWhen: 'Plain text editing without formatting',
				snippet: `<Textarea bind:value={text} rows={4} />`
			},
			{
				rank: 3,
				component: 'MarkdownRenderer',
				useWhen: 'Display-only rendered markdown',
				snippet: `<MarkdownRenderer content={markdownString} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'contenteditable div without toolbar',
				reason: 'RichTextEditor provides consistent formatting toolbar and output',
				fix: 'RichTextEditor'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'Rating',
		useWhen: 'Star rating input with half-star support',
		alternatives: [
			{
				rank: 1,
				component: 'Rating',
				useWhen: 'Interactive star rating (user reviews)',
				snippet: `<Rating bind:value={stars} max={5} />`
			},
			{
				rank: 2,
				component: 'Rating',
				useWhen: 'Display-only star rating or hotel classification',
				snippet: `<Rating value={4} readonly max={5} />`
			},
			{
				rank: 3,
				component: 'Slider',
				useWhen: 'Numeric rating on a continuous scale',
				snippet: `<Slider bind:value={rating} min={1} max={10} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom star icons with click handlers',
				reason: 'Rating handles half-star, keyboard, and ARIA automatically',
				fix: 'Rating'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Text', 'Card.Content']
	},

	{
		component: 'DateField',
		useWhen: 'Compact inline date input with segmented editing',
		alternatives: [
			{
				rank: 1,
				component: 'DateField',
				useWhen: 'Inline date entry with individual segment editing',
				snippet: `<DateField bind:value={date} />`
			},
			{
				rank: 2,
				component: 'DatePicker',
				useWhen: 'Date selection with a calendar popup',
				snippet: `<DatePicker.Root bind:value={date}>
  <DatePicker.Trigger placeholder="Pick a date" />
  <DatePicker.Content><DatePicker.Calendar /></DatePicker.Content>
</DatePicker.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Input with date pattern mask',
				reason: 'DateField handles segment navigation, validation, and locale formatting',
				fix: 'DateField'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'DateRangePicker',
		useWhen: 'Select a start and end date range with a calendar popup',
		alternatives: [
			{
				rank: 1,
				component: 'DateRangePicker',
				useWhen: 'Date range with calendar popup (check-in/check-out, filters)',
				snippet: `<DateRangePicker.Root bind:startDate bind:endDate>
  <DateRangePicker.Trigger placeholder="Select dates" />
  <DateRangePicker.Content>
    <DateRangePicker.Calendar />
  </DateRangePicker.Content>
</DateRangePicker.Root>`
			},
			{
				rank: 2,
				component: 'RangeCalendar',
				useWhen: 'Standalone range calendar without popup',
				snippet: `<RangeCalendar bind:startDate bind:endDate />`
			},
			{
				rank: 3,
				component: 'DatePicker',
				useWhen: 'Single date only, not a range',
				snippet: `<DatePicker.Root bind:value={date}>
  <DatePicker.Trigger placeholder="Pick a date" />
  <DatePicker.Content><DatePicker.Calendar /></DatePicker.Content>
</DatePicker.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Two DatePicker components for range',
				reason: 'DateRangePicker enforces start < end and provides connected calendar display',
				fix: 'DateRangePicker'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'DateTimeInput',
		useWhen: 'Combined date and time input in a single control',
		alternatives: [
			{
				rank: 1,
				component: 'DateTimeInput',
				useWhen: 'Date and time together (event scheduling, deadlines)',
				snippet: `<DateTimeInput bind:value={dateTime} />`
			},
			{
				rank: 2,
				component: 'DatePicker',
				useWhen: 'Date only, no time needed',
				snippet: `<DatePicker.Root bind:value={date}>
  <DatePicker.Trigger placeholder="Pick a date" />
  <DatePicker.Content><DatePicker.Calendar /></DatePicker.Content>
</DatePicker.Root>`
			},
			{
				rank: 3,
				component: 'TimeInput',
				useWhen: 'Time only, no date needed',
				snippet: `<TimeInput bind:value={time} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'DatePicker + TimeInput side by side',
				reason: 'DateTimeInput combines both in a single accessible control with locale segments',
				fix: 'DateTimeInput'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'RangeCalendar',
		useWhen: 'Standalone calendar for selecting a date range without a popup',
		alternatives: [
			{
				rank: 1,
				component: 'RangeCalendar',
				useWhen: 'Inline date range calendar (always visible)',
				snippet: `<RangeCalendar bind:startDate bind:endDate />`
			},
			{
				rank: 2,
				component: 'DateRangePicker',
				useWhen: 'Date range with popup trigger',
				snippet: `<DateRangePicker.Root bind:startDate bind:endDate>
  <DateRangePicker.Trigger placeholder="Select dates" />
  <DateRangePicker.Content><DateRangePicker.Calendar /></DateRangePicker.Content>
</DateRangePicker.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Card.Content']
	},

	// ── Form Structure (missing) ───────────────────────────────────────────

	{
		component: 'Fieldset',
		useWhen: 'Group related form fields under a legend',
		alternatives: [
			{
				rank: 1,
				component: 'Fieldset',
				useWhen: 'Form section with legend and grouped fields',
				snippet: `<Fieldset.Root>
  <Fieldset.Legend>Personal Info</Fieldset.Legend>
  <div class="fields">
    <Field.Root>
      <Label>First name</Label>
      <Input bind:value={firstName} />
    </Field.Root>
    <Field.Root>
      <Label>Last name</Label>
      <Input bind:value={lastName} />
    </Field.Root>
  </div>
</Fieldset.Root>

<style>
  .fields { display: grid; gap: var(--dry-space-4); }
</style>`
			}
		],
		antiPatterns: [
			{
				pattern: '<fieldset>',
				reason: 'Native fieldset — no theming, no consistent spacing',
				fix: 'Fieldset'
			},
			{
				pattern: 'Card.Root to group form fields',
				reason: 'Fieldset is semantically correct for form grouping with <legend>',
				fix: 'Fieldset'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Card.Content']
	},

	{
		component: 'Label',
		useWhen: 'Form label for input elements',
		alternatives: [
			{
				rank: 1,
				component: 'Label',
				useWhen: 'Label associated with a form input',
				snippet: `<Label>Email address</Label>`
			}
		],
		antiPatterns: [
			{ pattern: '<label>', reason: 'Native label — no theming or size variants', fix: 'Label' },
			{
				pattern: 'Text component as form label',
				reason: 'Label handles for/id binding and accessible association with inputs',
				fix: 'Label'
			}
		],
		combinesWith: ['Field.Root', 'Input', 'Select', 'Checkbox', 'Toggle']
	},

	{
		component: 'Container',
		useWhen: 'Center page content with a max-width constraint',
		alternatives: [
			{
				rank: 1,
				component: 'Container',
				useWhen: 'Centered max-width page wrapper',
				snippet: `<Container>
  <h1>Page content</h1>
</Container>`
			}
		],
		antiPatterns: [
			{
				pattern: 'max-width + margin auto',
				reason: 'Container handles responsive max-width and padding',
				fix: 'Container'
			},
			{
				pattern: 'max-width + margin: 0 auto in custom CSS',
				reason: 'Container handles responsive max-width with size variants and consistent padding.',
				fix: '<Container size="lg">'
			}
		],
		combinesWith: []
	},

	{
		component: 'AspectRatio',
		useWhen: 'Constrain child content to a specific aspect ratio',
		alternatives: [
			{
				rank: 1,
				component: 'AspectRatio',
				useWhen: 'Maintain aspect ratio for images, videos, or embeds',
				snippet: `<AspectRatio ratio={16/9}>
  <Image src="/hero.jpg" alt="Hero" />
</AspectRatio>`
			}
		],
		antiPatterns: [
			{
				pattern: 'padding-bottom hack for aspect ratio',
				reason: 'AspectRatio uses the native CSS aspect-ratio property',
				fix: 'AspectRatio'
			}
		],
		combinesWith: ['Image', 'VideoEmbed', 'Card.Content']
	},

	{
		component: 'ScrollArea',
		useWhen: 'Custom scrollable area with styled scrollbars',
		alternatives: [
			{
				rank: 1,
				component: 'ScrollArea',
				useWhen: 'Scrollable container with themed scrollbars',
				snippet: `<ScrollArea style="height: 300px;">
  <!-- long content -->
</ScrollArea>`
			}
		],
		antiPatterns: [
			{
				pattern: 'overflow: auto with custom scrollbar CSS',
				reason: 'ScrollArea provides cross-browser consistent styled scrollbars',
				fix: 'ScrollArea'
			}
		],
		combinesWith: ['List', 'Card.Content', 'Sidebar']
	},

	{
		component: 'Spacer',
		useWhen: 'Add empty space between elements',
		alternatives: [
			{
				rank: 1,
				component: 'Spacer',
				useWhen: 'Fixed or flexible whitespace',
				snippet: `<Spacer size="lg" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Empty div with margin or height for spacing',
				reason: 'Spacer is explicit and uses theme spacing tokens',
				fix: 'Spacer'
			}
		],
		combinesWith: []
	},

	{
		component: 'Splitter',
		useWhen: 'Resizable split panels with a drag handle',
		alternatives: [
			{
				rank: 1,
				component: 'Splitter',
				useWhen: 'Resizable side-by-side or stacked panels',
				snippet: `<Splitter.Root>
  <Splitter.Panel>Left panel</Splitter.Panel>
  <Splitter.Handle />
  <Splitter.Panel>Right panel</Splitter.Panel>
</Splitter.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom drag resize with mouse events',
				reason: 'Splitter handles resize, keyboard control, and min/max constraints',
				fix: 'Splitter'
			}
		],
		combinesWith: ['Card.Content', 'ScrollArea']
	},

	// ── Navigation (missing) ──────────────────────────────────────────────

	{
		component: 'NavigationMenu',
		useWhen: 'Site-level navigation with flyout content panels',
		alternatives: [
			{
				rank: 1,
				component: 'NavigationMenu',
				useWhen: 'Navigation with rich flyout content panels',
				snippet: `<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div class="nav-links">
          <Link href="/product-a">Product A</Link>
          <Link href="/product-b">Product B</Link>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>

<style>
  .nav-links { display: grid; gap: var(--dry-space-4); }
</style>`
			},
			{
				rank: 2,
				component: 'MegaMenu',
				useWhen: 'Large dropdown panels with multiple columns',
				snippet: `<MegaMenu.Root>
  <MegaMenu.Trigger>Products</MegaMenu.Trigger>
  <MegaMenu.Content>
    <MegaMenu.Column>
      <MegaMenu.Item href="/a">A</MegaMenu.Item>
    </MegaMenu.Column>
  </MegaMenu.Content>
</MegaMenu.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'DropdownMenu for site navigation',
				reason: 'NavigationMenu is designed for nav links with proper ARIA navigation roles',
				fix: 'NavigationMenu'
			}
		],
		combinesWith: ['Link', 'Card']
	},

	{
		component: 'MegaMenu',
		useWhen: 'Large navigation dropdown with multiple columns',
		alternatives: [
			{
				rank: 1,
				component: 'MegaMenu',
				useWhen: 'Wide multi-column navigation panel',
				snippet: `<MegaMenu.Root>
  <MegaMenu.Trigger>Products</MegaMenu.Trigger>
  <MegaMenu.Content>
    <MegaMenu.Column>
      <MegaMenu.Item href="/a">Product A</MegaMenu.Item>
      <MegaMenu.Item href="/b">Product B</MegaMenu.Item>
    </MegaMenu.Column>
    <MegaMenu.Column>
      <MegaMenu.Item href="/c">Product C</MegaMenu.Item>
    </MegaMenu.Column>
  </MegaMenu.Content>
</MegaMenu.Root>`
			},
			{
				rank: 2,
				component: 'NavigationMenu',
				useWhen: 'Simpler flyout panels, not full-width',
				snippet: `<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
      <NavigationMenu.Content>Panel</NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Absolute-positioned div for mega dropdown',
				reason: 'MegaMenu handles positioning, columns, keyboard nav, and accessibility',
				fix: 'MegaMenu'
			}
		],
		combinesWith: ['Link', 'Image']
	},

	{
		component: 'Menubar',
		useWhen: 'Horizontal menu bar with dropdown menus (desktop app style)',
		alternatives: [
			{
				rank: 1,
				component: 'Menubar',
				useWhen: 'Application menu bar (File, Edit, View)',
				snippet: `<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item>New</Menubar.Item>
      <Menubar.Item>Open</Menubar.Item>
      <Menubar.Separator />
      <Menubar.Item>Save</Menubar.Item>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>`
			},
			{
				rank: 2,
				component: 'Toolbar',
				useWhen: 'Row of action buttons without dropdown menus',
				snippet: `<Toolbar.Root>
  <Toolbar.Button>Save</Toolbar.Button>
</Toolbar.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Kbd', 'Separator']
	},

	{
		component: 'TableOfContents',
		useWhen: 'Auto-generated navigation from page headings',
		alternatives: [
			{
				rank: 1,
				component: 'TableOfContents',
				useWhen: 'In-page navigation from headings',
				snippet: `<TableOfContents />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Manual anchor links list',
				reason: 'TableOfContents generates links from headings automatically',
				fix: 'TableOfContents'
			}
		],
		combinesWith: ['ScrollArea', 'Sidebar']
	},

	{
		component: 'Toolbar',
		useWhen: 'Horizontal button group for actions and toggles',
		alternatives: [
			{
				rank: 1,
				component: 'Toolbar',
				useWhen: 'Row of grouped action buttons',
				snippet: `<Toolbar.Root>
  <Toolbar.Group>
    <Toolbar.Button>Bold</Toolbar.Button>
    <Toolbar.Button>Italic</Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toolbar.Button>Undo</Toolbar.Button>
  </Toolbar.Group>
</Toolbar.Root>`
			},
			{
				rank: 2,
				component: 'ButtonGroup',
				useWhen: 'Simple button group without separators or toolbar semantics',
				snippet: `<ButtonGroup>
  <Button>Save</Button>
  <Button>Cancel</Button>
</ButtonGroup>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Manual toolbar row with buttons',
				reason: 'Toolbar provides ARIA toolbar role and keyboard arrow navigation',
				fix: 'Toolbar'
			}
		],
		combinesWith: ['ToggleGroup', 'Button', 'Separator', 'RichTextEditor']
	},

	{
		component: 'Link',
		useWhen: 'Styled anchor element with external and disabled states',
		alternatives: [
			{
				rank: 1,
				component: 'Link',
				useWhen: 'Styled navigation or text link',
				snippet: `<Link href="/about">About us</Link>`
			},
			{
				rank: 2,
				component: 'Button',
				useWhen: 'Link that looks like a button',
				snippet: `<Button href="/about" variant="outline">About us</Button>`
			}
		],
		antiPatterns: [
			{
				pattern: '<a> without theming',
				reason: 'Link provides consistent styling, external indicators, and disabled states',
				fix: 'Link'
			}
		],
		combinesWith: ['Text', 'Breadcrumb']
	},

	// ── Actions (missing) ─────────────────────────────────────────────────

	{
		component: 'ButtonGroup',
		useWhen: 'Group related buttons with shared styling and attached borders',
		alternatives: [
			{
				rank: 1,
				component: 'ButtonGroup',
				useWhen: 'Attached button group (save/cancel, pagination prev/next)',
				snippet: `<ButtonGroup>
  <Button variant="outline">Previous</Button>
  <Button variant="outline">Next</Button>
</ButtonGroup>`
			},
			{
				rank: 2,
				component: 'Toolbar',
				useWhen: 'Separated button groups with toolbar semantics',
				snippet: `<Toolbar.Root>
  <Toolbar.Group>
    <Toolbar.Button>A</Toolbar.Button>
    <Toolbar.Button>B</Toolbar.Button>
  </Toolbar.Group>
</Toolbar.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Adjacent buttons without grouping',
				reason: 'ButtonGroup removes inner border radii for a connected appearance',
				fix: 'ButtonGroup'
			}
		],
		combinesWith: ['Button']
	},

	{
		component: 'Chip',
		useWhen: 'Interactive pill for filters, selections, or inline state toggles',
		alternatives: [
			{
				rank: 1,
				component: 'Chip',
				useWhen: 'Interactive filter pill or selection chip',
				snippet: `<Chip selected={isActive} onclick={toggle}>Category</Chip>`
			},
			{
				rank: 2,
				component: 'Badge',
				useWhen: 'Non-interactive status indicator',
				snippet: `<Badge variant="soft">Active</Badge>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Badge with onclick for filtering',
				reason: 'Badge is a display-only label; use Chip for interactive selection',
				fix: 'Chip'
			}
		],
		combinesWith: ['ChipGroup', 'Card.Content']
	},

	{
		component: 'ChipGroup',
		useWhen:
			'Wrapping cluster of Badge, Chip, or tag children; also handles single/multi-select chip filters',
		alternatives: [
			{
				rank: 1,
				component: 'ChipGroup',
				useWhen: 'Responsive wrapping row of Badge/tag children (e.g. "WORKS WITH" provider list)',
				snippet: `<ChipGroup.Root gap="md">
  <ChipGroup.Label>WORKS WITH</ChipGroup.Label>
  <Badge variant="soft">Local/MLX</Badge>
  <Badge variant="soft">OpenAI</Badge>
  <Badge variant="soft">Anthropic</Badge>
</ChipGroup.Root>`
			},
			{
				rank: 2,
				component: 'ChipGroup',
				useWhen: 'Filter chip group with selection state',
				snippet: `<ChipGroup.Root type="multiple" bind:value={selected}>
  <ChipGroup.Item value="new">New</ChipGroup.Item>
  <ChipGroup.Item value="sale">Sale</ChipGroup.Item>
  <ChipGroup.Item value="popular">Popular</ChipGroup.Item>
</ChipGroup.Root>`
			},
			{
				rank: 3,
				component: 'SegmentedControl',
				useWhen: 'Exclusive selection from 2-4 options in a compact control',
				snippet: `<SegmentedControl bind:value={choice} options={[...]} />`
			},
			{
				rank: 4,
				component: 'ToggleGroup',
				useWhen: 'Toggle buttons for toolbar actions',
				snippet: `<ToggleGroup.Root bind:value={selection} type="multiple">
  <ToggleGroup.Item value="a">A</ToggleGroup.Item>
</ToggleGroup.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<div> with display: flex; flex-wrap: wrap for chips',
				reason:
					'dryui/no-flex bans raw flex-wrap. ChipGroup.Root is the sanctioned wrapper and carries the data-chip-group carve-out.',
				fix: 'ChipGroup.Root'
			},
			{
				pattern: '<div> with grid-template-columns: repeat(N, max-content) for tag rows',
				reason:
					'Hand-rolled grid breakpoints fight content-driven wrapping. ChipGroup.Root handles it in one prop.',
				fix: 'ChipGroup.Root'
			},
			{
				pattern: 'Multiple Chip components without ChipGroup',
				reason: 'ChipGroup manages layout, selection state, and keyboard navigation',
				fix: 'ChipGroup.Root'
			}
		],
		combinesWith: ['Badge', 'Chip', 'Tag', 'Card.Content']
	},

	{
		component: 'Clipboard',
		useWhen: 'Copy text to clipboard with native Clipboard API',
		alternatives: [
			{
				rank: 1,
				component: 'Clipboard',
				useWhen: 'Copy-to-clipboard button or trigger',
				snippet: `<Clipboard text={copyText}>
  <Button variant="ghost">Copy</Button>
</Clipboard>`
			}
		],
		antiPatterns: [
			{
				pattern: 'navigator.clipboard.writeText in component',
				reason: 'Clipboard handles the API call, feedback state, and error handling',
				fix: 'Clipboard'
			}
		],
		combinesWith: ['Button', 'CodeBlock', 'Input', 'Tooltip']
	},

	{
		component: 'FloatButton',
		useWhen: 'Floating action button with optional expandable actions',
		alternatives: [
			{
				rank: 1,
				component: 'FloatButton',
				useWhen: 'Floating action button (FAB) in bottom-right corner',
				snippet: `<FloatButton.Root>
  <FloatButton.Action icon="plus" label="Create" />
  <FloatButton.Action icon="upload" label="Upload" />
</FloatButton.Root>`
			},
			{
				rank: 2,
				component: 'Button',
				useWhen: 'Inline action button (not floating)',
				snippet: `<Button variant="solid">Create</Button>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Fixed-position button in bottom corner',
				reason: 'FloatButton handles positioning, expandable actions, and animation',
				fix: 'FloatButton'
			}
		],
		combinesWith: ['Tooltip']
	},

	{
		component: 'ScrollToTop',
		useWhen: 'Button that scrolls to the top of the page or container',
		alternatives: [
			{
				rank: 1,
				component: 'ScrollToTop',
				useWhen: 'Back-to-top button that appears on scroll',
				snippet: `<ScrollToTop />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom scroll-to-top with scroll listener',
				reason: 'ScrollToTop handles visibility, smooth scroll, and positioning',
				fix: 'ScrollToTop'
			}
		],
		combinesWith: ['Container']
	},

	// ── Display / Data (missing) ──────────────────────────────────────────

	{
		component: 'Image',
		useWhen: 'Display an image with loading states and fallback',
		alternatives: [
			{
				rank: 1,
				component: 'Image',
				useWhen: 'Content image with loading/error fallback',
				snippet: `<Image src="/photo.jpg" alt="Description" fallback="/placeholder.jpg" />`
			},
			{
				rank: 2,
				component: 'Avatar',
				useWhen: 'Person or entity image (circular with initials fallback)',
				snippet: `<Avatar src="/photo.jpg" alt="Jane" fallback="J" />`
			}
		],
		antiPatterns: [
			{
				pattern: '<img>',
				reason: 'Bare img — no loading state, no fallback, no theming',
				fix: 'Image'
			}
		],
		combinesWith: ['AspectRatio', 'Card.Content', 'Carousel']
	},

	{
		component: 'Carousel',
		useWhen: 'Scrollable content carousel with slide navigation',
		alternatives: [
			{
				rank: 1,
				component: 'Carousel',
				useWhen: 'Horizontal content carousel with prev/next controls',
				snippet: `<Carousel.Root>
  <Carousel.Viewport>
    <Carousel.Slide>Slide 1</Carousel.Slide>
    <Carousel.Slide>Slide 2</Carousel.Slide>
    <Carousel.Slide>Slide 3</Carousel.Slide>
  </Carousel.Viewport>
  <Carousel.Prev />
  <Carousel.Next />
</Carousel.Root>`
			},
			{
				rank: 2,
				component: 'Tabs',
				useWhen: 'Content panels selected by tab (not swipable)',
				snippet: `<Tabs.Root bind:value={tab}>
  <Tabs.List>
    <Tabs.Trigger value="a">A</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">Content A</Tabs.Content>
</Tabs.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom scroll snap for carousel',
				reason: 'Carousel handles navigation controls, indicators, and keyboard support',
				fix: 'Carousel'
			}
		],
		combinesWith: ['Image', 'Card', 'AspectRatio']
	},

	{
		component: 'DataGrid',
		useWhen: 'Enhanced data table with sorting, filtering, and pagination',
		alternatives: [
			{
				rank: 1,
				component: 'DataGrid',
				useWhen: 'Advanced data table with built-in features',
				snippet: `<DataGrid.Root items={rows}>
  <DataGrid.Table>
    <DataGrid.Header>
      <DataGrid.Column key="name">Name</DataGrid.Column>
      <DataGrid.Column key="status">Status</DataGrid.Column>
    </DataGrid.Header>
    <DataGrid.Body>{#snippet children({ items })}
      {#each items as row}
        <DataGrid.Row><DataGrid.Cell>{row.name}</DataGrid.Cell><DataGrid.Cell>{row.status}</DataGrid.Cell></DataGrid.Row>
      {/each}
    {/snippet}</DataGrid.Body>
  </DataGrid.Table>
  <DataGrid.Pagination />
</DataGrid.Root>`
			},
			{
				rank: 2,
				component: 'Table',
				useWhen: 'Simple static data table',
				snippet: `<Table.Root>
  <Table.Header>
    <Table.Row><Table.Head>Name</Table.Head></Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row><Table.Cell>Alice</Table.Cell></Table.Row>
  </Table.Body>
</Table.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Table + custom sorting/filtering logic',
				reason: 'DataGrid provides sorting, filtering, and pagination out of the box',
				fix: 'DataGrid'
			}
		],
		combinesWith: ['Card.Content', 'Badge', 'Avatar', 'Button', 'Container']
	},

	{
		component: 'DescriptionList',
		useWhen: 'Display term-description pairs for metadata or summaries',
		alternatives: [
			{
				rank: 1,
				component: 'DescriptionList',
				useWhen: 'Key-value metadata display (specs, order details)',
				snippet: `<DescriptionList.Root>
  <DescriptionList.Term>Status</DescriptionList.Term>
  <DescriptionList.Description>Active</DescriptionList.Description>
  <DescriptionList.Term>Created</DescriptionList.Term>
  <DescriptionList.Description>March 24, 2026</DescriptionList.Description>
</DescriptionList.Root>`
			},
			{
				rank: 2,
				component: 'Table',
				useWhen: 'Tabular data with multiple rows and columns',
				snippet: `<Table.Root>
  <Table.Body>
    <Table.Row><Table.Cell>Status</Table.Cell><Table.Cell>Active</Table.Cell></Table.Row>
  </Table.Body>
</Table.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<dl>, <dt>, <dd> without theming',
				reason: 'DescriptionList provides responsive layout and theme-consistent styling',
				fix: 'DescriptionList'
			}
		],
		combinesWith: ['Card.Content', 'Badge']
	},

	{
		component: 'List',
		useWhen: 'Structured list with items, icons, and subheaders',
		alternatives: [
			{
				rank: 1,
				component: 'List',
				useWhen: 'Structured list of items with optional icons and subheaders',
				snippet: `<List.Root>
  <List.Subheader>Section</List.Subheader>
  <List.Item>First item</List.Item>
  <List.Item>Second item</List.Item>
</List.Root>`
			},
			{
				rank: 2,
				component: 'Table',
				useWhen: 'Multi-column tabular data',
				snippet: `<Table.Root>
  <Table.Body>
    <Table.Row><Table.Cell>Item</Table.Cell></Table.Row>
  </Table.Body>
</Table.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: '<ul> or <ol> without theming',
				reason: 'List provides consistent item styling, icons, and subheader grouping',
				fix: 'List'
			}
		],
		combinesWith: ['Card.Content', 'ScrollArea', 'Avatar']
	},

	{
		component: 'Timeline',
		useWhen: 'Vertical timeline for activity feeds and event history',
		alternatives: [
			{
				rank: 1,
				component: 'Timeline',
				useWhen: 'Activity feed or event history timeline',
				snippet: `<Timeline.Root>
  <Timeline.Item>
    <Timeline.Icon />
    <Timeline.Content>
      <Timeline.Title>Event title</Timeline.Title>
      <Timeline.Description>Event description</Timeline.Description>
      <Timeline.Time>2 hours ago</Timeline.Time>
    </Timeline.Content>
  </Timeline.Item>
</Timeline.Root>`
			},
			{
				rank: 2,
				component: 'Stepper',
				useWhen: 'Multi-step process indicator (not event history)',
				snippet: `<Stepper.Root activeStep={1}>
  <Stepper.List>
    <Stepper.Step step={0}>Step 1</Stepper.Step>
  </Stepper.List>
</Stepper.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom timeline with border-left and circles',
				reason: 'Timeline provides consistent markers, connectors, and content layout',
				fix: 'Timeline'
			}
		],
		combinesWith: ['Card.Content', 'Avatar', 'Badge', 'Text']
	},

	{
		component: 'Tree',
		useWhen: 'Hierarchical tree view with expand/collapse',
		alternatives: [
			{
				rank: 1,
				component: 'Tree',
				useWhen: 'File tree, category hierarchy, or nested navigation',
				snippet: `<Tree.Root>
  <Tree.Item itemId="folder">
    <Tree.ItemLabel>Folder</Tree.ItemLabel>
    <Tree.ItemChildren>
      <Tree.Item itemId="file1"><Tree.ItemLabel>File 1</Tree.ItemLabel></Tree.Item>
      <Tree.Item itemId="file2"><Tree.ItemLabel>File 2</Tree.ItemLabel></Tree.Item>
    </Tree.ItemChildren>
  </Tree.Item>
</Tree.Root>`
			},
			{
				rank: 2,
				component: 'Accordion',
				useWhen: 'Single-level collapsible sections',
				snippet: `<Accordion.Root>
  <Accordion.Item value="item">
    <Accordion.Trigger>Section</Accordion.Trigger>
    <Accordion.Content>Content</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Nested lists with manual expand/collapse',
				reason: 'Tree handles indentation, keyboard nav, and ARIA treeview pattern',
				fix: 'Tree'
			}
		],
		combinesWith: ['Sidebar', 'ScrollArea', 'Card.Content', 'Checkbox']
	},

	{
		component: 'Collapsible',
		useWhen: 'Single expandable/collapsible content section',
		alternatives: [
			{
				rank: 1,
				component: 'Collapsible',
				useWhen: 'Single collapsible section (show more/less)',
				snippet: `<Collapsible.Root>
  <Collapsible.Trigger>Show more</Collapsible.Trigger>
  <Collapsible.Content>Hidden content</Collapsible.Content>
</Collapsible.Root>`
			},
			{
				rank: 2,
				component: 'Accordion',
				useWhen: 'Multiple collapsible sections',
				snippet: `<Accordion.Root>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'if/else toggle for show/hide',
				reason: 'Collapsible provides smooth animation and ARIA disclosure pattern',
				fix: 'Collapsible'
			},
			{
				pattern: '<details>/<summary>',
				reason: 'Native details element — no animation, limited theming',
				fix: 'Collapsible'
			}
		],
		combinesWith: ['Card.Content', 'Button']
	},

	{
		component: 'FlipCard',
		useWhen: 'Card with front and back faces that flips on interaction',
		alternatives: [
			{
				rank: 1,
				component: 'FlipCard',
				useWhen: 'Flippable card (front/back reveal)',
				snippet: `<FlipCard.Root>
  <FlipCard.Front>Front content</FlipCard.Front>
  <FlipCard.Back>Back content</FlipCard.Back>
</FlipCard.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'CSS transform: rotateY with custom flip logic',
				reason: 'FlipCard handles the 3D transform, perspective, and back-face visibility',
				fix: 'FlipCard'
			}
		],
		combinesWith: ['Card', 'Image']
	},

	{
		component: 'ImageComparison',
		useWhen: 'Before/after image comparison with a slider divider',
		alternatives: [
			{
				rank: 1,
				component: 'ImageComparison',
				useWhen: 'Side-by-side before/after image slider',
				snippet: `<ImageComparison before="/before.jpg" after="/after.jpg" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Two images with custom slider overlay',
				reason: 'ImageComparison handles the clip, drag, and keyboard interaction',
				fix: 'ImageComparison'
			}
		],
		combinesWith: ['Card.Content']
	},

	{
		component: 'Marquee',
		useWhen: 'Scrolling text or content ticker with CSS animations',
		alternatives: [
			{
				rank: 1,
				component: 'Marquee',
				useWhen: 'Scrolling content ticker (announcements, logos)',
				snippet: `<Marquee speed={40}>
  <span>Breaking news: DryUI v2 released!</span>
</Marquee>`
			}
		],
		antiPatterns: [
			{
				pattern: '<marquee>',
				reason: 'Deprecated HTML element — inconsistent behavior, no reduced-motion support',
				fix: 'Marquee'
			}
		],
		combinesWith: ['Text', 'Badge']
	},

	{
		component: 'QRCode',
		useWhen: 'Generate a QR code using Canvas 2D API',
		alternatives: [
			{
				rank: 1,
				component: 'QRCode',
				useWhen: 'Display a QR code for a URL or text value',
				snippet: `<QRCode value="https://example.com" size={200} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'External QR code library',
				reason: 'DryUI QRCode is zero-dependency and uses Canvas 2D',
				fix: 'QRCode'
			}
		],
		combinesWith: ['Card.Content']
	},

	{
		component: 'VideoEmbed',
		useWhen: 'Embed a video player for YouTube, Vimeo, or native sources',
		alternatives: [
			{
				rank: 1,
				component: 'VideoEmbed',
				useWhen: 'Video embed with loading state and responsive sizing',
				snippet: `<VideoEmbed src="https://www.youtube.com/watch?v=..." />`
			}
		],
		antiPatterns: [
			{
				pattern: '<iframe> for video without wrapper',
				reason: 'VideoEmbed handles responsive sizing, loading, and consistent styling',
				fix: 'VideoEmbed'
			}
		],
		combinesWith: ['AspectRatio', 'Card.Content']
	},

	{
		component: 'Map',
		useWhen: 'Interactive map with markers, popups, and layers',
		alternatives: [
			{
				rank: 1,
				component: 'Map',
				useWhen: 'Interactive map display with markers',
				snippet: `<Map.Root center={[lat, lng]} zoom={12}>
  <Map.Marker position={[lat, lng]}>
    <Map.Popup>Location info</Map.Popup>
  </Map.Marker>
</Map.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Card.Content', 'Popover']
	},

	{
		component: 'Sparkline',
		useWhen: 'Compact inline SVG chart for trends in tables or cards',
		alternatives: [
			{
				rank: 1,
				component: 'Sparkline',
				useWhen: 'Tiny inline trend chart',
				snippet: `<Sparkline data={[10, 25, 18, 30, 22]} />`
			},
			{
				rank: 2,
				component: 'Chart',
				useWhen: 'Full-size chart with axes and labels',
				snippet: `<Chart.Root data={chartData} width={600} height={300}>
  <Chart.Line />
  <Chart.XAxis />
  <Chart.YAxis />
</Chart.Root>`
			}
		],
		antiPatterns: [],
		combinesWith: ['Table.Cell', 'Card.Content']
	},

	{
		component: 'Gauge',
		useWhen: 'SVG gauge indicator with configurable arc and thresholds',
		alternatives: [
			{
				rank: 1,
				component: 'Gauge',
				useWhen: 'Visual gauge/meter (performance score, health)',
				snippet: `<Gauge value={72} max={100} />`
			},
			{
				rank: 2,
				component: 'ProgressRing',
				useWhen: 'Circular progress without thresholds',
				snippet: `<ProgressRing value={72} max={100} />`
			},
			{
				rank: 3,
				component: 'Progress',
				useWhen: 'Linear progress bar',
				snippet: `<Progress value={72} max={100} />`
			}
		],
		antiPatterns: [],
		combinesWith: ['Card.Content', 'Text']
	},

	{
		component: 'InfiniteScroll',
		useWhen: 'Load more content when user scrolls near the bottom',
		alternatives: [
			{
				rank: 1,
				component: 'InfiniteScroll',
				useWhen: 'Auto-load on scroll (feeds, lists)',
				snippet: `<InfiniteScroll onLoadMore={fetchMore} hasMore={hasMore}>
  {#each items as item}
    <div>{item}</div>
  {/each}
</InfiniteScroll>`
			},
			{
				rank: 2,
				component: 'Pagination',
				useWhen: 'Explicit page navigation instead of auto-loading',
				snippet: `<Pagination.Root bind:page={page} totalPages={10}>
  <Pagination.Content>
    <Pagination.Item><Pagination.Previous>Prev</Pagination.Previous></Pagination.Item>
    <Pagination.Item><Pagination.Link page={1}>1</Pagination.Link></Pagination.Item>
    <Pagination.Item><Pagination.Next>Next</Pagination.Next></Pagination.Item>
  </Pagination.Content>
</Pagination.Root>`
			},
			{
				rank: 3,
				component: 'VirtualList',
				useWhen: 'Render only visible items from a large static list',
				snippet: `<VirtualList items={allItems} itemHeight={48} let:item>
  <div>{item}</div>
</VirtualList>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Scroll event listener for infinite loading',
				reason: 'InfiniteScroll uses IntersectionObserver for better performance',
				fix: 'InfiniteScroll'
			}
		],
		combinesWith: ['List', 'Spinner']
	},

	{
		component: 'VirtualList',
		useWhen: 'Render only visible items from a large list for performance',
		alternatives: [
			{
				rank: 1,
				component: 'VirtualList',
				useWhen: 'Large list with virtual scrolling (thousands of items)',
				snippet: `<VirtualList items={allItems} itemHeight={48} let:item>
  <div>{item}</div>
</VirtualList>`
			},
			{
				rank: 2,
				component: 'InfiniteScroll',
				useWhen: 'Progressively load more items as user scrolls',
				snippet: `<InfiniteScroll onLoadMore={fetchMore} hasMore={hasMore}>
  {#each items as item}<div>{item}</div>{/each}
</InfiniteScroll>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Rendering all list items in a large dataset',
				reason: 'VirtualList renders only visible items for performance',
				fix: 'VirtualList'
			}
		],
		combinesWith: ['List', 'ScrollArea']
	},

	{
		component: 'ChatThread',
		useWhen: 'Conversation thread container with auto-scroll behavior',
		alternatives: [
			{
				rank: 1,
				component: 'ChatThread',
				useWhen: 'Chat conversation container',
				snippet: `<ChatThread messageCount={messages.length}>
  {#snippet children({ index })}
    <ChatMessage role={messages[index].role} name={messages[index].name}>
      {messages[index].message}
    </ChatMessage>
  {/snippet}
</ChatThread>`
			}
		],
		antiPatterns: [
			{
				pattern: 'ScrollArea with manual scroll-to-bottom',
				reason: 'ChatThread auto-scrolls on new messages and provides restart action',
				fix: 'ChatThread'
			}
		],
		combinesWith: ['PromptInput', 'TypingIndicator', 'Card']
	},

	{
		component: 'TypingIndicator',
		useWhen: 'Show animated three-dot typing status in a chat UI',
		alternatives: [
			{
				rank: 1,
				component: 'TypingIndicator',
				useWhen: 'Chat typing status animation',
				snippet: `<TypingIndicator />`
			}
		],
		antiPatterns: [],
		combinesWith: ['ChatThread']
	},

	{
		component: 'MarkdownRenderer',
		useWhen: 'Render markdown text as styled HTML',
		alternatives: [
			{
				rank: 1,
				component: 'MarkdownRenderer',
				useWhen: 'Display markdown content (docs, comments, messages)',
				snippet: `<MarkdownRenderer content={markdownString} />`
			},
			{
				rank: 2,
				component: 'CodeBlock',
				useWhen: 'Display only code (not full markdown)',
				snippet: `<CodeBlock code={sourceCode} language="typescript" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'innerHTML with parsed markdown',
				reason: 'MarkdownRenderer handles sanitization and theme-consistent styling',
				fix: 'MarkdownRenderer'
			}
		],
		combinesWith: ['Card.Content']
	},

	// ── Feedback (missing) ────────────────────────────────────────────────

	{
		component: 'Progress',
		useWhen: 'Show completion progress as a linear bar',
		alternatives: [
			{
				rank: 1,
				component: 'Progress',
				useWhen: 'Linear progress bar (upload, loading)',
				snippet: `<Progress value={65} max={100} />`
			},
			{
				rank: 2,
				component: 'ProgressRing',
				useWhen: 'Circular progress ring',
				snippet: `<ProgressRing value={65} max={100} />`
			},
			{
				rank: 3,
				component: 'Spinner',
				useWhen: 'Indeterminate loading spinner',
				snippet: `<Spinner size="md" />`
			}
		],
		antiPatterns: [
			{
				pattern: '<progress>',
				reason: 'Native progress — no theming, limited styling',
				fix: 'Progress'
			},
			{
				pattern: 'CSS-only progress bar',
				reason: 'No ARIA progressbar role or theme integration',
				fix: 'Progress'
			}
		],
		combinesWith: ['Card.Content', 'Text']
	},

	{
		component: 'ProgressRing',
		useWhen: 'Show completion progress as a circular ring',
		alternatives: [
			{
				rank: 1,
				component: 'ProgressRing',
				useWhen: 'Circular progress indicator',
				snippet: `<ProgressRing value={65} max={100} />`
			},
			{
				rank: 2,
				component: 'Progress',
				useWhen: 'Linear progress bar',
				snippet: `<Progress value={65} max={100} />`
			},
			{
				rank: 3,
				component: 'Gauge',
				useWhen: 'Gauge with thresholds and arc',
				snippet: `<Gauge value={65} max={100} />`
			}
		],
		antiPatterns: [],
		combinesWith: ['Card.Content', 'Text']
	},

	{
		component: 'Spinner',
		useWhen: 'Show an indeterminate loading spinner',
		alternatives: [
			{
				rank: 1,
				component: 'Spinner',
				useWhen: 'Loading spinner animation',
				snippet: `<Spinner size="md" />`
			},
			{
				rank: 2,
				component: 'Skeleton',
				useWhen: 'Loading placeholder that mimics content shape',
				snippet: `<Skeleton width="200px" height="1rem" />`
			},
			{
				rank: 3,
				component: 'Progress',
				useWhen: 'Determinate progress with known percentage',
				snippet: `<Progress value={65} max={100} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'CSS spinner animation',
				reason: 'Spinner provides themed sizing and ARIA live announcement',
				fix: 'Spinner'
			}
		],
		combinesWith: ['Button', 'Card.Content', 'Backdrop']
	},

	// ── Text / Typography (missing) ───────────────────────────────────────

	{
		component: 'Heading',
		useWhen: 'Semantic heading element with consistent typography',
		alternatives: [
			{
				rank: 1,
				component: 'Heading',
				useWhen: 'Page or section headings (h1-h6)',
				snippet: `<Heading level={2}>Section Title</Heading>`
			},
			{
				rank: 2,
				component: 'Text',
				useWhen: 'Body text or non-heading display text',
				snippet: `<Text size="lg" weight="bold">Large bold text</Text>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Unstyled <h1> to <h6>',
				reason: 'Heading provides consistent typography scale and theme integration',
				fix: 'Heading'
			},
			{
				pattern:
					'Wrapping Heading in a grid/flex just to cap its width (e.g. grid-template-columns: minmax(0, 34rem) 1fr)',
				reason:
					'Heading exposes maxMeasure for ergonomic headline widths; the wrapper hack exists only to work around the old no-width rule, which now allows ch units.',
				fix: '<Heading maxMeasure="narrow">…</Heading>'
			}
		],
		combinesWith: ['Card.Header']
	},

	{
		component: 'Typography',
		useWhen: 'Canonical text system for starter-kit prose, headings, inline code, and blockquotes',
		alternatives: [
			{
				rank: 1,
				component: 'Typography',
				useWhen: 'Preferred namespaced text system for new prose and documentation layouts',
				snippet: `<Typography.Heading level={1}>Title</Typography.Heading>
<Typography.Text>Body copy</Typography.Text>
<Typography.Code>inline code</Typography.Code>
<Typography.Blockquote>Quoted text</Typography.Blockquote>`
			},
			{
				rank: 2,
				component: 'Heading',
				useWhen: 'Starter-kit shortcut when only a heading is needed',
				snippet: `<Heading level={2}>Title</Heading>`
			},
			{
				rank: 3,
				component: 'Text',
				useWhen: 'Starter-kit shortcut when only body copy is needed',
				snippet: `<Text>Body copy</Text>`
			}
		],
		antiPatterns: [
			{
				pattern: 'New standalone text wrapper component',
				reason: 'Typography is the canonical prose namespace for new text APIs',
				fix: 'Typography'
			}
		],
		combinesWith: ['Card.Content', 'Container']
	},

	{
		component: 'RelativeTime',
		useWhen: 'Display a relative time (e.g., "2 hours ago") with auto-updating',
		alternatives: [
			{
				rank: 1,
				component: 'RelativeTime',
				useWhen: 'Auto-updating relative timestamps',
				snippet: `<RelativeTime date={timestamp} />`
			},
			{
				rank: 2,
				component: 'FormatDate',
				useWhen: 'Absolute date display',
				snippet: `<FormatDate value={timestamp} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Manual relative time calculation',
				reason: 'RelativeTime auto-updates and uses Intl.RelativeTimeFormat',
				fix: 'RelativeTime'
			}
		],
		combinesWith: ['Text', 'Timeline']
	},

	{
		component: 'FormatDate',
		useWhen: 'Format a date value with Intl.DateTimeFormat',
		alternatives: [
			{
				rank: 1,
				component: 'FormatDate',
				useWhen: 'Locale-aware date formatting',
				snippet: `<FormatDate value={date} />`
			},
			{
				rank: 2,
				component: 'RelativeTime',
				useWhen: 'Relative time display (e.g., "3 days ago")',
				snippet: `<RelativeTime date={date} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'date.toLocaleDateString() in templates',
				reason: 'FormatDate is a consistent component with locale props',
				fix: 'FormatDate'
			}
		],
		combinesWith: ['Text', 'Table.Cell', 'DescriptionList']
	},

	{
		component: 'FormatNumber',
		useWhen: 'Format a number with Intl.NumberFormat',
		alternatives: [
			{
				rank: 1,
				component: 'FormatNumber',
				useWhen: 'Locale-aware number formatting (currency, percent, compact)',
				snippet: `<FormatNumber value={1234.56} style="currency" currency="USD" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'number.toLocaleString() in templates',
				reason: 'FormatNumber is a consistent component with format props',
				fix: 'FormatNumber'
			}
		],
		combinesWith: ['Text', 'Table.Cell']
	},

	{
		component: 'FormatBytes',
		useWhen: 'Format byte values with Intl.NumberFormat',
		alternatives: [
			{
				rank: 1,
				component: 'FormatBytes',
				useWhen: 'Display file sizes (bytes to KB, MB, GB)',
				snippet: `<FormatBytes value={1048576} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Custom byte formatting function',
				reason: 'FormatBytes handles unit conversion and locale-aware formatting',
				fix: 'FormatBytes'
			}
		],
		combinesWith: ['Text', 'Table.Cell', 'FileUpload']
	},

	// ── Utility (missing) ─────────────────────────────────────────────────

	{
		component: 'Hotkey',
		useWhen: 'Handle keyboard shortcuts with modifier support',
		alternatives: [
			{
				rank: 1,
				component: 'Hotkey',
				useWhen: 'Global or scoped keyboard shortcut',
				snippet: `<Hotkey keys="mod+k" onpress={openSearch} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'addEventListener("keydown") for shortcuts',
				reason: 'Hotkey handles modifier keys, prevents defaults, and cleans up on unmount',
				fix: 'Hotkey'
			}
		],
		combinesWith: ['CommandPalette', 'Kbd', 'Dialog']
	},

	{
		component: 'FocusTrap',
		useWhen: 'Trap keyboard focus within a container element',
		alternatives: [
			{
				rank: 1,
				component: 'FocusTrap',
				useWhen: 'Focus containment for custom modals or overlays',
				snippet: `<FocusTrap active={isOpen}>
  <div>Focused content</div>
</FocusTrap>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Manual focus management in modals',
				reason: 'FocusTrap handles tab cycling, initial focus, and restore on unmount',
				fix: 'FocusTrap'
			},
			{
				pattern: 'FocusTrap inside Dialog or Drawer',
				reason: 'Dialog and Drawer already include focus trapping',
				fix: 'Remove FocusTrap from Dialog/Drawer content'
			}
		],
		combinesWith: ['Portal']
	},

	{
		component: 'Portal',
		useWhen: 'Render children into a different DOM location',
		alternatives: [
			{
				rank: 1,
				component: 'Portal',
				useWhen: 'Render content at document body to escape overflow/z-index',
				snippet: `<Portal>
  <div class="custom-overlay">Content</div>
</Portal>`
			}
		],
		antiPatterns: [
			{
				pattern: 'Portal for Dialog or Popover',
				reason: 'DryUI overlay components already portal their content',
				fix: 'Remove Portal wrapper from Dialog/Popover'
			}
		],
		combinesWith: ['FocusTrap', 'Backdrop']
	},

	{
		component: 'VisuallyHidden',
		useWhen: 'Hide content visually while keeping it accessible to screen readers',
		alternatives: [
			{
				rank: 1,
				component: 'VisuallyHidden',
				useWhen: 'Screen-reader-only text (skip links, accessible labels)',
				snippet: `<VisuallyHidden>Skip to main content</VisuallyHidden>`
			}
		],
		antiPatterns: [
			{
				pattern: 'display: none for accessible text',
				reason: 'display: none hides from screen readers too; VisuallyHidden keeps SR access',
				fix: 'VisuallyHidden'
			},
			{
				pattern: 'Custom sr-only CSS class',
				reason: 'VisuallyHidden is a reusable component with correct positioning',
				fix: 'VisuallyHidden'
			}
		],
		combinesWith: ['Button', 'Link']
	},

	// ── Visual Effects ────────────────────────────────────────────────────────

	{
		component: 'Glow',
		useWhen: 'Add a luminous halo or bloom effect to a surface using CSS blur and blend modes.',
		alternatives: [
			{
				rank: 1,
				component: 'Glow',
				useWhen: 'Static luminous accent on cards, buttons, or hero elements',
				snippet: `<Glow color="var(--dry-color-fill-brand)" intensity={0.6} radius={80}>
  <Card.Root>
    <Card.Content>Glowing card</Card.Content>
  </Card.Root>
</Glow>`
			},
			{
				rank: 2,
				component: 'Spotlight',
				useWhen: 'Pointer-reactive lighting instead of a static glow',
				snippet: `<Spotlight radius={180} intensity={0.7} color="var(--dry-color-fill-brand)">
  <Card.Root>
    <Card.Content>Spotlight card</Card.Content>
  </Card.Root>
</Spotlight>`
			}
		],
		antiPatterns: [
			{
				pattern: 'multiple Glow components stacked on the same element',
				reason: 'Stacked blur layers compound, hurting performance and washing out the effect',
				fix: 'Combine into one Glow with higher intensity'
			},
			{
				pattern: 'Glow inside a parent with overflow: hidden',
				reason: 'The blur extends beyond element bounds and will be clipped unexpectedly',
				fix: 'Remove overflow: hidden from the parent or restructure the layout'
			}
		],
		combinesWith: ['Card', 'Aurora']
	},

	{
		component: 'GodRays',
		useWhen:
			'Render volumetric directional light rays using conic-gradient and blur for atmospheric hero sections.',
		alternatives: [
			{
				rank: 1,
				component: 'GodRays',
				useWhen: 'Directional volumetric rays emanating from a focal point',
				snippet: `<GodRays color="rgba(139,92,246,0.12)" rayCount={8} intensity={40} />`
			},
			{
				rank: 2,
				component: 'Aurora',
				useWhen: 'Ambient atmosphere without directional rays',
				snippet: `<Aurora palette={['#0f172a', '#1d4ed8', '#22c55e']} speed={0.7}>
  <div class="hero-shell">Hero content</div>
</Aurora>`
			}
		],
		antiPatterns: [
			{
				pattern: 'rayCount above 24',
				reason:
					'Diminishing visual returns with increasing GPU cost; conic-gradient slices pile up',
				fix: 'Stay at or below 16 rays for most use cases'
			},
			{
				pattern: 'GodRays with speed > 0 when prefers-reduced-motion is active',
				reason: 'Animated rays violate reduced-motion preferences',
				fix: 'The component handles this automatically — do not override the internal motion check'
			}
		],
		combinesWith: ['Aurora', 'Noise']
	},

	{
		component: 'Beam',
		useWhen:
			'Render a single animated light streak across a surface using a linear-gradient animation.',
		alternatives: [
			{
				rank: 1,
				component: 'Beam',
				useWhen: 'Single sweeping highlight or shimmer line across a card or hero',
				snippet: `<Beam color="rgba(255,255,255,0.15)" angle={-45} duration={2.4}>
  <Card.Root>
    <Card.Content>Beam card</Card.Content>
  </Card.Root>
</Beam>`
			},
			{
				rank: 2,
				component: 'GodRays',
				useWhen: 'Multiple rays from a focal point instead of a single streak',
				snippet: `<GodRays color="rgba(139,92,246,0.12)" rayCount={8} intensity={40} />`
			}
		],
		antiPatterns: [
			{
				pattern: 'multiple Beam components at the same angle',
				reason: 'Parallel beams at the same angle are visually redundant and waste GPU resources',
				fix: 'Use different angles or replace with GodRays for a multi-ray effect'
			}
		],
		combinesWith: ['Card', 'Aurora']
	},

	{
		component: 'ChromaticShift',
		useWhen:
			'Apply a subtle RGB channel-split distortion effect via SVG filter for glitch-inspired aesthetics.',
		alternatives: [
			{
				rank: 1,
				component: 'ChromaticShift',
				useWhen: 'Glitch-style chromatic split on images, headings, or card surfaces',
				snippet: `<ChromaticShift offset={4}>
  <Heading level={1}>Glitch heading</Heading>
</ChromaticShift>`
			}
		],
		antiPatterns: [
			{
				pattern: 'offset above 10px',
				reason: 'The effect becomes distracting and visually noisy rather than subtle',
				fix: 'Keep offset at or below 6px for tasteful use'
			},
			{
				pattern: 'ChromaticShift on text-heavy content',
				reason: 'Channel splits reduce readability on dense copy',
				fix: 'Limit to headings, images, or decorative surfaces'
			}
		],
		combinesWith: ['Card']
	},

	{
		component: 'Adjust',
		useWhen:
			'Apply CSS filter adjustments (brightness, contrast, saturate, hue-rotate, etc.) to a child element.',
		alternatives: [
			{
				rank: 1,
				component: 'Adjust',
				useWhen: 'Programmatic filter tweaks on cards, images, or backgrounds',
				snippet: `<Adjust brightness={110} contrast={105} saturate={120}>
  <img src="/photo.jpg" alt="Adjusted photo" />
</Adjust>`
			},
			{
				rank: 2,
				component: 'CSS filter property directly',
				useWhen: 'One-off static filter that does not need a component abstraction',
				snippet: `<img style="filter: brightness(1.1) contrast(1.05)" src="/photo.jpg" alt="Photo" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'Adjust inside Adjust',
				reason:
					'CSS filters compose multiplicatively, causing unexpected compounding; combine all filter props into one Adjust',
				fix: 'Use a single Adjust with all desired props'
			},
			{
				pattern: 'blur > 0 on Adjust',
				reason:
					'Adjust applies a foreground filter — for blurring a background use Glass (backdrop-filter)',
				fix: 'Use Glass for backdrop blur; use Adjust only for brightness/contrast/saturate/hue tweaks'
			}
		],
		combinesWith: ['Card', 'Aurora']
	},

	{
		component: 'AffixGroup',
		useWhen: 'Wrap a single input with prefixes, suffixes, separators, or inline actions.',
		alternatives: [
			{
				rank: 1,
				component: 'AffixGroup',
				useWhen:
					'Need a headless compound field shell that supports a single input and attached controls',
				snippet: `<AffixGroup.Root>
  <AffixGroup.Prefix>$</AffixGroup.Prefix>
  <AffixGroup.Input>
    <Input bind:value={amount} placeholder="0.00" />
  </AffixGroup.Input>
  <AffixGroup.Suffix>USD</AffixGroup.Suffix>
</AffixGroup.Root>`
			},
			{
				rank: 2,
				component: 'Input',
				useWhen: 'Plain input without attached controls',
				snippet: `<Input bind:value={amount} placeholder="0.00" />`
			}
		],
		antiPatterns: [
			{
				pattern: 'multiple inputs inside one AffixGroup.Root',
				reason:
					'The group is designed for one primary field with attached accessories, not a form grid',
				fix: 'Use separate groups or a scoped CSS grid wrapper'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Button']
	},

	{
		component: 'SelectableTileGroup',
		useWhen:
			'Present a small set of visibly selectable tiles with single-choice keyboard navigation.',
		alternatives: [
			{
				rank: 1,
				component: 'SelectableTileGroup',
				useWhen: 'Need tiles or cards that behave like a radio group',
				snippet: `<SelectableTileGroup.Root bind:value={choice}>
  <SelectableTileGroup.Item value="standard">
    <SelectableTileGroup.Label>Standard</SelectableTileGroup.Label>
    <SelectableTileGroup.Description>Best for most users</SelectableTileGroup.Description>
  </SelectableTileGroup.Item>
</SelectableTileGroup.Root>`
			},
			{
				rank: 2,
				component: 'RadioGroup',
				useWhen: 'Choices are better shown as plain form controls instead of cards',
				snippet: `<RadioGroup.Root bind:value={choice}>
  <RadioGroup.Item value="standard">Standard</RadioGroup.Item>
</RadioGroup.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'using SelectableTileGroup for multi-select',
				reason: 'The interaction model is single-select only',
				fix: 'Use Checkbox or ChipGroup for multi-select flows'
			}
		],
		combinesWith: ['Field.Root', 'Label']
	},

	{
		component: 'InputGroup',
		useWhen:
			'Build a styled input shell with affixes, separators, select slots, or attached actions.',
		alternatives: [
			{
				rank: 1,
				component: 'InputGroup',
				useWhen: 'Styled compound field with one main input and optional inline controls',
				snippet: `<InputGroup.Root>
  <InputGroup.Prefix>@</InputGroup.Prefix>
  <InputGroup.Input bind:value={username} placeholder="handle" />
  <InputGroup.Action>Check</InputGroup.Action>
</InputGroup.Root>`
			},
			{
				rank: 2,
				component: 'AffixGroup',
				useWhen: 'Need the same structure without the UI styling layer',
				snippet: `<AffixGroup.Root>
  <AffixGroup.Input>
    <Input bind:value={query} />
  </AffixGroup.Input>
</AffixGroup.Root>`
			}
		],
		antiPatterns: [
			{
				pattern: 'wrapping InputGroup around another InputGroup',
				reason: 'Nested shells create duplicate borders and spacing',
				fix: 'Use one group and compose parts inside it'
			}
		],
		combinesWith: ['Field.Root', 'Label', 'Button', 'Select']
	}
];

// ---------------------------------------------------------------------------
// Composition Recipes
// ---------------------------------------------------------------------------

export const compositionRecipes: CompositionRecipe[] = [
	// ── Foundational Setup ────────────────────────────────────────────────────

	{
		name: 'app-shell',
		description:
			'SvelteKit app shell setup with theme CSS imports, app.html configuration, global CSS reset using DryUI tokens, and root layout with header and content slot. Start here before building any page.',
		tags: ['app', 'shell', 'setup', 'layout', 'sveltekit', 'root', 'theme', 'getting-started'],
		components: ['Container'],
		snippet: `<!-- 1. app.html — add theme-auto class -->
<!doctype html>
<html lang="en" class="theme-auto">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>

<!-- 2. src/app.css — import themes (resets are built in) -->
@import '@dryui/ui/themes/default.css';
@import '@dryui/ui/themes/dark.css';

<!-- 3. src/routes/+layout.svelte — root layout -->
<script>
  import '../app.css';
  import { Container } from '@dryui/ui';

  let { children } = $props();
</script>

<header>
  <Container>
    <div class="app-header">My App</div>
  </Container>
</header>
<main>
  <Container>
    <div class="page-content">
      {@render children()}
    </div>
  </Container>
</main>

<style>
  .app-header { padding: var(--dry-space-4) 0; font-weight: bold; }
  .page-content { display: grid; gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'customize-tokens',
		description:
			'Three correct ways to customize --dry-* tokens. Pick by scope: (a) scoped wrapper on a single route for 1-5 per-page tweaks, (b) body/html selector with the /* @dryui-theme */ directive for 1-10 site-wide tweaks (or use the *.theme.css filename), or (c) a full *.theme.css file when defining an entirely custom palette. Dumping a handful of overrides at :root inside app.css raises a partial-override info telling you to pick one of these.',
		tags: [
			'theme',
			'tokens',
			'customize',
			'customise',
			'override',
			'overrides',
			'partial-override',
			'theme-file',
			'dry-color',
			'dry-space',
			'palette'
		],
		components: [],
		snippet: `<!--
  Three correct ways to customize --dry-* tokens. Pick by scope.
  Do NOT dump a handful of overrides at :root in app.css, since that hides
  contrast problems and triggers the partial-override check.
-->

<!-- ========== (a) Per-route scoped override (1-5 tokens, one page) ========== -->
<!-- src/routes/marketing/+page.svelte -->
<script>
  import { Container } from '@dryui/ui';
</script>

<div class="page">
  <Container>
    <h1>Launch day</h1>
  </Container>
</div>

<style>
  /* Overrides scope to .page and inherit down, so only this route picks them
     up. No :root, no directive needed. */
  .page {
    --dry-color-bg-base: #fff7ed;
    --dry-color-fill-brand: #ea580c;
    --dry-color-on-brand: #ffffff;
    --dry-color-stroke-weak: #fed7aa;
  }
</style>

<!-- ========== (b) Site-wide partial override (1-10 tokens, whole app) ========== -->
<!-- src/app.css — mark the file as an intentional theme file with either the
     directive OR the *.theme.css filename. Scope overrides under a selector
     (body or html), not :root, so routes that want to tweak further still can. -->
/* @dryui-theme */
@import '@dryui/ui/themes/default.css';
@import '@dryui/ui/themes/dark.css';

body {
  --dry-color-fill-brand: #ea580c;
  --dry-color-fill-brand-hover: #c2410c;
  --dry-color-fill-brand-active: #9a3412;
  --dry-color-on-brand: #ffffff;
  --dry-color-focus-ring: rgba(234, 88, 12, 0.4);
}

<!-- ========== (c) Full custom theme (*.theme.css, every semantic token) ========== -->
<!-- src/lib/brand.theme.css — the .theme.css filename turns on completeness
     checking, so missing tokens surface as errors. Use when defining an
     entirely custom palette (neutral + brand + status + surfaces). Import
     AFTER the stock theme CSS so your values win. -->
:root, [data-theme='brand'] {
  /* Neutral */
  --dry-color-text-strong: #0f172a;
  --dry-color-text-weak: rgba(15, 23, 42, 0.65);
  --dry-color-icon: rgba(15, 23, 42, 0.75);
  --dry-color-stroke-strong: rgba(15, 23, 42, 0.35);
  --dry-color-stroke-weak: rgba(15, 23, 42, 0.1);
  --dry-color-fill: rgba(15, 23, 42, 0.05);
  --dry-color-fill-hover: rgba(15, 23, 42, 0.08);
  --dry-color-fill-active: rgba(15, 23, 42, 0.12);
  /* Backgrounds */
  --dry-color-bg-base: #fff7ed;
  --dry-color-bg-raised: #ffedd5;
  --dry-color-bg-overlay: #fed7aa;
  /* Brand + the remaining ~35 semantic tokens go here. Run
     \`check src/lib/brand.theme.css\` to see every token the checker expects. */
}

<!-- Import order matters. In +layout.svelte: theme CSS BEFORE local CSS. -->
<!-- src/routes/+layout.svelte -->
<script>
  import '@dryui/ui/themes/default.css';
  import '@dryui/ui/themes/dark.css';
  import '$lib/brand.theme.css';
  import '../app.css';
</script>`
	},

	{
		name: 'light-only',
		description:
			'Force the site into light mode for every visitor, regardless of OS preference. Use for brand sites, marketing pages, or docs that were designed around a light palette and should not flip on a dark-preferring OS.',
		tags: [
			'theme',
			'light',
			'light-only',
			'force-light',
			'data-theme',
			'theme-auto',
			'brand',
			'marketing'
		],
		components: [],
		snippet: `<!-- 1. app.html — keep theme-auto AND pin data-theme="light".
     - data-theme="light" makes the page render with light tokens on every OS.
     - theme-auto is still useful: if a user explicitly opts in to dark via a
       toggle (swapping data-theme to "dark"), the media query under the
       theme-auto class can still drive dark tokens. With data-theme="light"
       present, the theme-auto block is guarded so dark OS preference cannot
       silently override your light design. -->
<!doctype html>
<html lang="en" class="theme-auto" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>

<!-- 2. src/app.css — import BOTH theme files.
     default.css defines light tokens on :root. dark.css contains the
     [data-theme='dark'] override and the guarded .theme-auto block.
     You still want dark.css imported so an opt-in dark toggle keeps working. -->
@import '@dryui/ui/themes/default.css';
@import '@dryui/ui/themes/dark.css';

<!-- 3. src/routes/+layout.svelte — nothing special; tokens already resolve light. -->
<script>
  import '../app.css';
  import { Container } from '@dryui/ui';

  let { children } = $props();
</script>

<main>
  <Container>{@render children()}</Container>
</main>

<!-- Gotcha: do NOT drop theme-auto to "force light". Leaving theme-auto in
     place preserves the opt-in dark pathway (user sets data-theme="dark")
     without making light the default. -->`
	},

	{
		name: 'page-shell-simple',
		description:
			'Simple page layout with header and centered content. Use Container for pages without a sidebar.',
		tags: ['page', 'shell', 'simple', 'layout', 'header', 'content', 'no-sidebar'],
		components: ['Container'],
		snippet: `<!-- Use this for simple pages WITHOUT a sidebar.
     Simple page shell with header and centered content. -->
<script>
  import { Container } from '@dryui/ui';
</script>

<header>
  <Container>
    <div class="page-header">App Name</div>
  </Container>
</header>
<main>
  <Container>
    <div class="page-content">
      <!-- Page content: Cards, forms, grids, etc. go here directly. -->
    </div>
  </Container>
</main>

<style>
  .page-header { padding: var(--dry-space-4) 0; font-weight: bold; }
  .page-content { display: grid; gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'centred-page',
		description:
			'Full-viewport centred page layout with zero visual decoration. Use for landing pages, splash screens, onboarding flows, and error pages where whitespace and alignment communicate structure — no Card, no header, no borders or shadows.',
		tags: [
			'page',
			'centered',
			'centred',
			'landing',
			'splash',
			'minimal',
			'layout',
			'fullscreen',
			'hero'
		],
		components: [],
		snippet: `<!-- Centred page — no visual chrome, just spatial arrangement.
     CSS grid centres content both axes, min-height fills the viewport. -->
<div class="centred-page">
  <!-- Hero content goes here: headings, inputs, swatches, etc. -->
  <h1>Title</h1>
  <p>Subtitle or description</p>
</div>

<style>
  .centred-page {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: var(--dry-space-16);
    min-height: 100dvh;
    padding: var(--dry-space-12) var(--dry-space-6);
  }
</style>`
	},

	{
		name: 'simple-content-page',
		description:
			'Clean content page with constrained width and vertical rhythm. Use Container for max-width and CSS grid for vertical spacing. Suitable for blog posts, documentation, settings pages.',
		tags: ['page', 'content', 'simple', 'blog', 'docs', 'article', 'clean', 'minimal'],
		components: ['Container'],
		snippet: `<!-- Simple content page — Container constrains width, grid provides rhythm -->
<script>
  import { Container } from '@dryui/ui';
</script>

<main class="content-main">
  <Container size="md">
    <div class="content-body">
      <h1>Page Title</h1>
      <!-- Content blocks go here -->
    </div>
  </Container>
</main>

<style>
  .content-main { padding: var(--dry-space-12) 0; }
  .content-body { display: grid; gap: var(--dry-space-8); }
</style>`
	},

	{
		name: 'auth-form',
		description:
			'Sign-in/sign-up card with email/password fields, social login separator, and forgot-password link. Pattern-focused — show the structure, not hardcoded domain details.',
		tags: ['auth', 'login', 'signup', 'form', 'card'],
		components: ['Card', 'Field', 'Label', 'Input', 'Button', 'Separator', 'Text', 'Heading'],
		snippet: `<script>
  import { Card, Field, Label, Input, Button, Separator, Text, Heading } from '@dryui/ui';

  let email = $state('');
  let password = $state('');
</script>

<Card.Root>
  <Card.Header>
    <Heading level={2}>Sign in</Heading>
    <Text color="muted" size="sm">Enter your credentials to continue</Text>
  </Card.Header>
  <Card.Content>
    <div class="auth-fields">
      <Field.Root>
        <Label>Email</Label>
        <Input type="email" bind:value={email} placeholder="you@example.com" />
      </Field.Root>
      <Field.Root>
        <Label>Password</Label>
        <Input type="password" bind:value={password} />
      </Field.Root>
      <Button variant="solid" type="submit">Sign in</Button>
      <Separator />
      <Button variant="outline">Continue with SSO</Button>
      <Text as="p" color="muted" size="sm">
        <Button variant="link" href="/forgot-password">Forgot password?</Button>
      </Text>
    </div>
  </Card.Content>
</Card.Root>

<style>
  .auth-fields { display: grid; gap: var(--dry-space-4); }
</style>`
	},

	{
		name: 'hero-background',
		description:
			'Zero-dependency hero background built from Aurora, Noise, Reveal, and a card stack. Motion, GSAP, Shaders.com, OGL, Three.js, PixiJS, Rive, and Lenis are reference points only; use this when the page needs atmosphere without installing a shader engine.',
		tags: ['hero', 'background', 'aurora', 'noise', 'motion'],
		components: ['Aurora', 'Noise', 'Reveal', 'Card', 'Container', 'Button'],
		snippet: `<script>
  import { Aurora, Noise, Reveal, Button, Card, Container, Text, Heading } from '@dryui/ui';
</script>

<Aurora palette={['#08111f', '#1d4ed8', '#14b8a6']} speed={0.8}>
  <Noise opacity={0.08} blend="soft-light" animated={false} />
  <Container>
    <div class="hero-content">
      <Reveal variant="fade" once>
        <Heading level={1}>Ambient motion, no runtime.</Heading>
      </Reveal>
      <Reveal variant="slide-up" delay={80}>
        <Text as="p">Browser-native surfaces that stay readable, responsive, and reduced-motion aware.</Text>
      </Reveal>
      <Reveal variant="slide-up" delay={140}>
        <div class="hero-actions">
          <Button variant="solid">Explore docs</Button>
          <Button variant="outline">View motion guide</Button>
        </div>
      </Reveal>
      <Reveal variant="scale-in" delay={220}>
        <Card.Root>
          <Card.Content>Hero proof card</Card.Content>
        </Card.Root>
      </Reveal>
    </div>
  </Container>
</Aurora>

<style>
  .hero-content { display: grid; gap: var(--dry-space-8); }
  .hero-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(min-content, max-content)); gap: var(--dry-space-2); }
</style>`
	},

	{
		name: 'spotlight-card-grid',
		description:
			'Card grid with pointer-reactive highlights and staggered entrance reveals. Use for feature bento layouts that need depth without a graphics dependency.',
		tags: ['grid', 'cards', 'spotlight', 'motion', 'feature'],
		components: ['Spotlight', 'Reveal', 'Card', 'Text'],
		snippet: `<script>
  import { Spotlight, Reveal, Card, Text } from '@dryui/ui';

  const features = [
    { title: 'Fast', copy: 'Keeps motion browser-native.' },
    { title: 'Readable', copy: 'Preserves contrast and hierarchy.' },
    { title: 'Adaptive', copy: 'Falls back when motion is reduced.' },
  ];
</script>

<div class="feature-grid">
  {#each features as feature, index (feature.title)}
    <Reveal variant="fade" delay={index * 80}>
      <Spotlight radius={160} intensity={0.6} color="var(--dry-color-fill-brand)">
        <Card.Root>
          <Card.Content>
            <Text weight="bold">{feature.title}</Text>
            <Text as="p">{feature.copy}</Text>
          </Card.Content>
        </Card.Root>
      </Spotlight>
    </Reveal>
  {/each}
</div>

<style>
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'animated-stats-strip',
		description:
			'A compact stats row that reveals metrics sequentially and keeps animation lightweight and deterministic.',
		tags: ['stats', 'metrics', 'motion', 'reveal'],
		components: ['Reveal', 'Card', 'Heading', 'Text'],
		snippet: `<script>
  import { Reveal, Card, Heading, Text } from '@dryui/ui';

  const stats = [
    { value: '99.9%', label: 'uptime' },
    { value: '48ms', label: 'median response' },
    { value: '0 deps', label: 'runtime extras' },
  ];
</script>

<div class="stats-strip">
  {#each stats as stat, index (stat.label)}
    <Reveal variant="slide-up" delay={index * 90} once>
      <Card.Root>
        <Card.Content>
          <Heading level={3}>{stat.value}</Heading>
          <Text as="p">{stat.label}</Text>
        </Card.Content>
      </Card.Root>
    </Reveal>
  {/each}
</div>

<style>
  .stats-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--dry-space-4); }
</style>`
	},

	{
		name: 'narrative-feature-steps',
		description:
			'Step-by-step feature narrative that uses reveals for pacing while staying content-first and dependency-free.',
		tags: ['steps', 'narrative', 'feature', 'motion'],
		components: ['Reveal', 'Card', 'Text'],
		snippet: `<script>
  import { Reveal, Card, Text } from '@dryui/ui';

  const steps = [
    { title: 'Frame the claim', copy: 'Open with the user outcome.' },
    { title: 'Show the proof', copy: 'Add metrics or supporting detail.' },
    { title: 'Close with action', copy: 'End on the next step.' },
  ];
</script>

<div class="feature-steps">
  {#each steps as step, index (step.title)}
    <Reveal variant="mask-up" delay={index * 100}>
      <Card.Root>
        <Card.Content>
          <Text weight="bold">{step.title}</Text>
          <Text as="p">{step.copy}</Text>
        </Card.Content>
      </Card.Root>
    </Reveal>
  {/each}
</div>

<style>
  .feature-steps { display: grid; gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'shared-element-detail-transition',
		description:
			'Detail-page transition recipe that leans on the browser View Transition API and degrades cleanly when it is unavailable.',
		tags: ['shared-element', 'transition', 'detail', 'view-transition'],
		components: ['Card', 'Reveal', 'Text'],
		snippet: `<script>
  import { Card, Reveal, Text } from '@dryui/ui';
</script>

<div class="detail-content">
  <Reveal variant="scale-in" once>
    <Card.Root>
      <Card.Content>
        <Text weight="bold">Shared element header</Text>
        <Text as="p">Use View Transitions for the page shell, and keep the content surface deterministic.</Text>
      </Card.Content>
    </Card.Root>
  </Reveal>
</div>

<style>
  .detail-content { display: grid; gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'search-form',
		description:
			'Horizontal search bar pattern: fields in a responsive CSS grid inside a Card. Adjust the column count to match your field count.',
		tags: ['search', 'form', 'filter', 'horizontal'],
		components: ['Card', 'Field', 'Label', 'Input', 'Button'],
		snippet: `<!-- Pattern: horizontal form in a Card. Adjust columns to match field count. -->
<Card.Root>
  <Card.Content>
    <div class="search-form">
      <Field.Root><Label>Field 1</Label><Input placeholder="..." /></Field.Root>
      <Field.Root><Label>Field 2</Label><!-- DatePicker, Select, etc. --></Field.Root>
      <Field.Root><Label>Field 3</Label><!-- any input --></Field.Root>
      <Button variant="solid">Search</Button>
    </div>
  </Card.Content>
</Card.Root>

<style>
  .search-form { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--dry-space-4); align-items: end; }
</style>`
	},

	{
		name: 'data-table-with-actions',
		description: 'Data table with page header, action button, status badges, and user avatars.',
		tags: ['table', 'data', 'list', 'users', 'admin'],
		components: ['Container', 'Heading', 'Button', 'Table', 'Avatar', 'Badge', 'Text'],
		snippet: `<script>
  import { Container, Heading, Button, Table, Avatar, Badge, Text } from '@dryui/ui';

  const users = [
    { name: 'Sarah Chen', email: 'sarah@example.com', role: 'Admin', status: 'Active', avatar: '/avatars/sarah.jpg' },
    { name: 'Marcus Rivera', email: 'marcus@example.com', role: 'Editor', status: 'Active', avatar: '/avatars/marcus.jpg' },
    { name: 'Emily Watson', email: 'emily@example.com', role: 'Viewer', status: 'Inactive', avatar: '/avatars/emily.jpg' },
  ];
</script>

<Container>
  <div class="table-page">
    <div class="table-header">
      <Heading level={1}>Users</Heading>
      <Button variant="solid">Add User</Button>
    </div>
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>User</Table.Head>
          <Table.Head>Role</Table.Head>
          <Table.Head>Status</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each users as user (user.email)}
          <Table.Row>
            <Table.Cell>
              <div class="user-cell">
                <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} size="sm" />
                <div class="user-info">
                  <Text>{user.name}</Text>
                  <Text size="sm" color="secondary">{user.email}</Text>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="soft">{user.role}</Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="soft" color={user.status === 'Active' ? 'success' : 'gray'}>{user.status}</Badge>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</Container>

<style>
  .table-page { display: grid; gap: var(--dry-space-6); }
  .table-header { display: grid; grid-template-columns: 1fr auto; align-items: center; }
  .user-cell { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; align-items: center; gap: var(--dry-space-2); }
  .user-info { display: grid; gap: var(--dry-space-1); }
</style>`
	},

	{
		name: 'accordion-faq',
		description: 'FAQ section with Accordion for expandable question/answer pairs.',
		tags: ['accordion', 'faq', 'help', 'expandable', 'questions'],
		components: ['Container', 'Heading', 'Accordion', 'Text'],
		snippet: `<script>
  import { Container, Heading, Accordion, Text } from '@dryui/ui';

  const faqs = [
    { id: 'returns', question: 'What is your return policy?', answer: 'You can return any item within 30 days of purchase for a full refund.' },
    { id: 'shipping', question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days. Express shipping is 1-2 business days.' },
    { id: 'support', question: 'How do I contact support?', answer: 'Email us at support@example.com or use the live chat in the bottom-right corner.' },
  ];
</script>

<Container size="md">
  <div class="faq-section">
    <Heading level={2}>Frequently asked questions</Heading>
    <Accordion.Root type="single">
      {#each faqs as faq (faq.id)}
        <Accordion.Item value={faq.id}>
          <Accordion.Trigger>{faq.question}</Accordion.Trigger>
          <Accordion.Content>
            <Text>{faq.answer}</Text>
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</Container>

<style>
  .faq-section { display: grid; gap: var(--dry-space-6); }
</style>`
	},

	{
		name: 'form-with-validation',
		description: 'Contact form inside a card with field validation and error messages.',
		tags: ['form', 'validation', 'contact', 'input', 'error'],
		components: ['Card', 'Field', 'Label', 'Input', 'Textarea', 'Button'],
		snippet: `<script>
  import { Card, Field, Label, Input, Textarea, Button } from '@dryui/ui';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let submitted = $state(false);

  let nameError = $derived(submitted && !name ? 'Name is required' : '');
  let emailError = $derived(
    submitted && !email ? 'Email is required' :
    submitted && !email.includes('@') ? 'Please enter a valid email' : ''
  );
  let messageError = $derived(submitted && !message ? 'Message is required' : '');

  function handleSubmit() {
    submitted = true;
    if (name && email.includes('@') && message) {
      // submit form
    }
  }
</script>

<Card.Root>
  <Card.Header>Contact us</Card.Header>
  <Card.Content>
    <div class="contact-form">
      <Field.Root>
        <Label>Name</Label>
        <Input bind:value={name} />
        {#if nameError}
          <Field.Error>{nameError}</Field.Error>
        {/if}
      </Field.Root>
      <Field.Root>
        <Label>Email</Label>
        <Input type="email" bind:value={email} />
        {#if emailError}
          <Field.Error>{emailError}</Field.Error>
        {/if}
      </Field.Root>
      <Field.Root>
        <Label>Message</Label>
        <Textarea bind:value={message} rows={4} />
        {#if messageError}
          <Field.Error>{messageError}</Field.Error>
        {/if}
      </Field.Root>
      <Button variant="solid" onclick={handleSubmit}>Send message</Button>
    </div>
  </Card.Content>
</Card.Root>

<style>
  .contact-form { display: grid; gap: var(--dry-space-4); }
</style>`
	},

	{
		name: 'modal-edit-form',
		description:
			'Edit-in-dialog pattern — button opens a Dialog with form fields for editing a record. Common CRUD pattern.',
		tags: ['dialog', 'modal', 'edit', 'form', 'crud'],
		components: ['Dialog', 'Button', 'Field', 'Label', 'Input', 'Select'],
		snippet: `<script>
  import { Dialog, Button, Field, Label, Input, Select } from '@dryui/ui';

  let open = $state(false);
  let name = $state('Acme Corp');
  let role = $state('admin');
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button variant="outline">Edit record</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Edit details</Dialog.Header>
    <Dialog.Body>
      <div class="dialog-fields">
        <Field.Root>
          <Label>Name</Label>
          <Input bind:value={name} />
        </Field.Root>
        <Field.Root>
          <Label>Role</Label>
          <Select.Root bind:value={role}>
            <Select.Trigger>
              <Select.Value placeholder="Choose role" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="admin">Admin</Select.Item>
              <Select.Item value="editor">Editor</Select.Item>
              <Select.Item value="viewer">Viewer</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Root>
      </div>
    </Dialog.Body>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => open = false}>Cancel</Button>
      <Button variant="solid" onclick={() => open = false}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<style>
  .dialog-fields { display: grid; gap: var(--dry-space-4); }
</style>`
	},

	{
		name: 'dialog-confirm',
		description:
			'Destructive action confirmation pattern — trigger button opens AlertDialog with cancel/confirm actions. Use for delete, logout, discard flows.',
		tags: ['dialog', 'confirm', 'alert', 'delete', 'destructive', 'modal'],
		components: ['AlertDialog', 'Button', 'Text'],
		snippet: `<script>
  import { AlertDialog, Button, Text } from '@dryui/ui';
</script>

<AlertDialog.Root>
  <AlertDialog.Trigger>
    <Button color="danger" variant="outline">Delete project</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Overlay />
  <AlertDialog.Content>
    <AlertDialog.Header>Delete project?</AlertDialog.Header>
    <AlertDialog.Body>
      <Text>This action cannot be undone. All data associated with this project will be permanently removed.</Text>
    </AlertDialog.Body>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`
	},

	{
		name: 'multi-step-form',
		description:
			'Generic multi-step wizard with Stepper navigation, form fields per step, and back/next buttons. Use for onboarding, registration, surveys.',
		tags: ['wizard', 'stepper', 'multi-step', 'form', 'onboarding'],
		components: ['Card', 'Stepper', 'Field', 'Label', 'Input', 'Button', 'Text'],
		snippet: `<script>
  import { Card, Stepper, Field, Label, Input, Button, Text } from '@dryui/ui';

  let activeStep = $state(0);
  const totalSteps = 3;
</script>

<Card.Root>
  <Card.Header>
    <Stepper.Root bind:activeStep>
      <Stepper.List>
        <Stepper.Step step={0}>Account</Stepper.Step>
        <Stepper.Separator step={0} />
        <Stepper.Step step={1}>Profile</Stepper.Step>
        <Stepper.Separator step={1} />
        <Stepper.Step step={2}>Review</Stepper.Step>
      </Stepper.List>
    </Stepper.Root>
  </Card.Header>
  <Card.Content>
    <div class="step-fields">
      {#if activeStep === 0}
        <Field.Root>
          <Label>Email</Label>
          <Input type="email" />
        </Field.Root>
        <Field.Root>
          <Label>Password</Label>
          <Input type="password" />
        </Field.Root>
      {:else if activeStep === 1}
        <Field.Root>
          <Label>Full name</Label>
          <Input />
        </Field.Root>
        <Field.Root>
          <Label>Company</Label>
          <Input />
        </Field.Root>
      {:else if activeStep === 2}
        <Text>Review your details and submit.</Text>
      {/if}
    </div>
  </Card.Content>
  <Card.Footer>
    <div class="step-actions">
      <Button variant="outline" disabled={activeStep === 0} onclick={() => activeStep--}>Back</Button>
      {#if activeStep < totalSteps - 1}
        <Button onclick={() => activeStep++}>Next</Button>
      {:else}
        <Button onclick={() => { /* submit */ }}>Submit</Button>
      {/if}
    </div>
  </Card.Footer>
</Card.Root>

<style>
  .step-fields { display: grid; gap: var(--dry-space-4); }
  .step-actions { display: grid; grid-template-columns: 1fr auto; align-items: center; }
</style>`
	},

	{
		name: 'drawer-navigation',
		description:
			'Mobile navigation drawer triggered by a hamburger button, containing sidebar navigation and user info. Use for responsive app navigation.',
		tags: ['drawer', 'mobile', 'navigation', 'sidebar', 'hamburger', 'responsive'],
		components: ['Drawer', 'Button', 'Sidebar', 'Avatar', 'Text', 'Separator'],
		snippet: `<script>
  import { Drawer, Button, Sidebar, Avatar, Text, Separator } from '@dryui/ui';

  let drawerOpen = $state(false);
</script>

<Drawer.Root bind:open={drawerOpen} side="left">
  <Drawer.Trigger>
    <Button variant="ghost" size="icon" aria-label="Open menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <div class="drawer-user">
        <Avatar src="/avatar.jpg" alt="Jane Smith" fallback="JS" size="md" />
        <div class="drawer-user-info">
          <Text as="span" size="md">Jane Smith</Text>
          <Text as="span" size="sm" color="muted">jane@example.com</Text>
        </div>
      </div>
    </Drawer.Header>
    <Drawer.Body>
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Main</Sidebar.GroupLabel>
            <Sidebar.Item href="/dashboard" active>Dashboard</Sidebar.Item>
            <Sidebar.Item href="/projects">Projects</Sidebar.Item>
            <Sidebar.Item href="/messages">Messages</Sidebar.Item>
          </Sidebar.Group>
          <Separator />
          <Sidebar.Group>
            <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
            <Sidebar.Item href="/settings">Settings</Sidebar.Item>
            <Sidebar.Item href="/help">Help</Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Drawer.Body>
    <Drawer.Footer>
      <Button variant="ghost" onclick={() => { drawerOpen = false; }}>Sign out</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<style>
  .drawer-user { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; align-items: center; gap: var(--dry-space-4); }
  .drawer-user-info { display: grid; gap: var(--dry-space-2); }
</style>`
	},

	{
		name: 'toast-notifications',
		description:
			'Pattern showing how to trigger success/error/info toast notifications from user actions. Shows the imperative toast trigger pattern using toastStore.',
		tags: ['toast', 'notification', 'alert', 'feedback', 'success', 'error'],
		components: ['Toast', 'Button'],
		snippet: `<script>
  import { Toast, Button } from '@dryui/ui';
  import { toastStore } from '@dryui/ui/toast';
</script>

<!-- Place Toast.Provider once in your layout (e.g. +layout.svelte) -->
<Toast.Provider position="bottom-right" />

<div class="toast-triggers">
  <Button variant="solid" onclick={() => toastStore.success('Changes saved', { description: 'Your settings have been updated.' })}>
    Save changes
  </Button>
  <Button variant="outline" onclick={() => toastStore.info('Tip', { description: 'You can undo this action within 5 seconds.' })}>
    Show info
  </Button>
  <Button variant="soft" color="danger" onclick={() => toastStore.error('Delete failed', { description: 'Could not delete the item. Please try again.' })}>
    Trigger error
  </Button>
</div>

<style>
  .toast-triggers { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; gap: var(--dry-space-4); }
</style>`
	},

	{
		name: 'user-profile-card',
		description: 'User profile card with avatar, name, role, stats, and action buttons.',
		tags: ['profile', 'user', 'card', 'avatar'],
		components: ['Card', 'Avatar', 'Text', 'Heading', 'Badge', 'Button', 'Separator'],
		snippet: `<script>
  import { Card, Avatar, Text, Heading, Badge, Button, Separator } from '@dryui/ui';
</script>

<Card.Root>
  <Card.Content>
    <div class="profile-card">
      <Avatar src="/photo.jpg" alt="Jane Smith" fallback="JS" size="xl" />
      <div class="profile-identity">
        <Heading level={3}>Jane Smith</Heading>
        <Text color="secondary">Product Designer</Text>
        <Badge variant="soft" color="success">Available</Badge>
      </div>
      <Separator />
      <div class="profile-stats">
        <div class="stat-item">
          <Text weight="bold">142</Text>
          <Text size="sm" color="secondary">Projects</Text>
        </div>
        <div class="stat-item">
          <Text weight="bold">1.2k</Text>
          <Text size="sm" color="secondary">Followers</Text>
        </div>
        <div class="stat-item">
          <Text weight="bold">89</Text>
          <Text size="sm" color="secondary">Following</Text>
        </div>
      </div>
      <div class="profile-actions">
        <Button variant="solid">Follow</Button>
        <Button variant="outline">Message</Button>
      </div>
    </div>
  </Card.Content>
</Card.Root>

<style>
  .profile-card { display: grid; justify-items: center; gap: var(--dry-space-4); }
  .profile-identity { display: grid; justify-items: center; gap: var(--dry-space-1); }
  .profile-stats { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; gap: var(--dry-space-8); }
  .stat-item { display: grid; justify-items: center; gap: var(--dry-space-1); }
  .profile-actions { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; gap: var(--dry-space-2); }
</style>`
	},

	{
		name: 'notification-list',
		description: 'Notification feed with avatars, timestamps, and read/unread states.',
		tags: ['notification', 'feed', 'list', 'activity'],
		components: ['Card', 'Avatar', 'Text', 'Badge', 'Separator'],
		snippet: `<script>
  import { Card, Avatar, Text, Badge, Separator } from '@dryui/ui';

  const notifications = [
    { user: 'Sarah Chen', avatar: 'SC', action: 'commented on', target: 'Design Review', time: '2 min ago', unread: true },
    { user: 'Marcus Rivera', avatar: 'MR', action: 'approved', target: 'PR #142', time: '1 hour ago', unread: true },
    { user: 'Emily Watson', avatar: 'EW', action: 'assigned you to', target: 'Bug Fix #89', time: '3 hours ago', unread: false },
  ];
</script>

<Card.Root>
  <Card.Header>
    <div class="notif-header">
      <Text weight="bold">Notifications</Text>
      <Badge variant="soft">{notifications.filter(n => n.unread).length} new</Badge>
    </div>
  </Card.Header>
  <Card.Content>
    <div class="notif-list">
      {#each notifications as notif, i (notif.time)}
        <div class="notif-item">
          <Avatar fallback={notif.avatar} size="sm" />
          <div class="notif-body">
            <Text>
              <Text weight="bold">{notif.user}</Text> {notif.action} <Text weight="medium">{notif.target}</Text>
            </Text>
            <Text size="sm" color="secondary">{notif.time}</Text>
          </div>
          {#if notif.unread}
            <div class="unread-dot" aria-label="Unread"></div>
          {/if}
        </div>
        {#if i < notifications.length - 1}
          <Separator />
        {/if}
      {/each}
    </div>
  </Card.Content>
</Card.Root>

<style>
  .notif-header { display: grid; grid-template-columns: 1fr auto; align-items: center; }
  .notif-list { display: grid; gap: var(--dry-space-2); }
  .notif-item { display: grid; grid-template-columns: max-content 1fr max-content; align-items: start; gap: var(--dry-space-2); }
  .notif-body { display: grid; gap: var(--dry-space-1); }
  .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dry-color-fill-brand); margin-top: var(--dry-space-1); }
</style>`
	},

	{
		name: 'activity-feed',
		description:
			'Activity/audit log feed using Timeline with avatars, relative timestamps, and action badges.',
		tags: ['activity', 'feed', 'timeline', 'audit', 'log', 'history'],
		components: ['Card', 'Timeline', 'Avatar', 'Text', 'Badge'],
		snippet: `<script>
  import { Card, Timeline, Avatar, Text, Badge } from '@dryui/ui';

  const activities = [
    { user: 'Alice Park', initials: 'AP', action: 'deployed', target: 'v2.4.0 to production', time: '2024-09-15T14:32:00Z', timeLabel: '5 min ago', badge: 'success' },
    { user: 'Carlos Diaz', initials: 'CD', action: 'merged', target: 'PR #217 — Dark mode fixes', time: '2024-09-15T13:10:00Z', timeLabel: '1 hour ago', badge: 'info' },
    { user: 'Priya Nair', initials: 'PN', action: 'commented on', target: 'Issue #84', time: '2024-09-15T11:45:00Z', timeLabel: '3 hours ago', badge: 'gray' },
  ];
</script>

<Card.Root>
  <Card.Header>Activity</Card.Header>
  <Card.Content>
    <Timeline.Root>
      {#each activities as event (event.time)}
        <Timeline.Item>
          <Timeline.Icon>
            <Avatar fallback={event.initials} size="sm" />
          </Timeline.Icon>
          <Timeline.Content>
            <Timeline.Title level={6}>
              {event.user} <Badge variant="soft" color={event.badge}>{event.action}</Badge> {event.target}
            </Timeline.Title>
            <Timeline.Time datetime={event.time}>{event.timeLabel}</Timeline.Time>
          </Timeline.Content>
        </Timeline.Item>
      {/each}
    </Timeline.Root>
  </Card.Content>
</Card.Root>`
	},

	{
		name: 'command-bar',
		description: 'Command palette with keyboard shortcut trigger for search and actions.',
		tags: ['command', 'palette', 'search', 'keyboard', 'shortcut'],
		components: ['CommandPalette', 'Hotkey'],
		snippet: `<script>
  import { CommandPalette, Hotkey } from '@dryui/ui';

  let open = $state(false);

  function handleSelect(value) {
    if (value === 'new') { /* create new */ }
    else if (value === 'search') { /* open search */ }
    open = false;
  }
</script>

<Hotkey keys="mod+k" onpress={() => open = true} />

<CommandPalette.Root bind:open onSelect={handleSelect}>
  <CommandPalette.Input placeholder="Type a command or search..." />
  <CommandPalette.List>
    <CommandPalette.Empty>No results found.</CommandPalette.Empty>
    <CommandPalette.Group heading="Actions">
      <CommandPalette.Item value="new">New document</CommandPalette.Item>
      <CommandPalette.Item value="search">Search files</CommandPalette.Item>
      <CommandPalette.Item value="settings">Open settings</CommandPalette.Item>
    </CommandPalette.Group>
    <CommandPalette.Group heading="Navigation">
      <CommandPalette.Item value="dashboard">Go to Dashboard</CommandPalette.Item>
      <CommandPalette.Item value="projects">Go to Projects</CommandPalette.Item>
    </CommandPalette.Group>
  </CommandPalette.List>
</CommandPalette.Root>`
	},

	{
		name: 'file-upload-form',
		description: 'File upload with drag-and-drop zone, progress indicator, and submit button.',
		tags: ['file', 'upload', 'drag', 'drop', 'form'],
		components: ['Card', 'FileUpload', 'Progress', 'Button', 'Text'],
		snippet: `<script>
  import { Card, FileUpload, Progress, Button, Text } from '@dryui/ui';

  let files = $state([]);
  let uploadProgress = $state(0);
  let uploading = $state(false);

  async function handleUpload() {
    uploading = true;
    // simulate upload
    for (let i = 0; i <= 100; i += 10) {
      uploadProgress = i;
      await new Promise(r => setTimeout(r, 200));
    }
    uploading = false;
  }
</script>

<Card.Root>
  <Card.Header>Upload files</Card.Header>
  <Card.Content>
    <div class="upload-form">
      <FileUpload.Root bind:files accept="image/*,.pdf">
        <FileUpload.Dropzone>
          <div class="dropzone-hint">
            <Text color="secondary">Drag and drop files here, or click to browse</Text>
            <Text size="sm" color="secondary">PNG, JPG, PDF up to 10MB</Text>
          </div>
        </FileUpload.Dropzone>
        <FileUpload.List />
      </FileUpload.Root>
      {#if uploading}
        <Progress value={uploadProgress} max={100} />
      {/if}
      <Button variant="solid" onclick={handleUpload} disabled={!files.length || uploading}>
        {uploading ? 'Uploading...' : 'Upload files'}
      </Button>
    </div>
  </Card.Content>
</Card.Root>

<style>
  .upload-form { display: grid; gap: var(--dry-space-4); }
  .dropzone-hint { display: grid; justify-items: center; gap: var(--dry-space-2); }
</style>`
	},

	{
		name: 'data-table-with-toolbar',
		description:
			'Data table with toolbar controls, search input, column toggles, and bulk actions.',
		tags: ['table', 'toolbar', 'data', 'search', 'admin'],
		components: ['Container', 'Card', 'Toolbar', 'Input', 'DropdownMenu', 'DataGrid'],
		snippet: `<script>
  import { Container, Card, Toolbar, Input, DropdownMenu, DataGrid } from '@dryui/ui';

  let search = $state('');
  let rows = $state([
    { id: '1', name: 'Alice', status: 'Active' },
    { id: '2', name: 'Bob', status: 'Inactive' },
  ]);
</script>

<Container>
  <Card.Root>
    <Card.Header>
      <Toolbar.Root>
        <Input bind:value={search} placeholder="Search..." size="sm" />
        <Toolbar.Separator />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Toolbar.Button>Columns</Toolbar.Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Toggle Name</DropdownMenu.Item>
            <DropdownMenu.Item>Toggle Status</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Toolbar.Button>Export</Toolbar.Button>
      </Toolbar.Root>
    </Card.Header>
    <Card.Content>
      <DataGrid.Root items={rows}>
        <DataGrid.Table>
          <DataGrid.Header>
            <DataGrid.Column key="name">{#snippet children()}Name{/snippet}</DataGrid.Column>
            <DataGrid.Column key="status">{#snippet children()}Status{/snippet}</DataGrid.Column>
          </DataGrid.Header>
          <DataGrid.Body>
            {#snippet children({ items })}
              {#each items as row}
                <DataGrid.Row rowId={row.id}>
                  <DataGrid.Cell>{row.name}</DataGrid.Cell>
                  <DataGrid.Cell>{row.status}</DataGrid.Cell>
                </DataGrid.Row>
              {/each}
            {/snippet}
          </DataGrid.Body>
        </DataGrid.Table>
        <DataGrid.Pagination />
      </DataGrid.Root>
    </Card.Content>
  </Card.Root>
</Container>`
	},

	{
		name: 'notification-center',
		description: 'Notification center with grouped notifications, read states, and actions.',
		tags: ['notification', 'header', 'alerts', 'activity'],
		components: ['NotificationCenter', 'Button', 'Badge', 'Text', 'Separator'],
		snippet: `<script>
  import { NotificationCenter, Button, Badge, Text, Separator } from '@dryui/ui';
</script>

<NotificationCenter.Root>
  <NotificationCenter.Trigger>
    {#snippet children({ unreadCount })}
      <Button variant="ghost" aria-label="Notifications">
        Notifications {#if unreadCount}<Badge variant="solid" color="danger">{unreadCount}</Badge>{/if}
      </Button>
    {/snippet}
  </NotificationCenter.Trigger>
  <NotificationCenter.Panel>
    <NotificationCenter.Group label="New">
      <NotificationCenter.Item id="n1" variant="info">
        <div class="notif-text">
          <Text>Sarah Chen commented on your design</Text>
          <Text size="sm" color="secondary">2 minutes ago</Text>
        </div>
      </NotificationCenter.Item>
      <NotificationCenter.Item id="n2" variant="info">
        <div class="notif-text">
          <Text>Build #142 completed successfully</Text>
          <Text size="sm" color="secondary">15 minutes ago</Text>
        </div>
      </NotificationCenter.Item>
    </NotificationCenter.Group>
    <Separator />
    <NotificationCenter.Group label="Earlier">
      <NotificationCenter.Item id="n3" variant="info">
        <div class="notif-text">
          <Text>New team member joined</Text>
          <Text size="sm" color="secondary">3 hours ago</Text>
        </div>
      </NotificationCenter.Item>
    </NotificationCenter.Group>
  </NotificationCenter.Panel>
</NotificationCenter.Root>

<style>
  .notif-text { display: grid; gap: var(--dry-space-1); }
</style>`
	},

	{
		name: 'surface-composition',
		description:
			'Layered visual effects (Aurora background, Noise grain, Glow highlight) composed with nesting. Each wrapper adds one effect layer; content sits inside the innermost component.',
		tags: ['surface', 'aurora', 'noise', 'glow', 'effects', 'layering'],
		components: ['Aurora', 'Noise', 'Glow', 'Card'],
		snippet: `<script>
  import { Aurora, Noise, Glow, Card } from '@dryui/ui';
</script>

<Aurora palette="cosmic" intensity={60}>
  <Noise opacity={0.05} blend="soft-light">
    <Glow color="rgba(139,92,246,0.4)" intensity={40}>
      <Card.Root>
        <Card.Content>Content renders above the effect stack</Card.Content>
      </Card.Root>
    </Glow>
  </Noise>
</Aurora>`
	},

	{
		name: 'affixed-input-field',
		description:
			'Input field with attached prefix, suffix, and action affordances for prices, units, and inline checks.',
		tags: ['input', 'affix', 'field', 'prefix', 'suffix', 'action'],
		components: ['AffixGroup', 'Input', 'Button'],
		snippet: `<script>
  import { AffixGroup, Input, Button } from '@dryui/ui';

  let amount = $state('');
</script>

<AffixGroup.Root>
  <AffixGroup.Prefix>$</AffixGroup.Prefix>
  <AffixGroup.Input>
    <Input bind:value={amount} placeholder="0.00" />
  </AffixGroup.Input>
  <AffixGroup.Suffix>USD</AffixGroup.Suffix>
  <AffixGroup.Action>Apply</AffixGroup.Action>
</AffixGroup.Root>`
	},

	{
		name: 'selectable-tile-picker',
		description:
			'Single-select tile picker for visible option sets such as plans, delivery modes, or feature bundles.',
		tags: ['selection', 'tiles', 'radio', 'picker', 'choice'],
		components: ['SelectableTileGroup', 'Field', 'Label'],
		snippet: `<script>
  import { SelectableTileGroup, Field, Label } from '@dryui/ui';

  let plan = $state('standard');
</script>

<Field.Root>
  <Label>Plan</Label>
  <SelectableTileGroup.Root bind:value={plan}>
    <SelectableTileGroup.Item value="standard">
      <SelectableTileGroup.Label>Standard</SelectableTileGroup.Label>
      <SelectableTileGroup.Description>Best for most teams</SelectableTileGroup.Description>
    </SelectableTileGroup.Item>
  </SelectableTileGroup.Root>
</Field.Root>`
	},

	{
		name: 'aligned-card-list',
		description:
			'Vertically stacked rows that look like cards but share column alignment using CSS subgrid. Use for flight results, product comparisons, pricing tables, or any list where columns must align across rows.',
		tags: [
			'card',
			'list',
			'align',
			'column',
			'table',
			'row',
			'subgrid',
			'e-commerce',
			'travel',
			'flight',
			'product',
			'dashboard',
			'comparison',
			'pricing'
		],
		components: ['Card', 'Badge', 'Text'],
		snippet: `<!-- Aligned card list — parent grid defines shared columns,
     each Card.Root uses subgrid to inherit the tracks.
     Columns stay aligned across all rows without a <table>. -->
<script>
  import { Card, Badge, Text } from '@dryui/ui';

  const flights = [
    { airline: 'Skyline Air', route: 'SFO → JFK', depart: '08:15', arrive: '16:45', duration: '5h 30m', stops: 'Nonstop', price: '$289' },
    { airline: 'Pacific Wings', route: 'SFO → JFK', depart: '10:40', arrive: '21:10', duration: '7h 30m', stops: '1 stop', price: '$194' },
    { airline: 'Coastal Jet', route: 'SFO → JFK', depart: '14:20', arrive: '22:50', duration: '5h 30m', stops: 'Nonstop', price: '$312' },
  ];
</script>

<div class="flight-list">
  <!-- Column headers share the same grid tracks as rows -->
  <div class="flight-list-header">
    <Text as="span" size="sm" color="muted">Airline</Text>
    <Text as="span" size="sm" color="muted">Route</Text>
    <Text as="span" size="sm" color="muted">Depart</Text>
    <Text as="span" size="sm" color="muted">Arrive</Text>
    <Text as="span" size="sm" color="muted">Duration</Text>
    <Text as="span" size="sm" color="muted">Price</Text>
  </div>

  {#each flights as flight (flight.airline + flight.depart)}
    <Card.Root variant="interactive">
      <Card.Content noPadding>
        <div class="flight-row">
          <div class="flight-cell">
            <Text as="span" weight="medium">{flight.airline}</Text>
          </div>
          <div class="flight-cell">
            <Text as="span" font="mono">{flight.route}</Text>
          </div>
          <div class="flight-cell">
            <Text as="span" weight="semibold">{flight.depart}</Text>
          </div>
          <div class="flight-cell">
            <Text as="span" weight="semibold">{flight.arrive}</Text>
          </div>
          <div class="flight-cell">
            <Text as="span" size="sm" color="secondary">{flight.duration}</Text>
            <Badge variant="soft" color={flight.stops === 'Nonstop' ? 'green' : 'gray'}>{flight.stops}</Badge>
          </div>
          <div class="flight-cell">
            <Text as="span" weight="bold">{flight.price}</Text>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

<style>
  /* Parent grid defines the shared column tracks */
  .flight-list {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto 1fr auto;
    gap: var(--dry-space-2);
  }

  /* Header spans all columns and inherits tracks via subgrid */
  .flight-list-header {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding: 0 var(--dry-space-4) var(--dry-space-2);
  }

  /* :global() is required here — subgrid must reach Card's internal
     elements which live in a child component scope. */
  .flight-list :global([data-card]) {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
  }

  .flight-list :global([data-card-content]) {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
  }

  /* Row inside the card inherits tracks */
  .flight-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    align-items: center;
    padding: var(--dry-space-3) var(--dry-space-4);
  }

  /* Each cell aligns to its parent track */
  .flight-cell {
    display: grid;
    gap: var(--dry-space-1);
    align-content: center;
  }

  /* Responsive: collapse to stacked layout on narrow containers */
  @container (max-width: 640px) {
    .flight-list {
      grid-template-columns: 1fr;
    }

    .flight-list-header {
      display: none;
    }

    .flight-row {
      grid-template-columns: 1fr 1fr;
      gap: var(--dry-space-2);
    }
  }
</style>`
	},

	{
		name: 'custom-button-color',
		description:
			'Customize a Button past the built-in primary/danger palette. Three tiers from least-invasive to most: (a) use the color="ink" preset for a solid near-black editorial CTA that auto-inverts in dark theme, (b) pass a scoped class to tune padding, radius, or typography without theme drift, (c) wrap with --dry-btn-* token overrides for deep visual customization when neither preset nor class is enough.',
		tags: [
			'button',
			'cta',
			'ink',
			'black',
			'editorial',
			'color',
			'custom',
			'customize',
			'download',
			'theme',
			'tokens'
		],
		components: ['Button'],
		snippet: `<!-- Tier A: color="ink" preset (preferred).
     Renders a solid near-black button with white text in light theme; in dark
     theme it auto-inverts to a white button with near-black text. Uses
     --dry-color-bg-inverse / --dry-color-text-inverse under the hood, so any
     theme override of those tokens flows through. Zero configuration. -->
<script>
  import { Button } from '@dryui/ui';
</script>

<Button color="ink" size="lg" href="/download">Download for Mac</Button>

<!-- Tier B: scoped \`class\` prop (granular typography/shape).
     Button forwards \`class\` to its root element, alongside internal data-*
     attributes. Use for per-call-site tweaks that do not fit a token. Keep
     selectors scoped; :global() escapes are fine because Button's root is
     rendered inside the consumer's component scope. -->
<script>
  import { Button } from '@dryui/ui';
</script>

<Button class="hero-cta" color="ink" size="lg" href="/download">
  Download for Mac
</Button>

<style>
  .hero-cta {
    letter-spacing: 0.02em;
    font-weight: 600;
    min-width: 16rem;
  }
</style>

<!-- Tier C: --dry-btn-* token overrides (deepest).
     Every button visual is routed through a public --dry-btn-* var with a
     token default. Override the vars on a wrapper (or on the Button itself via
     \`style=\`) when you need a specific background, text, border, radius, or
     shadow that is not reachable by preset or class. -->
<script>
  import { Button } from '@dryui/ui';
</script>

<span class="brand-cta">
  <Button size="lg" href="/download">Download for Mac</Button>
</span>

<style>
  .brand-cta {
    --dry-btn-bg: #111111;
    --dry-btn-color: #fafafa;
    --dry-btn-border: #000000;
    --dry-btn-radius: 9999px;
  }
</style>`
	},

	{
		name: 'narrow-headline',
		description:
			'Editorial hero with a ch-bounded headline. Uses <Heading maxMeasure="narrow"> to cap the headline at ~22ch so long titles wrap on a measure that feels typeset, not reflowed. Replaces the legacy grid-wrapper hack (grid-template-columns: minmax(0, 34rem) 1fr) that was only needed while dryui/no-width banned max-width entirely.',
		tags: [
			'headline',
			'hero',
			'typography',
			'measure',
			'heading',
			'editorial',
			'narrow',
			'max-inline-size',
			'ch',
			'osaurus'
		],
		components: ['Heading', 'Text'],
		snippet: `<!-- Editorial hero: narrow headline measure for rhythm.
     maxMeasure="narrow" maps to max-inline-size: 22ch on the rendered <h*>.
     ch tracks the text content, so the measure adapts to font size and zoom
     without freezing a px layout. Body copy stays readable with its own cap. -->
<script>
  import { Heading, Text } from '@dryui/ui';
</script>

<section class="hero">
  <Heading level={1} variant="display" maxMeasure="narrow">
    Inference is all you need.
  </Heading>
  <Text size="lg" color="muted" maxMeasure="default">
    Run open-weight models on your laptop. No cloud, no keys, no telemetry.
  </Text>
</section>

<style>
  .hero {
    display: grid;
    gap: var(--dry-space-6);
    padding-block: var(--dry-space-16);
  }
</style>

<!-- Anti-pattern (do not do this):

  <div class="hero-grid">
    <Heading level={1}>Inference is all you need.</Heading>
  </div>

  <style>
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 34rem) 1fr;
    }
  </style>

  That wrapper existed only to cap the heading width before maxMeasure shipped.
  It mixes layout with typographic measure and pins the cap in rem, which does
  not track the font. Prefer maxMeasure="narrow" on Heading directly. -->`
	},

	{
		name: 'serif-display',
		description:
			'Heading variant="display" with a serif typeface. Override --dry-font-display on body (or a scoped wrapper), never :root (that trips the theme-checker full-theme-override rule). Without an override, display falls back to --dry-font-sans.',
		tags: [
			'typography',
			'display',
			'heading',
			'serif',
			'font',
			'newsreader',
			'google-fonts',
			'theme',
			'--dry-font-display',
			'editorial'
		],
		components: ['Heading'],
		snippet: `<!-- Serif display heading: override --dry-font-display on a scoped
     wrapper. variant="display" on Heading reads --dry-font-display and
     falls back to --dry-font-sans, so without an override you get sans. -->

<!-- 1. app.html: link a serif font. Newsreader is a good editorial default. -->
<!doctype html>
<html lang="en" class="theme-auto">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
      rel="stylesheet"
    />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>

<!-- 2. app.css: override --dry-font-display on body (or a .page wrapper).
     Do NOT put this on :root (that trips the theme-checker
     full-theme-override rule, which reserves :root for generated theme
     files). Scoping to body keeps the override local to the app instance
     and reads every <Heading variant="display"> beneath it. -->
body {
  --dry-font-display: 'Newsreader', Georgia, 'Times New Roman', serif;
}

<!-- 3. Any page: variant="display" now renders with the serif. -->
<script>
  import { Heading, Text } from '@dryui/ui';
</script>

<section class="hero">
  <Heading level={1} variant="display" maxMeasure="narrow">
    Inference is all you need.
  </Heading>
  <Text size="lg" color="muted">Open-weight models, on your laptop.</Text>
</section>

<style>
  .hero {
    display: grid;
    gap: var(--dry-space-6);
  }
</style>

<!-- Gotchas:
     - Only the Heading variant reads --dry-font-display. Other typography
       components still use --dry-font-sans or --dry-font-mono.
     - Override on body or a .page wrapper, NOT on :root. The theme-checker
       treats :root { --dry-* } blocks as full theme overrides and flags them
       when they do not ship a complete token set.
     - If you want the serif scoped to one section (landing page only), move
       the override onto a wrapper class instead of body. -->`
	},

	{
		name: 'chip-row',
		description:
			'Responsive wrapping row of Badge, Chip, or tag children. ChipGroup.Root is the sanctioned flex-wrap wrapper: it carries the data-chip-group attribute that exempts it from dryui/no-flex, so a 20-item tag list reflows naturally across any container width without grid breakpoints.',
		tags: [
			'chip',
			'tag',
			'badge',
			'pill',
			'wrap',
			'cluster',
			'flex-wrap',
			'responsive',
			'filter',
			'layout'
		],
		components: ['ChipGroup', 'Badge'],
		snippet: `<script>
  import { ChipGroup, Badge } from '@dryui/ui';
</script>

<!-- Canonical chip row: ChipGroup.Root wraps Badge/Chip children and
     handles responsive flow. DO NOT reach for <div style="display:flex;
     flex-wrap:wrap"> or a grid-template-columns: repeat(N, max-content)
     hack — ChipGroup.Root is the carve-out. -->
<ChipGroup.Root gap="md">
  <Badge variant="soft" color="blue">TypeScript</Badge>
  <Badge variant="soft" color="green">Svelte 5</Badge>
  <Badge variant="soft" color="purple">Vite</Badge>
  <Badge variant="soft">Bun</Badge>
  <Badge variant="soft">Vitest</Badge>
  <Badge variant="soft">Playwright</Badge>
</ChipGroup.Root>

<!-- gap: 'sm' | 'md' | 'lg' — maps to --dry-space tokens.
     justify: 'start' | 'center' | 'end' | 'between' — controls horizontal
     alignment when the row does not fill the container. -->`
	},

	{
		name: 'works-with',
		description:
			'Eyebrow-labelled provider list, like the osaurus.ai "WORKS WITH" section. ChipGroup.Label renders the small-caps eyebrow, and the Root handles wrapping across breakpoints. Use for "compatible with", "integrates with", "powered by", or any capability disclosure that needs a heading plus a wrapping pill list.',
		tags: [
			'works-with',
			'compatible',
			'integrates',
			'powered-by',
			'eyebrow',
			'label',
			'marketing',
			'provider',
			'capability',
			'chip',
			'badge'
		],
		components: ['ChipGroup', 'Badge'],
		snippet: `<script>
  import { ChipGroup, Badge } from '@dryui/ui';
</script>

<!-- "WORKS WITH" pattern: eyebrow label + wrapping provider badges.
     ChipGroup.Label lives inside Root as the first child so the flex row
     treats it as a sibling pill-height item with the rest of the chips. -->
<ChipGroup.Root gap="md" justify="start">
  <ChipGroup.Label>WORKS WITH</ChipGroup.Label>
  <Badge variant="soft">Local / MLX</Badge>
  <Badge variant="soft">OpenAI</Badge>
  <Badge variant="soft">Anthropic</Badge>
  <Badge variant="soft">Google</Badge>
  <Badge variant="soft">Mistral</Badge>
  <Badge variant="soft">Groq</Badge>
  <Badge variant="soft">Ollama</Badge>
  <Badge variant="soft">OpenRouter</Badge>
  <Badge variant="soft">Together</Badge>
  <Badge variant="soft">Perplexity</Badge>
  <Badge variant="soft">xAI</Badge>
</ChipGroup.Root>

<!-- Variants:
     - gap="lg"               more breathing room between providers
     - justify="center"       centre the list under a hero heading
     - Swap Badge for Chip    if providers should be clickable filters -->`
	},

	{
		name: 'self-correction',
		description:
			'The DryUI self-correction loop for agents: write Svelte, run `dryui check`, read the structured `dryui-diagnostics` JSON block, apply the `hint` for each issue, re-run `check`. Stop when diagnostics are empty. Use `svelte-autofixer` via the Svelte MCP in between for compiler-level fixes.',
		tags: [
			'agent',
			'repair',
			'self-correction',
			'check',
			'lint',
			'hint',
			'diagnostics',
			'loop',
			'autofix'
		],
		components: [],
		snippet: `<!--
  Agent repair loop for DryUI check output.

  Every 'check' response over MCP carries two content blocks:
    1. TOON summary (human-readable)
    2. A JSON block tagged 'dryui-diagnostics' with { diagnostics: [...] }

  Each diagnostic has { code, severity, file, line?, hint?, docsRef?, fix? }.
  Prefer 'hint' over 'message'. 'hint' is prescriptive ("do X"), 'message'
  is diagnostic ("X is wrong").
-->

1. write Svelte or theme CSS
2. call tool 'check' with { path: 'path/to/file.svelte' }
3. parse the dryui-diagnostics JSON block from the response
4. for each diagnostic with severity = 'error':
     - if diagnostic.fix exists, apply fix.after and goto step 6
     - otherwise apply diagnostic.hint to produce a candidate edit
5. write the edited file
6. for Svelte-compiler-level issues, call the Svelte MCP
   'svelte-autofixer' tool on the file
7. call 'check' again
8. loop until diagnostics is empty or no progress is being made

Stop conditions:
  - diagnostics array is empty AND hasBlockers=false -> done
  - same diagnostic code repeats after 2 attempts -> surface to human
  - any parse/* diagnostic -> fix the syntax before looping further`
	},

	// ── Visual Polish ─────────────────────────────────────────────────────────

	{
		name: 'typography',
		description:
			'Text wrapping and typographic pairings. Use <Heading> for balanced headings, <Text as="p"> for pretty paragraphs. Both ship with text-wrap defaults that prevent orphans.',
		tags: ['typography', 'heading', 'text', 'text-wrap', 'balance', 'pretty', 'polish'],
		components: ['Heading', 'Text'],
		snippet: `<script>
  import { Heading, Text } from '@dryui/ui';
</script>

<Heading level={1}>
  Heading with text-wrap: balance
  so subtitles don't strand a single word.
</Heading>
<Text as="p">
  Body copy uses text-wrap: pretty by default. It's subtler than balance. Prevents single-word orphans on the last line without re-wrapping the whole paragraph.
</Text>

<!-- Raw <h1> and <p> also get the defaults via :where() in the theme reset,
     so even hand-rolled markdown inherits the treatment. -->`
	},

	{
		name: 'concentric-radius',
		description:
			'Radius harmony: outer radius = inner radius + padding. Use the --dry-radius-nested-<container> tokens for any child inside a padded container (Card, Dialog, Popover, Toast, Tooltip, Sheet, Field).',
		tags: ['radius', 'concentric', 'card', 'nesting', 'polish', 'corner', 'rounded'],
		components: ['Card', 'Button'],
		snippet: `<script>
  import { Card, Button } from '@dryui/ui';
</script>

<Card.Root>
  <Card.Content>
    <!-- The Button inside this Card inherits --dry-btn-radius: var(--dry-radius-nested-card)
         automatically, so inner corners sit concentric with the outer 16px. -->
    <Button>Action</Button>
  </Card.Content>
</Card.Root>

<!-- Nested tokens available: nested-card, nested-dialog, nested-popover,
     nested-sheet, nested-toast, nested-tooltip, nested-field. -->`
	},

	{
		name: 'icon-swap',
		description:
			'Animate between two icons on state change (copy to check, play to pause, chevron flip). Uses the retarget-friendly opacity/scale/blur transition so repeated toggles feel right.',
		tags: ['icon', 'animation', 'swap', 'copy', 'check', 'polish', 'motion'],
		components: ['IconSwap', 'Button'],
		snippet: `<script>
  import { Button, IconSwap } from '@dryui/ui';
  import CopyIcon from '@dryui/icons/copy.svelte';
  import CheckIcon from '@dryui/icons/check.svelte';

  let copied = $state(false);

  function copy() {
    navigator.clipboard.writeText('hello');
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<Button onclick={copy}>
  <IconSwap icon={copied ? CheckIcon : CopyIcon} />
  {copied ? 'Copied' : 'Copy'}
</Button>`
	},

	{
		name: 'numeric-display',
		description:
			'Stable-width digit rendering for counters, clocks, prices, scores. Tabular-nums stops digits from jittering as values change.',
		tags: ['numeric', 'counter', 'clock', 'tabular-nums', 'digits', 'polish', 'number'],
		components: ['Numeric', 'Badge'],
		snippet: `<script>
  import { Numeric, Badge } from '@dryui/ui';

  let count = $state(0);
</script>

<Numeric value={count} stable minDigits={3} align="end" />
<Badge numeric>{count}</Badge>

<button onclick={() => count++}>+</button>

<!-- Or apply the utility class directly to any numeric element:
  <span class="dry-tabular-nums">{value}</span>
-->`
	},

	{
		name: 'interactive-motion',
		description:
			'Transitions vs keyframes. Use transitions for interactive states (hover, focus, open/close) so the motion retargets mid-interaction. Keyframes are for one-shot staged sequences.',
		tags: ['motion', 'transition', 'keyframe', 'interactive', 'polish', 'interruptible'],
		components: [],
		snippet: `<script>
  let open = $state(false);
</script>

<button
  onclick={() => (open = !open)}
  data-state={open ? 'open' : 'closed'}
  class="toggle"
>
  Toggle
</button>

<style>
  /* GOOD: transition retargets mid-press. Spamming the button feels right. */
  .toggle {
    transform: scale(1);
    transition: transform var(--dry-duration-fast) var(--dry-ease-spring-snappy);
  }
  .toggle[data-state='open'] {
    transform: scale(1.1);
  }

  /* BAD (don't do this):
  @keyframes wobble { ... }
  .toggle[data-state='open'] { animation: wobble 200ms; }
  Fixed timeline, can't retarget if user releases mid-animation. */
</style>`
	},

	{
		name: 'stagger-entrance',
		description:
			'Break entering content into chunks, stagger by 80 to 100ms. Use <Enter> for a single element, <Stagger> for a container, or in:enter={{ index }} for a Svelte transition.',
		tags: ['enter', 'stagger', 'animation', 'entrance', 'polish', 'motion', 'reveal'],
		components: ['Enter', 'Stagger', 'Heading', 'Text', 'Button'],
		snippet: `<script>
  import { Enter, Stagger, Heading, Text, Button } from '@dryui/ui';
  import { enter } from '@dryui/ui/motion';
</script>

<!-- Option A: auto-indexed Stagger container -->
<Stagger step="section">
  <Heading level={1}>Welcome</Heading>
  <Text as="p">A paragraph that follows.</Text>
  <Button>Call to action</Button>
</Stagger>

<!-- Option B: explicit Enter with index -->
<Enter index={0}>
  <Heading level={1}>Welcome</Heading>
</Enter>
<Enter index={1}>
  <Text as="p">A paragraph that follows.</Text>
</Enter>

<!-- Option C: Svelte transition with programmatic index -->
{#each items as item, i}
  <div in:enter={{ index: i }}>{item}</div>
{/each}`
	},

	{
		name: 'exit-animation',
		description:
			'Subtle exits. A small fixed offset (~12px) beats mirroring the entrance. Use <Exit> as a wrapper or out:leave as a Svelte transition.',
		tags: ['exit', 'leave', 'animation', 'dismiss', 'polish', 'motion'],
		components: ['Exit'],
		snippet: `<script>
  import { leave } from '@dryui/ui/motion';

  let open = $state(true);
</script>

{#if open}
  <div out:leave>
    <p>This dismisses with a subtle 12px offset + fade + slight blur.</p>
    <button onclick={() => (open = false)}>Close</button>
  </div>
{/if}

<!-- Pair with in:enter for symmetric usage. Exit is intentionally smaller
     than entrance so dismissal feels softer than introduction. -->`
	},

	{
		name: 'shadow-as-border',
		description:
			'Three-layer box-shadow (edge + close contact + ambient) reads cleaner than a solid 1px border. Works over images and mixed backgrounds. No double-edge when combined with drop shadows.',
		tags: ['shadow', 'border', 'card', 'elevation', 'polish'],
		components: ['Card'],
		snippet: `<script>
  import { Card } from '@dryui/ui';
</script>

<!-- Default Card: shadow-only (no border) -->
<Card.Root>
  <Card.Content>
    A Card that reads as raised without a solid edge.
  </Card.Content>
</Card.Root>

<!-- Bordered escape hatch, when you want the 1px edge back -->
<Card.Root bordered>
  <Card.Content>A Card with both shadow and border.</Card.Content>
</Card.Root>

<!-- Raw pattern. Use the token family directly on any raised surface: -->
<style>
  .my-raised-surface {
    background: var(--dry-color-bg-raised);
    border-radius: var(--dry-radius-lg);
    box-shadow: var(--dry-shadow-sm);
    transition: box-shadow var(--dry-duration-fast) var(--dry-ease-out);
  }
  .my-raised-surface:hover {
    box-shadow: var(--dry-shadow-sm-hover);
  }
</style>`
	},

	{
		name: 'icon-in-button',
		description:
			'Buttons with leading/trailing icons get an automatic optical offset (--dry-optical-icon-offset) so the label reads visually centered, not geometrically centered.',
		tags: ['button', 'icon', 'optical', 'alignment', 'polish'],
		components: ['Button', 'Icon'],
		snippet: `<script>
  import { Button, Icon } from '@dryui/ui';
  import SearchIcon from '@dryui/icons/search.svelte';
</script>

<!-- Leading icon: padding-inline-start shrinks by --dry-optical-icon-offset -->
<Button>
  <Icon src={SearchIcon} />
  Search
</Button>

<!-- Trailing icon: padding-inline-end shrinks -->
<Button>
  Next
  <Icon src={SearchIcon} />
</Button>

<!-- Opt out: optical="off" keeps geometric padding -->
<Button optical="off">
  <Icon src={SearchIcon} />
  Geometric
</Button>`
	},

	{
		name: 'image-edge',
		description:
			'Images and avatars get a 1px outline (--dry-image-edge) that adapts to theme (black/10% in light, white/10% in dark). Stops image edges from reading as surface imperfections.',
		tags: ['image', 'avatar', 'edge', 'outline', 'polish'],
		components: ['Image', 'Avatar'],
		snippet: `<script>
  import { Image, Avatar } from '@dryui/ui';
</script>

<Image src="/photo.jpg" alt="Landscape" width={480} height={320} />
<Avatar src="/face.jpg" name="Rob" />

<!-- For hand-rolled media, apply the same pattern: -->
<style>
  .my-image {
    outline: 1px solid var(--dry-image-edge);
    outline-offset: -1px;
  }
</style>`
	}
];
