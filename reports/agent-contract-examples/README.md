# Agent Contract Example UIs

Dogfood examples generated from the first-pass `dryui prompt --component` command.

Prompt/context commands used:

```bash
bun packages/cli/src/index.ts prompt --component Button --verbose
bun packages/cli/src/index.ts prompt --component Card --verbose
bun packages/cli/src/index.ts prompt --component Dialog --verbose
bun packages/cli/src/index.ts prompt --component Field --verbose
bun packages/cli/src/index.ts prompt --component Select --verbose
bun packages/cli/src/index.ts info Button,Card,Field,Label,Input,Select,Textarea,Dialog,Badge,Separator,Avatar,Text,Heading,Container,Progress --full
```

Examples:

- `ReleaseReadinessDashboard.svelte` — operational dashboard with cards, progress, status rows, and actions.
- `WorkspaceSettingsForm.svelte` — settings form with validation, Field.Root wrappers, Select, Input, and Textarea.
- `TeamInviteDialog.svelte` — dialog form for queuing invites with a keyed list of pending invites.

These files are not wired into the docs app. They are copy-pasteable smoke examples for the generated agent contract and CLI prompt surface.
