import type { DateTimeInputProps as PrimitiveDateTimeInputProps } from '@dryui/primitives';
export interface DateTimeInputProps extends PrimitiveDateTimeInputProps {
	size?: 'sm' | 'md' | 'lg';
}
export { default as DateTimeInput } from './date-time-input.svelte';
