---
'@dryui/feedback': patch
---

The feedback overlay now portals into the topmost open `<dialog>` or popover instead of `document.body` whenever one is present, so annotations and the toolbar render above modal content (DryUI Dialog, Drawer, Popover, etc.) rather than being clipped behind it. The host is tracked via document-level `toggle`/`close`/`cancel` listeners and a mutation observer for legacy `dialog[open]` toggles. The text-input commit handler was extracted, the saved-drawings fetch now aborts on cleanup, and the overlay root resets the native dialog box-model so it does not paint chrome over the page.
