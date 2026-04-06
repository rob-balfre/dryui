import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	onpromptsubmit?: (value: string) => void;
	actions?: Snippet;
}
declare const PromptInput: import('svelte').Component<Props, {}, 'value'>;
type PromptInput = ReturnType<typeof PromptInput>;
export default PromptInput;
