export interface TocHeading {
    id: string;
    text: string;
    level: number;
}
interface TableOfContentsContext {
    readonly headings: TocHeading[];
    readonly activeId: string | null;
}
export declare const setTableOfContentsCtx: (ctx: TableOfContentsContext) => TableOfContentsContext, getTableOfContentsCtx: () => TableOfContentsContext;
export {};
