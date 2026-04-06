import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	name: string;
	description?: string;
	children?: Snippet | undefined;
}
declare const User: import('svelte').Component<Props, {}, ''>;
type User = ReturnType<typeof User>;
export default User;
