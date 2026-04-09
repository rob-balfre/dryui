import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface FlipCardRootProps extends HTMLAttributes<HTMLDivElement> {
	trigger?: 'hover' | 'click';
	direction?: 'horizontal' | 'vertical';
	flipped?: boolean;
	children: Snippet;
}
export interface FlipCardFrontProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface FlipCardBackProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
import FlipCardRoot from './flip-card-root.svelte';
import FlipCardFront from './flip-card-front.svelte';
import FlipCardBack from './flip-card-back.svelte';
export declare const FlipCard: {
	Root: typeof FlipCardRoot;
	Front: typeof FlipCardFront;
	Back: typeof FlipCardBack;
};
