import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: string | null;
	onrequest?: (() => Promise<string | null>) | undefined;
	onchange?: ((value: string | null) => void) | undefined;
	disabled?: boolean | undefined;
	children: Snippet;
}
declare const FileSelectRoot: import('svelte').Component<Props, {}, 'value'>;
type FileSelectRoot = ReturnType<typeof FileSelectRoot>;
export default FileSelectRoot;
