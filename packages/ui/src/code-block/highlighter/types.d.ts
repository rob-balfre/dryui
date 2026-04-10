export interface Token {
    type: string;
    start: number;
    end: number;
}
export type Highlighter = (code: string) => Token[];
