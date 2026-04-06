import type { Snippet } from 'svelte';
interface Props {
	value?: string | null;
	onrequest: () => Promise<string | null>;
	onchange?: ((value: string | null) => void) | undefined;
	disabled?: boolean | undefined;
	children: Snippet;
}
declare const FileSelectRoot: import('svelte').Component<Props, {}, 'value'>;
type FileSelectRoot = ReturnType<typeof FileSelectRoot>;
export default FileSelectRoot;
