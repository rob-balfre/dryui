import { getContext, setContext } from 'svelte';

const CHIP_GROUP_KEY = Symbol('chip-group');

interface ChipGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}

export function setChipGroupCtx(ctx: ChipGroupContext) {
	setContext(CHIP_GROUP_KEY, ctx);
	return ctx;
}

export function getChipGroupCtx() {
	return getContext<ChipGroupContext>(CHIP_GROUP_KEY);
}
