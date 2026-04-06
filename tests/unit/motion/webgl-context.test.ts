import { afterEach, describe, expect, it, mock } from 'bun:test';
import {
	createShaderProgram,
	setUniform
} from '../../../packages/primitives/src/shader-canvas/webgl-context';

// Mock WebGL2 context
function createMockGL(options?: { compileSuccess?: boolean; linkSuccess?: boolean }) {
	const { compileSuccess = true, linkSuccess = true } = options ?? {};

	const uniforms = new Map<string, object>();
	const mockLocation = {};

	const gl: Partial<WebGL2RenderingContext> = {
		VERTEX_SHADER: 0x8b31,
		FRAGMENT_SHADER: 0x8b30,
		ARRAY_BUFFER: 0x8892,
		STATIC_DRAW: 0x88e4,
		COMPILE_STATUS: 0x8b81,
		LINK_STATUS: 0x8b82,
		ACTIVE_UNIFORMS: 0x8b86,
		FLOAT: 0x1406,
		TRIANGLES: 0x0004,
		createShader: () => ({}),
		shaderSource: () => {},
		compileShader: () => {},
		getShaderParameter: (_shader: WebGLShader | null, _pname: number) => compileSuccess,
		getShaderInfoLog: () => (compileSuccess ? '' : 'Compile error: invalid syntax'),
		createProgram: () => ({}),
		attachShader: () => {},
		linkProgram: () => {},
		getProgramParameter: (_program: WebGLProgram | null, pname: number) => {
			if (pname === 0x8b82) return linkSuccess; // LINK_STATUS
			if (pname === 0x8b86) return 2; // ACTIVE_UNIFORMS
			return 0;
		},
		getProgramInfoLog: () => (linkSuccess ? '' : 'Link error'),
		createBuffer: () => ({}),
		bindBuffer: () => {},
		bufferData: () => {},
		getAttribLocation: () => 0,
		enableVertexAttribArray: () => {},
		vertexAttribPointer: () => {},
		useProgram: () => {},
		getActiveUniform: (_program: WebGLProgram | null, index: number) => {
			const names = ['u_time', 'u_resolution'];
			return {
				name: names[index] ?? `u_unknown_${index}`,
				size: 1,
				type: 0x1406
			} as WebGLActiveInfo;
		},
		getUniformLocation: (_program: WebGLProgram | null, name: string) => {
			if (!uniforms.has(name)) uniforms.set(name, {});
			return uniforms.get(name) as WebGLUniformLocation;
		},
		deleteShader: () => {},
		deleteProgram: () => {},
		deleteBuffer: () => {},
		uniform1f: mock(() => {}),
		uniform2f: mock(() => {}),
		uniform3f: mock(() => {}),
		uniform4f: mock(() => {})
	};

	return gl as WebGL2RenderingContext;
}

function createMockCanvas(gl: WebGL2RenderingContext | null): HTMLCanvasElement {
	return {
		getContext: (_contextId: string) => gl
	} as unknown as HTMLCanvasElement;
}

describe('createShaderProgram', () => {
	it('returns a ShaderProgram with uniforms on success', () => {
		const gl = createMockGL();
		const canvas = createMockCanvas(gl);

		const result = createShaderProgram(canvas, 'vertex source', 'fragment source');

		expect(result).not.toBeNull();
		expect(result!.gl).toBe(gl);
		expect(result!.program).toBeDefined();
		expect(result!.uniforms.has('u_time')).toBe(true);
		expect(result!.uniforms.has('u_resolution')).toBe(true);
		expect(typeof result!.destroy).toBe('function');
	});

	it('returns null when WebGL2 is not available', () => {
		const canvas = createMockCanvas(null);

		const result = createShaderProgram(canvas, 'v', 'f');
		expect(result).toBeNull();
	});

	it('returns null on shader compile error', () => {
		const gl = createMockGL({ compileSuccess: false });
		const canvas = createMockCanvas(gl);

		const result = createShaderProgram(canvas, 'invalid', 'invalid');
		expect(result).toBeNull();
	});

	it('returns null on program link error', () => {
		const gl = createMockGL({ linkSuccess: false });
		const canvas = createMockCanvas(gl);

		const result = createShaderProgram(canvas, 'v', 'f');
		expect(result).toBeNull();
	});

	it('destroy cleans up GL resources', () => {
		const gl = createMockGL();
		const canvas = createMockCanvas(gl);

		const result = createShaderProgram(canvas, 'v', 'f');
		expect(result).not.toBeNull();

		// Should not throw
		result!.destroy();
	});
});

describe('setUniform', () => {
	it('sets a single float uniform', () => {
		const gl = createMockGL();
		const loc = {} as WebGLUniformLocation;

		setUniform(gl, loc, 1.5);
		expect(gl.uniform1f).toHaveBeenCalledWith(loc, 1.5);
	});

	it('sets a vec2 uniform', () => {
		const gl = createMockGL();
		const loc = {} as WebGLUniformLocation;

		setUniform(gl, loc, [1.0, 2.0]);
		expect(gl.uniform2f).toHaveBeenCalledWith(loc, 1.0, 2.0);
	});

	it('sets a vec3 uniform', () => {
		const gl = createMockGL();
		const loc = {} as WebGLUniformLocation;

		setUniform(gl, loc, [0.5, 0.6, 0.7]);
		expect(gl.uniform3f).toHaveBeenCalledWith(loc, 0.5, 0.6, 0.7);
	});

	it('sets a vec4 uniform', () => {
		const gl = createMockGL();
		const loc = {} as WebGLUniformLocation;

		setUniform(gl, loc, [1.0, 0.0, 0.5, 1.0]);
		expect(gl.uniform4f).toHaveBeenCalledWith(loc, 1.0, 0.0, 0.5, 1.0);
	});

	it('handles a single-element array as float', () => {
		const gl = createMockGL();
		const loc = {} as WebGLUniformLocation;

		setUniform(gl, loc, [3.14]);
		expect(gl.uniform1f).toHaveBeenCalledWith(loc, 3.14);
	});
});
