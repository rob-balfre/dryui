import { createContext } from '@dryui/primitives';

interface PaginationContext {
	readonly page: number;
	readonly totalPages: number;
	readonly canPrevious: boolean;
	readonly canNext: boolean;
	goto(page: number): void;
	previous(): void;
	next(): void;
}
export const [setPaginationCtx, getPaginationCtx] = createContext<PaginationContext>('pagination');
