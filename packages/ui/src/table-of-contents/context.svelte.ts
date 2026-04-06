import { createContext } from '@dryui/primitives';

export interface TocHeading {
	id: string;
	text: string;
	level: number;
}

interface TableOfContentsContext {
	readonly headings: TocHeading[];
	readonly activeId: string | null;
}
export const [setTableOfContentsCtx, getTableOfContentsCtx] =
	createContext<TableOfContentsContext>('table-of-contents');
