import { getContext, setContext } from 'svelte';

export function createContext<T>(name: string) {
	const key = Symbol(name);
	return [
		(ctx: T) => {
			setContext(key, ctx);
			return ctx;
		},
		() => getContext<T>(key)
	] as const;
}
