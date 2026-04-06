import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
declare function $$render<T>(): {
	props: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items: T[];
		itemHeight: number | ((index: number) => number);
		overscan?: number | undefined;
		children: Snippet<
			[
				{
					item: T;
					index: number;
					style: string;
				}
			]
		>;
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
declare const VirtualList: $$IsomorphicComponent;
type VirtualList<T> = InstanceType<typeof VirtualList<T>>;
export default VirtualList;
