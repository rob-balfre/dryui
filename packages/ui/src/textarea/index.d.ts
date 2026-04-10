import type { TextareaProps as PrimitiveTextareaProps } from '@dryui/primitives';
export interface TextareaProps extends PrimitiveTextareaProps {
    size?: 'sm' | 'md' | 'lg';
}
export { default as Textarea } from './textarea.svelte';
