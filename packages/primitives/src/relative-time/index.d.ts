import type { HTMLAttributes } from 'svelte/elements';
export interface RelativeTimeProps extends HTMLAttributes<HTMLTimeElement> {
    date: Date | string | number;
    locale?: string;
    updateInterval?: number;
}
export { default as RelativeTime } from './relative-time.svelte';
