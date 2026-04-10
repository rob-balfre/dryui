/** sin/cos color rotation using u_time, u_resolution, optional u_color_* uniforms */
export const gradientFlow = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color_primary;
uniform vec3 u_color_secondary;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.4;

  vec3 c1 = u_color_primary.r > 0.0 ? u_color_primary : vec3(0.3, 0.4, 0.9);
  vec3 c2 = u_color_secondary.r > 0.0 ? u_color_secondary : vec3(0.9, 0.3, 0.5);

  float angle = t + uv.x * 3.14159 + uv.y * 2.0;
  float s = sin(angle) * 0.5 + 0.5;
  float c = cos(angle * 0.7 + 1.0) * 0.5 + 0.5;

  vec3 color = mix(c1, c2, s);
  color = mix(color, vec3(1.0) - color * 0.3, c * 0.3);

  fragColor = vec4(color, 1.0);
}
`;

/** Procedural dots via hash/noise functions */
export const particleField = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float t = u_time * 0.3;
  vec3 color = vec3(0.02, 0.02, 0.06);

  for (int i = 0; i < 36; i++) {
    float fi = float(i);
    vec2 pos = vec2(
      hash(vec2(fi, 0.0)),
      hash(vec2(0.0, fi))
    );
    pos.x *= aspect;
    pos += vec2(sin(t + fi * 0.5) * 0.05, cos(t * 0.7 + fi * 0.3) * 0.05);

    float d = length(uv - pos);
    float size = 0.002 + hash(vec2(fi, fi)) * 0.003;
    float brightness = smoothstep(size * 2.0, size * 0.5, d);

    vec3 particleColor = vec3(
      0.4 + hash(vec2(fi, 1.0)) * 0.6,
      0.3 + hash(vec2(fi, 2.0)) * 0.4,
      0.6 + hash(vec2(fi, 3.0)) * 0.4
    );

    color += particleColor * brightness * 0.8;
  }

  fragColor = vec4(color, 1.0);
}
`;

/** Sinusoidal UV warp, responds to u_mouse */
export const waveDistortion = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.5;
  vec2 mouse = u_mouse;

  float wave1 = sin(uv.x * 8.0 + t * 2.0 + mouse.x * 3.0) * 0.02;
  float wave2 = sin(uv.y * 6.0 + t * 1.5 + mouse.y * 2.0) * 0.03;
  float wave3 = cos(uv.x * 4.0 - t + uv.y * 5.0) * 0.015;

  uv.x += wave1 + wave3;
  uv.y += wave2;

  vec3 c1 = vec3(0.1, 0.2, 0.4);
  vec3 c2 = vec3(0.3, 0.1, 0.5);
  vec3 c3 = vec3(0.05, 0.3, 0.4);

  float blend = sin(uv.x * 3.14159 + uv.y * 2.0 + t) * 0.5 + 0.5;
  vec3 color = mix(mix(c1, c2, uv.x), c3, blend);

  fragColor = vec4(color, 1.0);
}
`;

/** Multi-point gradient interpolation */
export const meshGradient = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color_primary;
uniform vec3 u_color_secondary;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.2;

  vec3 c1 = u_color_primary.r > 0.0 ? u_color_primary : vec3(0.5, 0.2, 0.8);
  vec3 c2 = u_color_secondary.r > 0.0 ? u_color_secondary : vec3(0.2, 0.6, 0.9);
  vec3 c3 = vec3(0.9, 0.3, 0.4);
  vec3 c4 = vec3(0.2, 0.8, 0.5);

  vec2 p1 = vec2(0.2 + sin(t) * 0.1, 0.3 + cos(t * 0.7) * 0.1);
  vec2 p2 = vec2(0.8 + sin(t * 0.8 + 1.0) * 0.1, 0.2 + cos(t * 0.6) * 0.1);
  vec2 p3 = vec2(0.7 + sin(t * 0.5 + 2.0) * 0.1, 0.8 + cos(t * 0.9) * 0.1);
  vec2 p4 = vec2(0.3 + sin(t * 0.6 + 3.0) * 0.1, 0.7 + cos(t * 0.4) * 0.1);

  float d1 = 1.0 / (length(uv - p1) + 0.01);
  float d2 = 1.0 / (length(uv - p2) + 0.01);
  float d3 = 1.0 / (length(uv - p3) + 0.01);
  float d4 = 1.0 / (length(uv - p4) + 0.01);
  float total = d1 + d2 + d3 + d4;

  vec3 color = (c1 * d1 + c2 * d2 + c3 * d3 + c4 * d4) / total;

  fragColor = vec4(color, 1.0);
}
`;

/** Fresnel-like metallic reflection via distance fields */
export const liquidMetal = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;
  float t = u_time * 0.3;

  // Animated blob positions
  vec2 p1 = vec2(sin(t * 0.7) * 0.6, cos(t * 0.5) * 0.4);
  vec2 p2 = vec2(cos(t * 0.8 + 1.0) * 0.5, sin(t * 0.6 + 2.0) * 0.5);
  vec2 p3 = vec2(sin(t * 0.4 + 3.0) * 0.4, cos(t * 0.9 + 1.5) * 0.3);

  float d1 = length(uv - p1) - 0.3;
  float d2 = length(uv - p2) - 0.25;
  float d3 = length(uv - p3) - 0.2;

  float d = smin(smin(d1, d2, 0.3), d3, 0.3);

  // Fresnel-like effect
  float edge = smoothstep(0.02, -0.02, d);
  float fresnel = pow(1.0 - abs(d) * 3.0, 3.0);
  fresnel = clamp(fresnel, 0.0, 1.0);

  // Metal color
  vec3 baseColor = vec3(0.7, 0.72, 0.75);
  vec3 highlight = vec3(0.95, 0.95, 1.0);
  vec3 dark = vec3(0.15, 0.16, 0.2);

  float n = sin(uv.x * 8.0 + t) * cos(uv.y * 8.0 - t * 0.7) * 0.5 + 0.5;
  vec3 color = mix(dark, baseColor, edge);
  color = mix(color, highlight, fresnel * 0.8);
  color += n * 0.05 * edge;

  // Environment reflection hint
  float ref = sin(uv.x * 4.0 + uv.y * 3.0 + t * 2.0) * 0.5 + 0.5;
  color += vec3(0.1, 0.12, 0.15) * ref * edge * 0.4;

  fragColor = vec4(color, 1.0);
}
`;

export const PRESETS: Record<string, string> = {
	'gradient-flow': gradientFlow,
	'particle-field': particleField,
	'wave-distortion': waveDistortion,
	'mesh-gradient': meshGradient,
	'liquid-metal': liquidMetal
};
