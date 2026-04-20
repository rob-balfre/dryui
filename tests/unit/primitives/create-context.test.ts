import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';

type ContextKey = symbol;

const contextValues = new Map<ContextKey, unknown>();
const setCalls: Array<{ key: ContextKey; value: unknown }> = [];
const getCalls: ContextKey[] = [];

mock.module('svelte', () => ({
	setContext(key: ContextKey, value: unknown) {
		setCalls.push({ key, value });
		contextValues.set(key, value);
	},
	getContext<T>(key: ContextKey): T {
		getCalls.push(key);
		if (!contextValues.has(key)) {
			throw new Error(`missing:${key.description ?? 'unknown'}`);
		}

		return contextValues.get(key) as T;
	}
}));

let createContext: typeof import('../../../packages/primitives/src/utils/create-context.ts').createContext;

beforeAll(async () => {
	({ createContext } = await import('../../../packages/primitives/src/utils/create-context.ts'));
});

afterEach(() => {
	contextValues.clear();
	setCalls.length = 0;
	getCalls.length = 0;
});

describe('createContext', () => {
	test('round-trips values through the setter/getter pair and returns the original value from the setter', () => {
		const [setUser, getUser] = createContext<{ name: string }>('user');
		const user = { name: 'Ada' };

		expect(setUser(user)).toBe(user);
		expect(getUser()).toBe(user);
		expect(setCalls[0]?.key).toBe(getCalls[0]);
		expect(setCalls[0]?.key.description).toBe('user');
	});

	test('creates isolated symbol keys even when factories share the same name', () => {
		const [setLeft, getLeft] = createContext<number>('shared');
		const [setRight, getRight] = createContext<number>('shared');

		setLeft(1);
		setRight(2);

		expect(getLeft()).toBe(1);
		expect(getRight()).toBe(2);
		expect(setCalls[0]?.key).not.toBe(setCalls[1]?.key);
		expect(getCalls).toEqual([setCalls[0]!.key, setCalls[1]!.key]);
	});

	test('propagates missing-context errors from the underlying Svelte getter', () => {
		const [, getMissing] = createContext<string>('missing');

		expect(() => getMissing()).toThrow('missing');
	});
});
