import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	columns?: number;
	gap?: string;
	align?: 'start' | 'center' | 'end';
	children: Snippet;
}
declare const LogoCloudRoot: import('svelte').Component<Props, {}, ''>;
type LogoCloudRoot = ReturnType<typeof LogoCloudRoot>;
export default LogoCloudRoot;
