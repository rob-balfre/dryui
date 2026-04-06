import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	children?: Snippet | undefined;
}
declare const FileSelectClear: import('svelte').Component<Props, {}, ''>;
type FileSelectClear = ReturnType<typeof FileSelectClear>;
export default FileSelectClear;
