---
'@dryui/ui': major
'@dryui/primitives': major
'@dryui/mcp': major
---

**Breaking:** Remove `OptionSwatchGroup` — use `OptionPicker` instead. `OptionPicker.Preview` replaces `OptionSwatchGroup.Swatch` and supports the same color/shape props, so the migration is a mechanical rename:

```svelte
<!-- before -->
<OptionSwatchGroup.Root bind:value={color}>
	<OptionSwatchGroup.Item value="sage">
		<OptionSwatchGroup.Swatch color="#7da174" />
		<OptionSwatchGroup.Label>Sage</OptionSwatchGroup.Label>
	</OptionSwatchGroup.Item>
</OptionSwatchGroup.Root>

<!-- after -->
<OptionPicker.Root bind:value={color}>
	<OptionPicker.Item value="sage">
		<OptionPicker.Preview color="#7da174" />
		<OptionPicker.Label>Sage</OptionPicker.Label>
	</OptionPicker.Item>
</OptionPicker.Root>
```

The shared selection context has moved from `option-swatch-group/context.svelte` to `option-picker/context.svelte` (exported as `setOptionPickerCtx` / `getOptionPickerCtx`). Consumers that only used the public compound API are unaffected.
