import type {
	PinInputRootProps as PrimitivePinInputRootProps,
	PinInputGroupProps,
	PinInputCellProps,
	PinInputSeparatorProps,
	PinInputCellState
} from '@dryui/primitives';

export type { PinInputGroupProps, PinInputCellProps, PinInputSeparatorProps, PinInputCellState };

export interface PinInputRootProps extends PrimitivePinInputRootProps {
	size?: 'sm' | 'md' | 'lg';
	variant?: 'outline' | 'flushed';
}

import PinInputRoot from './pin-input-root.svelte';
import PinInputGroup from './pin-input-group.svelte';
import PinInputCell from './pin-input-cell.svelte';
import PinInputSeparator from './pin-input-separator.svelte';

export const PinInput: {
	Root: typeof PinInputRoot;
	Group: typeof PinInputGroup;
	Cell: typeof PinInputCell;
	Separator: typeof PinInputSeparator;
} = {
	Root: PinInputRoot,
	Group: PinInputGroup,
	Cell: PinInputCell,
	Separator: PinInputSeparator
};
