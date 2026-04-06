export interface ShaderProgram {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	uniforms: Map<string, WebGLUniformLocation>;
	destroy: () => void;
}

function compileShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader compile error:', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

export function createShaderProgram(
	canvas: HTMLCanvasElement,
	vertexSource: string,
	fragmentSource: string
): ShaderProgram | null {
	const gl = canvas.getContext('webgl2');
	if (!gl) return null;

	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	if (!vertexShader) return null;

	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	if (!fragmentShader) {
		gl.deleteShader(vertexShader);
		return null;
	}

	const program = gl.createProgram();
	if (!program) {
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		return null;
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program link error:', gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		return null;
	}

	// Set up fullscreen quad
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
		gl.STATIC_DRAW
	);

	const positionLocation = gl.getAttribLocation(program, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Collect uniform locations
	const uniforms = new Map<string, WebGLUniformLocation>();
	const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformCount; i++) {
		const info = gl.getActiveUniform(program, i);
		if (info) {
			const location = gl.getUniformLocation(program, info.name);
			if (location) {
				uniforms.set(info.name, location);
			}
		}
	}

	gl.useProgram(program);

	return {
		gl,
		program,
		uniforms,
		destroy() {
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			if (positionBuffer) gl.deleteBuffer(positionBuffer);
		}
	};
}

export function setUniform(
	gl: WebGL2RenderingContext,
	location: WebGLUniformLocation,
	value: number | number[]
): void {
	if (typeof value === 'number') {
		gl.uniform1f(location, value);
		return;
	}

	switch (value.length) {
		case 1:
			gl.uniform1f(location, value[0]!);
			break;
		case 2:
			gl.uniform2f(location, value[0]!, value[1]!);
			break;
		case 3:
			gl.uniform3f(location, value[0]!, value[1]!, value[2]!);
			break;
		case 4:
			gl.uniform4f(location, value[0]!, value[1]!, value[2]!, value[3]!);
			break;
	}
}
