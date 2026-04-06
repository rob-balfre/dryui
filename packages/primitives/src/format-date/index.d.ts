import type { HTMLAttributes } from 'svelte/elements';
export interface FormatDateProps extends HTMLAttributes<HTMLTimeElement> {
    date: Date | string | number;
    locale?: string;
    weekday?: 'long' | 'short' | 'narrow';
    era?: 'long' | 'short' | 'narrow';
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
    timeZoneName?: 'long' | 'short';
    timeZone?: string;
    hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
}
export { default as FormatDate } from './format-date.svelte';
