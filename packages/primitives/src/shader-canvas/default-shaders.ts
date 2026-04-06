/** Fullscreen quad vertex shader — passes UV coordinates to fragment shader */
export const DEFAULT_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Minimal fallback fragment shader — solid dark gradient */
export const DEFAULT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = v_uv;
  float t = sin(u_time * 0.5) * 0.5 + 0.5;
  vec3 color = mix(vec3(0.05, 0.05, 0.12), vec3(0.12, 0.08, 0.18), uv.y + t * 0.1);
  fragColor = vec4(color, 1.0);
}
`;
