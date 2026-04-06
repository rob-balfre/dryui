import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface ModalContentProps extends HTMLAttributes<HTMLDialogElement> {
	ctx: { readonly open: boolean; readonly headerId: string; close: () => void };
	children: Snippet;
}
declare const ModalContent: import('svelte').Component<ModalContentProps, {}, ''>;
type ModalContent = ReturnType<typeof ModalContent>;
export default ModalContent;
