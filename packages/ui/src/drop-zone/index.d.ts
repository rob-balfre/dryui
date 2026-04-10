export interface DropZoneProps {
    accept?: string;
    onDrop?: (files: File[]) => void;
}
export { default as DropZone } from './drop-zone.svelte';
