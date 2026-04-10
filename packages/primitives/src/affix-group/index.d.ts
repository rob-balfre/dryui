import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface AffixGroupRootProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    invalid?: boolean;
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export interface AffixGroupPrefixProps extends HTMLAttributes<HTMLSpanElement> {
    children: Snippet;
}
export interface AffixGroupInputProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AffixGroupSuffixProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AffixGroupSeparatorProps extends HTMLAttributes<HTMLSpanElement> {
}
export interface AffixGroupActionProps extends HTMLButtonAttributes {
    children?: Snippet;
}
import AffixGroupRoot from './affix-group-root.svelte';
import AffixGroupPrefix from './affix-group-prefix.svelte';
import AffixGroupInput from './affix-group-input.svelte';
import AffixGroupSuffix from './affix-group-suffix.svelte';
import AffixGroupSeparator from './affix-group-separator.svelte';
import AffixGroupAction from './affix-group-action.svelte';
export { getAffixGroupCtx } from './context.svelte.js';
export declare const AffixGroup: {
    Root: typeof AffixGroupRoot;
    Prefix: typeof AffixGroupPrefix;
    Input: typeof AffixGroupInput;
    Suffix: typeof AffixGroupSuffix;
    Separator: typeof AffixGroupSeparator;
    Action: typeof AffixGroupAction;
};
