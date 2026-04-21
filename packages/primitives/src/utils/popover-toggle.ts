export function tryShowPopover(el: HTMLElement): void {
	if (typeof el.showPopover !== 'function') return;
	try {
		if (!el.matches(':popover-open')) el.showPopover();
	} catch {
		/* noop */
	}
}

export function tryHidePopover(el: HTMLElement): void {
	if (typeof el.hidePopover !== 'function') return;
	try {
		if (el.matches(':popover-open')) el.hidePopover();
	} catch {
		/* noop */
	}
}
