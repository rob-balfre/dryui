export interface MenuRootState {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
}

export interface MenuPosition {
	x: number;
	y: number;
}

export interface PositionedMenuRootState extends MenuRootState {
	position: MenuPosition;
}

interface CreateMenuRootStateOptions {
	idBase: string;
	uid: string;
	getOpen: () => boolean;
	setOpen: (value: boolean) => void;
}

function createBaseMenuRootState(options: CreateMenuRootStateOptions) {
	const triggerId = `${options.idBase}-trigger-${options.uid}`;
	const contentId = `${options.idBase}-content-${options.uid}`;

	return {
		triggerId,
		contentId,
		triggerEl: null as HTMLElement | null,
		show() {
			options.setOpen(true);
		},
		close() {
			options.setOpen(false);
		},
		toggle() {
			options.setOpen(!options.getOpen());
		}
	};
}

export function createMenuRootState(options: CreateMenuRootStateOptions): MenuRootState {
	return {
		get open() {
			return options.getOpen();
		},
		...createBaseMenuRootState(options)
	};
}

export function createPositionedMenuRootState(
	options: CreateMenuRootStateOptions
): PositionedMenuRootState {
	let position = $state<MenuPosition>({ x: 0, y: 0 });

	return {
		get open() {
			return options.getOpen();
		},
		...createBaseMenuRootState(options),
		get position() {
			return position;
		},
		set position(value: MenuPosition) {
			position = value;
		}
	};
}
