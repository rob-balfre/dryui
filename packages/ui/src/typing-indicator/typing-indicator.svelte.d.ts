import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLDivElement> {}

declare const TypingIndicator: import('svelte').Component<Props, {}, ''>;
type TypingIndicator = ReturnType<typeof TypingIndicator>;

export default TypingIndicator;
