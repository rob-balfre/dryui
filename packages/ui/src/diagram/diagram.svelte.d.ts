import type { SVGAttributes } from 'svelte/elements';
import type { DiagramConfig } from './types.js';
interface Props extends SVGAttributes<SVGSVGElement> {
    config: DiagramConfig;
    width?: number;
    height?: number;
}
declare const Diagram: import("svelte").Component<Props, {}, "">;
type Diagram = ReturnType<typeof Diagram>;
export default Diagram;
