<script lang="ts">
	import { Accordion, Badge, Button, Card, Input, ScrollArea, Text, Textarea } from '@dryui/ui';
	import { renderPlacementSkeleton } from './placement-skeleton.js';
	import { COMPONENT_REGISTRY, type CanvasPurpose, type LayoutModeComponentType } from './types.js';

	interface Props {
		open?: boolean;
		value?: LayoutModeComponentType | null;
		purpose?: CanvasPurpose;
		wireframePrompt?: string;
		wireframe?: boolean;
		placementCount?: number;
		sectionCount?: number;
		onSelect?: (type: LayoutModeComponentType) => void;
		onDetectSections?: () => void;
		onPurposeChange?: (purpose: CanvasPurpose) => void;
		onWireframePromptChange?: (value: string) => void;
		onDragStart?: (type: LayoutModeComponentType, event: MouseEvent) => void;
		onClear?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		value = $bindable(null),
		purpose = $bindable('replace-current'),
		wireframePrompt = $bindable(''),
		wireframe = false,
		placementCount = 0,
		sectionCount = 0,
		onSelect,
		onDetectSections,
		onPurposeChange,
		onWireframePromptChange,
		onDragStart,
		onClear,
		class: className
	}: Props = $props();

	const scrollId = 'dryui-feedback-layout-palette-scroll';

	let fadeTop = $state(false);
	let fadeBottom = $state(false);
	let searchQuery = $state('');
	let expandedSections = $state<string[]>(COMPONENT_REGISTRY.map((section) => section.section));

	const blankCanvas = $derived(purpose === 'new-page' || wireframe);
	const totalCount = $derived(placementCount + sectionCount);
	const countLabel = $derived.by(() => {
		if (totalCount === 0) {
			return blankCanvas ? 'No wireframe components yet' : 'No layout changes yet';
		}

		if (blankCanvas) {
			return `${totalCount} ${totalCount === 1 ? 'Component' : 'Components'}`;
		}

		return `${totalCount} ${totalCount === 1 ? 'Change' : 'Changes'}`;
	});
	const countSummary = $derived.by(() => {
		const parts: string[] = [];
		if (placementCount > 0) {
			parts.push(`${placementCount} placed`);
		}
		if (sectionCount > 0) {
			parts.push(`${sectionCount} captured`);
		}
		return parts.join(' · ');
	});
	const filteredRegistry = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return COMPONENT_REGISTRY;
		}

		return COMPONENT_REGISTRY.map((section) => ({
			...section,
			items: section.items.filter((item) => {
				const haystack = [
					item.label,
					item.type,
					item.sourceName,
					item.description,
					item.guidance,
					item.structure,
					section.section,
					...item.tags
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return haystack.includes(query);
			})
		})).filter((section) => section.items.length > 0);
	});

	function paletteShellClass(): string {
		return ['layout-palette-shell', className].filter(Boolean).join(' ');
	}

	function selectComponent(type: LayoutModeComponentType) {
		value = type;
		onSelect?.(type);
	}

	function selectPurpose(next: CanvasPurpose) {
		purpose = next;
		onPurposeChange?.(next);
	}

	function toggleWireframe() {
		selectPurpose(blankCanvas ? 'replace-current' : 'new-page');
	}

	function updatePrompt(event: Event) {
		const next = (event.currentTarget as HTMLTextAreaElement).value;
		wireframePrompt = next;
		onWireframePromptChange?.(next);
	}

	function resolveScrollElement(target?: EventTarget | null): HTMLElement | null {
		if (target instanceof HTMLElement) {
			return target;
		}

		return document.getElementById(scrollId);
	}

	function syncScrollFade(target?: EventTarget | null) {
		const element = resolveScrollElement(target);
		if (!element) {
			fadeTop = false;
			fadeBottom = false;
			return;
		}

		fadeTop = element.scrollTop > 4;
		fadeBottom = element.scrollTop + element.clientHeight < element.scrollHeight - 4;
	}

	function queueScrollFadeSync() {
		requestAnimationFrame(() => syncScrollFade());
	}

	function syncPaletteChrome(_key: string) {
		return () => {
			queueScrollFadeSync();
		};
	}

	function applyPreview(node: HTMLElement, type: LayoutModeComponentType) {
		node.innerHTML = renderPlacementSkeleton({
			type,
			width: 24,
			height: 18
		});
	}

	function mountPreview(type: LayoutModeComponentType) {
		return (node: HTMLElement) => {
			applyPreview(node, type);

			return () => {
				node.innerHTML = '';
			};
		};
	}

	function handleSearchInput() {
		queueScrollFadeSync();
	}

	function clearSearch() {
		searchQuery = '';
		queueScrollFadeSync();
	}
</script>

{#if open}
	<div
		class={paletteShellClass()}
		data-layout-mode-palette
		data-dryui-feedback
		data-blank-canvas={blankCanvas ? '' : undefined}
	>
		<Card.Root variant="elevated" size="sm" class="palette-card">
			<Card.Header class="palette-card-header">
				<div class="vstack-sm">
					<div class="flex-between-wrap">
						<div class="vstack-sm">
							<Text as="div" size="md">Layout Mode</Text>
							<Text as="div" size="sm" color="secondary">
								Search the placement library, sketch a new wireframe, or capture the current page
								structure before you hand off layout feedback to an agent.
							</Text>
						</div>
						<Badge variant="soft" color={blankCanvas ? 'orange' : 'blue'}>
							{blankCanvas ? 'Wireframe' : 'Live page'}
						</Badge>
					</div>

					<Input
						bind:value={searchQuery}
						placeholder="Search patterns"
						aria-label="Search layout patterns"
						oninput={handleSearchInput}
					/>
				</div>
			</Card.Header>

			<Card.Content class="palette-card-content">
				<div class="toggle-wrap">
					<Button
						data-layout-wireframe-toggle
						class="wireframe-toggle-button"
						variant={blankCanvas ? 'solid' : 'outline'}
						size="sm"
						onclick={toggleWireframe}
					>
						<span class="icon-wrap" aria-hidden="true">
							<svg viewBox="0 0 14 14" width="14" height="14" fill="none">
								<rect
									x="1"
									y="1"
									width="12"
									height="12"
									rx="2"
									stroke="currentColor"
									stroke-width="1"
								></rect>
								<circle cx="4.5" cy="4.5" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="7" cy="4.5" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="9.5" cy="4.5" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="4.5" cy="7" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="7" cy="7" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="9.5" cy="7" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="4.5" cy="9.5" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="7" cy="9.5" r="0.8" fill="currentColor" opacity=".6"></circle>
								<circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" opacity=".6"></circle>
							</svg>
						</span>
						<span>{blankCanvas ? 'Return to current page' : 'Wireframe new page'}</span>
					</Button>
				</div>

				<div
					class="wireframe-prompt-wrap"
					data-layout-wireframe-prompt-wrap
					data-expanded={blankCanvas || undefined}
				>
					<div class="wireframe-prompt-inner">
						<Textarea
							bind:value={wireframePrompt}
							class="wireframe-prompt-textarea"
							placeholder="Describe this page to provide additional context for your agent."
							oninput={updatePrompt}
						/>
					</div>
				</div>

				<div
					class="scroll-region"
					{@attach syncPaletteChrome(
						`${open}:${blankCanvas}:${placementCount}:${sectionCount}:${filteredRegistry.length}`
					)}
				>
					{#if fadeTop}
						<div class="fade-edge fade-edge--top" aria-hidden="true"></div>
					{/if}
					{#if fadeBottom}
						<div class="fade-edge fade-edge--bottom" aria-hidden="true"></div>
					{/if}

					<ScrollArea
						id={scrollId}
						orientation="vertical"
						onscroll={(event) => syncScrollFade(event.currentTarget)}
						class="palette-scroll-area"
					>
						{#if filteredRegistry.length > 0}
							<Accordion.Root type="multiple" bind:value={expandedSections}>
								{#each filteredRegistry as section (section.section)}
									<Accordion.Item value={section.section}>
										<Accordion.Trigger>
											<div class="flex-between section-trigger-flex">
												<Text as="span" size="sm" weight="medium">{section.section}</Text>
												<Text as="span" size="sm" color="secondary">{section.items.length}</Text>
											</div>
										</Accordion.Trigger>
										<Accordion.Content>
											<div class="vstack-sm section-item-stack">
												{#each section.items as item (item.type)}
													<Button
														data-layout-palette-item={item.type}
														variant={value === item.type ? 'soft' : 'ghost'}
														size="sm"
														class="palette-item-button"
														aria-pressed={value === item.type}
														onmousedown={(event) => {
															if (event.button !== 0) return;
															onDragStart?.(item.type, event);
														}}
														onclick={() => selectComponent(item.type)}
													>
														<span class="item-row">
															<span
																class="item-preview"
																data-layout-palette-item-preview
																aria-hidden="true"
															>
																<span {@attach mountPreview(item.type)}></span>
															</span>
															<span class="item-meta">
																<span class="item-meta-header">
																	<Text as="span" size="sm" class="item-label-text">
																		{item.label}
																	</Text>
																	<span class="item-dimensions">
																		{item.width}x{item.height}
																	</span>
																</span>
																<span class="item-meta-footer">
																	<Badge
																		variant="soft"
																		color={item.sourceKind === 'block' ? 'warning' : 'info'}
																	>
																		{item.sourceLabel}
																	</Badge>

																	<Text
																		as="span"
																		size="sm"
																		color="secondary"
																		class="item-description-text"
																	>
																		{item.description}
																	</Text>
																</span>
															</span>
														</span>
													</Button>
												{/each}
											</div>
										</Accordion.Content>
									</Accordion.Item>
								{/each}
							</Accordion.Root>
						{:else}
							<div class="empty-state">
								<div class="empty-state-icon" aria-hidden="true">
									<span>?</span>
								</div>
								<h3 class="empty-state-title">No components found</h3>
								<p class="empty-state-description">
									Try a broader search term or clear the filter to browse the full layout catalog.
								</p>
								<div class="empty-state-action">
									<Button variant="outline" size="sm" onclick={clearSearch}>Clear search</Button>
								</div>
							</div>
						{/if}
					</ScrollArea>
				</div>
			</Card.Content>

			<Card.Footer class="palette-card-footer">
				<div class="vstack-sm">
					<Text as="div" size="sm">{countLabel}</Text>
					{#if countSummary}
						<Text as="div" size="sm" color="secondary">{countSummary}</Text>
					{/if}
				</div>

				<div class="flex-wrap-end">
					{#if !blankCanvas && sectionCount === 0 && onDetectSections}
						<Button variant="outline" size="sm" onclick={onDetectSections}>Capture sections</Button>
					{/if}
					{#if totalCount > 0 && onClear}
						<Button variant="ghost" size="sm" onclick={onClear}>Clear</Button>
					{/if}
				</div>
			</Card.Footer>
		</Card.Root>
	</div>
{/if}

<style>
	.layout-palette-shell {
		position: fixed;
		inset-inline-end: 1rem;
		inset-block-end: 4.75rem;
		z-index: 100002;
		pointer-events: auto;
		--palette-card-border-color: var(--dry-card-border, rgba(15, 23, 42, 0.08));
	}

	@media (max-width: 720px) {
		.layout-palette-shell {
			inset-inline-start: 0.75rem;
			inset-inline-end: 0.75rem;
			inset-block-end: 5.5rem;
		}
	}

	.palette-card {
		display: grid;
		grid-template-columns: minmax(0, min(22rem, calc(100vw - 1.5rem)));
		max-block-size: min(72vh, 44rem);
		overflow: hidden;
		border-color: var(--palette-card-border-color);
		box-shadow: 0 28px 64px
			color-mix(in srgb, var(--dry-color-bg-overlay, #0f172a) 14%, transparent);
	}

	.layout-palette-shell[data-blank-canvas] {
		--palette-card-border-color: color-mix(
			in srgb,
			#f97316 24%,
			var(--dry-card-border, rgba(15, 23, 42, 0.08))
		);
	}

	.palette-card-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.9rem 1rem 0.75rem;
	}

	.palette-card-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0 0 0.75rem;
	}

	.toggle-wrap {
		padding-inline: 1rem;
	}

	.wireframe-toggle-button {
		justify-content: flex-start;
		gap: 0.55rem;
	}

	.icon-wrap {
		display: grid;
		grid-template-columns: 0.875rem;
		block-size: 0.875rem;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.wireframe-prompt-wrap {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 160ms ease,
			opacity 120ms ease;
	}

	.wireframe-prompt-wrap[data-expanded] {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.wireframe-prompt-inner {
		overflow: hidden;
		padding-inline: 1rem;
	}

	.wireframe-prompt-textarea {
		margin-block-start: 0.125rem;
		min-block-size: 5rem;
	}

	.scroll-region {
		position: relative;
		min-block-size: 0;
		padding-inline: 0.5rem;
	}

	.fade-edge {
		pointer-events: none;
		position: absolute;
		inset-inline: 0.5rem;
		block-size: 1rem;
		z-index: 2;
	}

	.fade-edge--top {
		inset-block-start: 0;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-card-bg, white) 96%, transparent),
			transparent
		);
	}

	.fade-edge--bottom {
		inset-block-end: 0;
		background: linear-gradient(
			0deg,
			color-mix(in srgb, var(--dry-card-bg, white) 96%, transparent),
			transparent
		);
	}

	.palette-scroll-area {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		max-block-size: min(44vh, 27rem);
		padding: 0 0.5rem 0.125rem;
	}

	.section-item-stack {
		padding-block-start: 0.35rem;
	}

	.palette-item-button {
		justify-content: flex-start;
		padding-inline: 0.625rem;
	}

	.item-row {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		align-items: center;
		gap: 0.625rem;
	}

	.item-preview {
		display: block;
		block-size: 1.125rem;
		border-radius: 0.3rem;
		overflow: hidden;
		background: color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 6%, transparent);
	}

	.layout-palette-shell[data-blank-canvas] .item-preview {
		background: rgba(249, 115, 22, 0.08);
	}

	.item-meta {
		display: grid;
		align-items: flex-start;
		gap: 0.15rem;
	}

	.item-meta-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: 0.5rem;
	}

	.item-label-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-dimensions {
		flex-shrink: 0;
		font-size: 0.6875rem;
		opacity: 0.58;
	}

	.item-meta-footer {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: 0.4rem;
	}

	.item-description-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		display: grid;
		justify-items: center;
		text-align: center;
		max-inline-size: 36ch;
		gap: var(--dry-space-4, 1rem);
		padding: 1rem 0.5rem 1.25rem;
		margin-inline: auto;
	}

	.empty-state-icon {
		display: grid;
		place-items: center;
		inline-size: 3rem;
		block-size: 3rem;
		border-radius: 50%;
		background: var(--dry-color-fill-weak);
	}

	.empty-state-title {
		font-weight: 600;
		color: var(--dry-color-text-strong);
		margin: 0;
	}

	.empty-state-description {
		color: var(--dry-color-text-weak);
		margin: 0;
	}

	.empty-state-action {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2, 0.5rem);
		justify-content: center;
	}

	.palette-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1rem 0.9rem;
	}

	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.flex-between-wrap {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: start;
	}

	.flex-between {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.flex-wrap-end {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, max-content));
		gap: var(--dry-space-2, 0.5rem);
		justify-content: end;
	}
</style>
