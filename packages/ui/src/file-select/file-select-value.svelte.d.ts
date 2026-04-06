import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	placeholder?: string;
}
declare const FileSelectValue: import('svelte').Component<Props, {}, ''>;
type FileSelectValue = ReturnType<typeof FileSelectValue>;
export default FileSelectValue;
