<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		supportsWebGL2
	} from '../internal/motion.js';
	import { createShaderProgram, setUniform, type ShaderProgram } from './webgl-context.js';
	import { DEFAULT_VERTEX_SHADER } from './default-shaders.js';

	interface AutoUniforms {
		time?: boolean;
		resolution?: boolean;
		mouse?: boolean;
		scroll?: boolean;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		fragmentShader: string;
		vertexShader?: string;
		autoUniforms?: AutoUniforms;
		uniforms?: Record<string, number | number[]>;
		pixelRatio?: number;
		fps?: number;
		paused?: boolean;
		fallback?: Snippet;
		children?: Snippet;
	}

	let {
		fragmentShader,
		vertexShader = DEFAULT_VERTEX_SHADER,
		autoUniforms = { time: true, resolution: true },
		uniforms = {},
		pixelRatio = 1,
		fps,
		paused = $bindable(false),
		fallback,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let shaderProgram = $state<ShaderProgram | null>(null);
	let hasWebGL = $state(true);
	let compileError = $state(false);
	let prefersReducedMotion = $state(false);
	let documentVisible = $state(true);
	let inViewport = $state(true);
	let mouseX = 0;
	let mouseY = 0;

	const MAX_RENDER_BUFFER_EDGE = 2048;
	const effectivePixelRatio = $derived(Math.min(Math.max(1, pixelRatio), 2));
	const showFallback = $derived(!hasWebGL || compileError);

	function captureContainer(node: HTMLDivElement) {
		containerEl = node;
		return () => {
			if (containerEl === node) containerEl = null;
		};
	}

	function captureCanvas(node: HTMLCanvasElement) {
		canvasEl = node;
		return () => {
			if (canvasEl === node) canvasEl = null;
		};
	}

	function handleMouseMove(event: MouseEvent) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		mouseX = (event.clientX - rect.left) / rect.width;
		mouseY = 1.0 - (event.clientY - rect.top) / rect.height;
	}

	onMount(() => {
		if (!supportsWebGL2()) {
			hasWebGL = false;
			return;
		}

		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});

		if (getReducedMotionPreference()) {
			prefersReducedMotion = true;
		}

		documentVisible = !document.hidden;
		const handleVisibilityChange = () => {
			documentVisible = !document.hidden;
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Initialize shader program
		$effect(() => {
			if (!canvasEl) return;

			// Destroy previous program (untracked to avoid read→write loop)
			const prev = untrack(() => shaderProgram);
			if (prev) {
				prev.destroy();
			}

			const program = createShaderProgram(canvasEl, vertexShader, fragmentShader);
			if (!program) {
				compileError = true;
				return;
			}

			compileError = false;
			shaderProgram = program;

			return () => {
				program.destroy();
			};
		});

		// Canvas sizing with ResizeObserver
		$effect(() => {
			if (!containerEl || !canvasEl) return;

			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (!entry || !canvasEl) return;
				const { width, height } = entry.contentRect;
				const dpr = effectivePixelRatio;
				const nextWidth = Math.max(1, Math.floor(width * dpr));
				const nextHeight = Math.max(1, Math.floor(height * dpr));
				const maxEdge = Math.max(nextWidth, nextHeight);
				const scale = maxEdge > MAX_RENDER_BUFFER_EDGE ? MAX_RENDER_BUFFER_EDGE / maxEdge : 1;

				canvasEl.width = Math.max(1, Math.floor(nextWidth * scale));
				canvasEl.height = Math.max(1, Math.floor(nextHeight * scale));
			});

			observer.observe(containerEl);

			return () => observer.disconnect();
		});

		$effect(() => {
			if (!containerEl || typeof IntersectionObserver === 'undefined') return;

			const observer = new IntersectionObserver((entries) => {
				const entry = entries[0];
				inViewport = entry?.isIntersecting ?? true;
			});

			observer.observe(containerEl);

			return () => observer.disconnect();
		});

		// Render loop
		$effect(() => {
			if (!shaderProgram || !canvasEl) return;

			const { gl, uniforms: uniformLocations } = shaderProgram;
			let frameId: number | undefined;
			let startTime = performance.now();
			let lastFrameTime = 0;
			const fpsInterval = fps !== undefined && fps > 0 ? 1000 / fps : 0;
			const shouldLoop =
				!paused && !prefersReducedMotion && fps !== 0 && documentVisible && inViewport;

			function draw(time: number) {
				if (!documentVisible || !inViewport) return;
				// FPS limiting
				if (fpsInterval > 0) {
					if (time - lastFrameTime < fpsInterval) {
						return;
					}
					lastFrameTime = time;
				}

				gl.viewport(0, 0, canvasEl!.width, canvasEl!.height);

				// Auto uniforms
				if (autoUniforms?.time) {
					const timeLoc = uniformLocations.get('u_time');
					if (timeLoc) {
						const elapsed = prefersReducedMotion ? 0 : (time - startTime) / 1000;
						gl.uniform1f(timeLoc, elapsed);
					}
				}

				if (autoUniforms?.resolution) {
					const resLoc = uniformLocations.get('u_resolution');
					if (resLoc) {
						gl.uniform2f(resLoc, canvasEl!.width, canvasEl!.height);
					}
				}

				if (autoUniforms?.mouse) {
					const mouseLoc = uniformLocations.get('u_mouse');
					if (mouseLoc) {
						gl.uniform2f(mouseLoc, mouseX, mouseY);
					}
				}

				if (autoUniforms?.scroll) {
					const scrollLoc = uniformLocations.get('u_scroll');
					if (scrollLoc) {
						const scrollY =
							typeof window !== 'undefined'
								? window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)
								: 0;
						gl.uniform1f(scrollLoc, scrollY);
					}
				}

				// Custom uniforms
				for (const [name, value] of Object.entries(uniforms)) {
					const loc = uniformLocations.get(name);
					if (loc) {
						setUniform(gl, loc, value);
					}
				}

				gl.drawArrays(gl.TRIANGLES, 0, 6);
			}

			function render(time: number) {
				draw(time);

				if (!shouldLoop) return;

				frameId = requestAnimationFrame(render);
			}

			draw(performance.now());
			if (shouldLoop) {
				frameId = requestAnimationFrame(render);
			}

			return () => {
				if (frameId !== undefined) {
					cancelAnimationFrame(frameId);
				}
			};
		});

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			stopMotionObserver();
		};
	});
</script>

<div
	{@attach captureContainer}
	class={['shader-canvas', className]}
	data-webgl={(hasWebGL && !compileError) || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	onmousemove={autoUniforms?.mouse ? handleMouseMove : undefined}
	{...rest}
	{style}
>
	{#if showFallback}
		{#if fallback}
			{@render fallback()}
		{/if}
	{:else}
		<canvas {@attach captureCanvas} class="shader-canvas-el" aria-hidden="true"></canvas>
	{/if}

	{#if children && !showFallback}
		<div class="shader-canvas-overlay">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.shader-canvas {
		position: relative;
		overflow: hidden;
	}

	.shader-canvas-el {
		display: block;
		width: 100%;
		height: 100%;
	}

	.shader-canvas-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
	}
</style>
