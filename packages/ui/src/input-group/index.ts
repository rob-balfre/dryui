export type {
	AffixGroupRootProps as InputGroupRootProps,
	AffixGroupPrefixProps as InputGroupPrefixProps,
	AffixGroupSuffixProps as InputGroupSuffixProps,
	AffixGroupSeparatorProps as InputGroupSeparatorProps,
	AffixGroupActionProps as InputGroupActionProps
} from '@dryui/primitives';

import type { HTMLInputAttributes, HTMLSelectAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export interface InputGroupInputProps extends HTMLInputAttributes {
	value?: string;
}

export interface InputGroupSelectProps extends HTMLSelectAttributes {
	value?: string;
	children?: Snippet;
}

import InputGroupRoot from './input-group-root.svelte';
import InputGroupPrefix from './input-group-prefix.svelte';
import InputGroupInput from './input-group-input.svelte';
import InputGroupSuffix from './input-group-suffix.svelte';
import InputGroupSeparator from './input-group-separator.svelte';
import InputGroupAction from './input-group-action-button.svelte';
import InputGroupSelect from './input-group-select.svelte';

export const InputGroup: {
	Root: typeof InputGroupRoot;
	Prefix: typeof InputGroupPrefix;
	Input: typeof InputGroupInput;
	Suffix: typeof InputGroupSuffix;
	Separator: typeof InputGroupSeparator;
	Action: typeof InputGroupAction;
	Select: typeof InputGroupSelect;
} = {
	Root: InputGroupRoot,
	Prefix: InputGroupPrefix,
	Input: InputGroupInput,
	Suffix: InputGroupSuffix,
	Separator: InputGroupSeparator,
	Action: InputGroupAction,
	Select: InputGroupSelect
};
