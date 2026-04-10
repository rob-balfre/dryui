export interface TransferItem {
    key: string;
    label: string;
    disabled?: boolean;
}
export interface TransferContext {
    readonly sourceItems: TransferItem[];
    readonly targetItems: TransferItem[];
    readonly selectedSource: Set<string>;
    readonly selectedTarget: Set<string>;
    readonly sourceCount: number;
    readonly targetCount: number;
    readonly selectedSourceCount: number;
    readonly selectedTargetCount: number;
    toggleSourceSelection: (key: string) => void;
    toggleTargetSelection: (key: string) => void;
    selectAllSource: () => void;
    selectAllTarget: () => void;
    deselectAllSource: () => void;
    deselectAllTarget: () => void;
    moveToTarget: () => void;
    moveToSource: () => void;
    moveAllToTarget: () => void;
    moveAllToSource: () => void;
    isSourceAllSelected: () => boolean;
    isTargetAllSelected: () => boolean;
}
export declare const setTransferCtx: (ctx: TransferContext) => TransferContext, getTransferCtx: () => TransferContext;
