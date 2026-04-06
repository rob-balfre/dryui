interface Props {
	keys: string;
	handler: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
}
declare const Hotkey: import('svelte').Component<Props, {}, ''>;
type Hotkey = ReturnType<typeof Hotkey>;
export default Hotkey;
