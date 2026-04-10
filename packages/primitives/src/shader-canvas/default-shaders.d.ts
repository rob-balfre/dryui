/** Fullscreen quad vertex shader — passes UV coordinates to fragment shader */
export declare const DEFAULT_VERTEX_SHADER = "#version 300 es\nprecision highp float;\n\nin vec2 a_position;\nout vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}\n";
/** Minimal fallback fragment shader — solid dark gradient */
export declare const DEFAULT_FRAGMENT_SHADER = "#version 300 es\nprecision highp float;\n\nin vec2 v_uv;\nout vec4 fragColor;\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 uv = v_uv;\n  float t = sin(u_time * 0.5) * 0.5 + 0.5;\n  vec3 color = mix(vec3(0.05, 0.05, 0.12), vec3(0.12, 0.08, 0.18), uv.y + t * 0.1);\n  fragColor = vec4(color, 1.0);\n}\n";
