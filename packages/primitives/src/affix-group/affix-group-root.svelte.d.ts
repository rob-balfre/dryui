import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	invalid?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const AffixGroupRoot: import('svelte').Component<Props, {}, ''>;
type AffixGroupRoot = ReturnType<typeof AffixGroupRoot>;
export default AffixGroupRoot;
