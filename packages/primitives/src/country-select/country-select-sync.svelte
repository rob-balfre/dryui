<script lang="ts">
	import { getComboboxCtx } from '../combobox/index.js';
	import type { CountryInfo } from '../internal/countries.js';

	interface Props {
		open: boolean;
		query: string;
		userHasTyped: boolean;
		selectedCode: string;
		selectedName: string;
		results: CountryInfo[];
	}

	let { open, query, userHasTyped, selectedCode, selectedName, results }: Props = $props();

	const ctx = getComboboxCtx();

	$effect(() => {
		if (!open) {
			ctx.setActiveIndex(-1);
			return;
		}

		if (results.length === 0) {
			ctx.setActiveIndex(-1);
			return;
		}

		const activeCode = results[ctx.activeIndex]?.code;
		let nextIndex = 0;

		if (activeCode && results.some((country) => country.code === activeCode)) {
			nextIndex = results.findIndex((country) => country.code === activeCode);
		} else if (!userHasTyped && selectedCode) {
			const selectedIndex = results.findIndex((country) => country.code === selectedCode);
			if (selectedIndex >= 0) {
				nextIndex = selectedIndex;
			}
		}

		if (nextIndex !== ctx.activeIndex) {
			ctx.setActiveIndex(nextIndex);
		}
	});

	$effect(() => {
		if (open || query === selectedName) {
			return;
		}

		ctx.setInputValue(selectedName);
	});
</script>
