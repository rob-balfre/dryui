export interface HotkeyConfig {
    keys: string;
    handler: () => void;
    enabled?: boolean;
    preventDefault?: boolean;
}
interface ParsedHotkey {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    key: string;
}
export declare function parseKeys(keys: string): ParsedHotkey;
export declare function matchesEvent(event: KeyboardEvent, parsed: ParsedHotkey): boolean;
export declare function createHotkey(shortcuts: HotkeyConfig[]): {
    destroy: () => void;
};
export {};
