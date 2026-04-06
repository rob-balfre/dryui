export interface StatCardContext {
	readonly tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
	readonly density: 'comfortable' | 'compact';
}
export declare function setStatCardCtx(ctx: StatCardContext): StatCardContext;
export declare function getStatCardCtx(): StatCardContext;
