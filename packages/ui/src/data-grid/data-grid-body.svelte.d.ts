import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
declare function $$render<T = unknown>(): {
	props: Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
		children: Snippet<
			[
				{
					items: T[];
					page: number;
				}
			]
		>;
	};
	exports: {};
	bindings: '';
	slots: {};
	events: {};
};
declare class __sveltets_Render<T = unknown> {
	props(): ReturnType<typeof $$render<T>>['props'];
	events(): ReturnType<typeof $$render<T>>['events'];
	slots(): ReturnType<typeof $$render<T>>['slots'];
	bindings(): '';
	exports(): {};
}
interface $$IsomorphicComponent {
	new <T = unknown>(
		options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>
	): import('svelte').SvelteComponent<
		ReturnType<__sveltets_Render<T>['props']>,
		ReturnType<__sveltets_Render<T>['events']>,
		ReturnType<__sveltets_Render<T>['slots']>
	> & {
		$$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
	} & ReturnType<__sveltets_Render<T>['exports']>;
	<T = unknown>(
		internal: unknown,
		props: ReturnType<__sveltets_Render<T>['props']> & {}
	): ReturnType<__sveltets_Render<T>['exports']>;
	z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const DataGridBody: $$IsomorphicComponent;
type DataGridBody<T = unknown> = InstanceType<typeof DataGridBody<T>>;
export default DataGridBody;
