import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
declare function $$render<T>(): {
	props: HTMLAttributes<HTMLDivElement> & {
		items: T[];
		onReorder: (items: T[]) => void;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	};
	exports: {};
	bindings: '';
	slots: {};
	events: {};
};
declare class __sveltets_Render<T> {
	props(): ReturnType<typeof $$render<T>>['props'];
	events(): ReturnType<typeof $$render<T>>['events'];
	slots(): ReturnType<typeof $$render<T>>['slots'];
	bindings(): '';
	exports(): {};
}
interface $$IsomorphicComponent {
	new <T>(
		options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>
	): import('svelte').SvelteComponent<
		ReturnType<__sveltets_Render<T>['props']>,
		ReturnType<__sveltets_Render<T>['events']>,
		ReturnType<__sveltets_Render<T>['slots']>
	> & {
		$$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
	} & ReturnType<__sveltets_Render<T>['exports']>;
	<T>(
		internal: unknown,
		props: ReturnType<__sveltets_Render<T>['props']> & {}
	): ReturnType<__sveltets_Render<T>['exports']>;
	z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const DragAndDropRoot: $$IsomorphicComponent;
type DragAndDropRoot<T> = InstanceType<typeof DragAndDropRoot<T>>;
export default DragAndDropRoot;
