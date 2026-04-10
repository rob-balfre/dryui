export interface ShaderProgram {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    uniforms: Map<string, WebGLUniformLocation>;
    destroy: () => void;
}
export declare function createShaderProgram(canvas: HTMLCanvasElement, vertexSource: string, fragmentSource: string): ShaderProgram | null;
export declare function setUniform(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: number | number[]): void;
