import type { PinInputRootProps as PrimitivePinInputRootProps, PinInputGroupProps, PinInputCellProps, PinInputSeparatorProps, PinInputCell } from '@dryui/primitives';
export type { PinInputGroupProps, PinInputCellProps, PinInputSeparatorProps, PinInputCell };
export interface PinInputRootProps extends PrimitivePinInputRootProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'outline' | 'flushed';
}
import PinInputRoot from './pin-input-root.svelte';
import PinInputGroup from './pin-input-group.svelte';
import PinInputCellComponent from './pin-input-cell.svelte';
import PinInputSeparator from './pin-input-separator.svelte';
export declare const PinInput: {
    Root: typeof PinInputRoot;
    Group: typeof PinInputGroup;
    Cell: typeof PinInputCellComponent;
    Separator: typeof PinInputSeparator;
};
