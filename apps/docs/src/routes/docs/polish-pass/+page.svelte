<script lang="ts">
	import { Card, CodeBlock, Container, Heading, Link, Separator, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';
</script>

<svelte:head>
	<title>Visual Polish Pass — DryUI</title>
</svelte:head>

{#snippet codeExample(code: string, language: string)}
	<Card.Root>
		<Card.Content>
			<CodeBlock
				{code}
				{language}
				showCopyButton={true}
				{...language === 'svelte' ? { linkResolver: componentLinkResolver } : {}}
			/>
		</Card.Content>
	</Card.Root>
{/snippet}

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Visual Polish Pass"
			description="Jakub Krehel's essay on details that make interfaces feel better lists 11 small moves that separate a rough build from a polished one. DryUI bakes those moves into tokens, primitives, and the check tool so you never have to remember them by hand."
		/>

		<div class="stack-lg">
			<Text color="secondary">
				Reference: <Link
					href="https://jakub.kr/writing/details-that-make-interfaces-feel-better"
					target="_blank"
					rel="noopener noreferrer">Details that make interfaces feel better</Link
				>. Each section below maps one principle to the concrete DryUI surface that enforces it,
				plus a small sample you can paste into a route.
			</Text>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="typography"
				title="1. Text wrapping"
				description="Headings use text-wrap: balance so the title never strands a single word on the last line. Body copy uses text-wrap: pretty, a subtler pass that prevents orphans without re-wrapping the whole paragraph."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li><code>Heading</code> — balance by default at every level.</li>
				<li><code>Text as="p"</code> — pretty by default.</li>
				<li>
					Theme reset applies the same rule to raw <code>&lt;h1&gt;..&lt;h6&gt;</code> and
					<code>&lt;p&gt;</code>.
				</li>
			</ul>

			{@render codeExample(
				`<script>
  import { Heading, Text } from '@dryui/ui';
<\/script>

<Heading level={1}>
  A balanced heading never strands a single word.
</Heading>
<Text as="p">
  Body copy uses pretty wrapping, so last lines breathe.
</Text>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="concentric-radius"
				title="2. Concentric radius"
				description="Outer radius equals inner radius plus padding. Nested corners that don't match catch the eye faster than you'd think."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					Tokens: <code>--dry-radius-nested-card</code>,
					<code>--dry-radius-nested-dialog</code>, <code>--dry-radius-nested-popover</code>,
					<code>--dry-radius-nested-sheet</code>, <code>--dry-radius-nested-toast</code>,
					<code>--dry-radius-nested-tooltip</code>, <code>--dry-radius-nested-field</code>.
				</li>
				<li>
					<code>Button</code> inside <code>Card</code> already inherits the correct radius. No manual
					plumbing.
				</li>
			</ul>

			{@render codeExample(
				`<Card.Root>
  <Card.Content>
    <!-- Button radius snaps to --dry-radius-nested-card automatically. -->
    <Button>Action</Button>
  </Card.Content>
</Card.Root>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="icon-swap"
				title="3. Icon transitions"
				description="Swapping an icon on state change (copy to check, play to pause) should crossfade with a tiny scale and blur, so repeated toggles retarget mid-animation instead of stuttering."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>IconSwap</code> primitive. One prop, <code>icon</code>. Handles the transition, aria
					updates, and prefers-reduced-motion.
				</li>
				<li>
					Built on the <code>iconSwap</code> transition in <code>@dryui/ui/motion</code> if you need it
					directly.
				</li>
			</ul>

			{@render codeExample(
				`<script>
  import { Button, IconSwap } from '@dryui/ui';
  import CopyIcon from '@dryui/icons/copy.svelte';
  import CheckIcon from '@dryui/icons/check.svelte';

  let copied = $state(false);
<\/script>

<Button onclick={() => (copied = !copied)}>
  <IconSwap icon={copied ? CheckIcon : CopyIcon} />
  {copied ? 'Copied' : 'Copy'}
</Button>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="numeric-display"
				title="4. Numeric displays"
				description="Digits in counters, clocks, prices, and scores should hold column width as values change. Tabular-nums stops the jitter."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Numeric</code> primitive. <code>stable</code>, <code>minDigits</code>, and
					<code>align</code> props for padded and aligned displays.
				</li>
				<li>
					<code>Badge numeric</code> applies the same treatment to counts inside badges.
				</li>
				<li>
					Utility class <code>.dry-tabular-nums</code> is available for any hand-rolled number.
				</li>
			</ul>

			{@render codeExample(
				`<Numeric value={count} stable minDigits={3} align="end" />
<Badge numeric>{count}</Badge>

<!-- Raw escape hatch -->
<span class="dry-tabular-nums">{value}</span>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="interactive-motion"
				title="5. Transitions, not keyframes"
				description="For interactive states (hover, focus, open/close), transitions retarget mid-interaction. Keyframes have a fixed timeline and feel wrong when a user releases the button early."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					Every interactive component uses <code>transition</code>, not
					<code>animation</code>, for state changes.
				</li>
				<li>
					Duration and easing tokens: <code>--dry-duration-fast</code>,
					<code>--dry-ease-spring-snappy</code>, <code>--dry-ease-out</code>.
				</li>
				<li>
					<code>check --polish</code> flags <code>@keyframes</code> tied to interactive state.
				</li>
			</ul>

			{@render codeExample(
				`.toggle {
  transform: scale(1);
  transition: transform var(--dry-duration-fast) var(--dry-ease-spring-snappy);
}
.toggle[data-state='open'] {
  transform: scale(1.1);
}`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="stagger-entrance"
				title="6. Staggered entrances"
				description="Entering content feels deliberate when chunks arrive 80 to 100ms apart, not all at once."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Stagger</code> container. Auto-indexes children. <code>step</code> prop picks the stride.
				</li>
				<li>
					<code>Enter</code> wrapper for explicit indexing when children aren't direct siblings.
				</li>
				<li>
					<code>enter</code> from <code>@dryui/ui/motion</code> for raw Svelte transitions.
				</li>
			</ul>

			{@render codeExample(
				`<script>
  import { Enter, Stagger, Heading, Text, Button } from '@dryui/ui';
  import { enter } from '@dryui/ui/motion';
<\/script>

<Stagger step="section">
  <Heading level={1}>Welcome</Heading>
  <Text as="p">A paragraph that follows.</Text>
  <Button>Call to action</Button>
</Stagger>

{#each items as item, i}
  <div in:enter={{ index: i }}>{item}</div>
{/each}`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="exit-animation"
				title="7. Exit animations"
				description="Exits should be smaller than entrances. A ~12px fixed offset with fade and slight blur reads as dismissal, not departure."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Exit</code> wrapper. Pair with <code>Enter</code> for symmetric usage.
				</li>
				<li>
					<code>leave</code> from <code>@dryui/ui/motion</code> for raw
					<code>out:leave</code> transitions.
				</li>
			</ul>

			{@render codeExample(
				`<script>
  import { leave } from '@dryui/ui/motion';

  let open = $state(true);
<\/script>

{#if open}
  <div out:leave>
    <p>Dismisses softly with a 12px offset + fade + subtle blur.</p>
  </div>
{/if}`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="shadow-as-border"
				title="8. Shadow as border"
				description="A three-layer box-shadow (edge + close contact + ambient) separates a surface from its background more cleanly than a solid 1px border. It also survives images and mixed backgrounds."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Card</code> is shadow-only by default. <code>bordered</code> prop brings the 1px edge
					back when you need it.
				</li>
				<li>
					Tokens: <code>--dry-shadow-sm</code>, <code>--dry-shadow-md</code>,
					<code>--dry-shadow-lg</code>, plus <code>-hover</code> variants.
				</li>
				<li>
					<code>check --polish</code> flags raw <code>border: 1px solid</code> on
					<code>--dry-color-bg-raised</code> surfaces.
				</li>
			</ul>

			{@render codeExample(
				`<Card.Root>
  <Card.Content>
    Raised without a solid edge.
  </Card.Content>
</Card.Root>

<Card.Root bordered>
  <Card.Content>Both shadow and border.</Card.Content>
</Card.Root>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="icon-in-button"
				title="9. Optical alignment for icons in buttons"
				description="An icon visually pulls on its side of a button. Trimming padding on that side by a couple of pixels makes the label read centered."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Button</code> detects leading or trailing <code>Icon</code> children and shrinks the
					matching padding by <code>--dry-optical-icon-offset</code>.
				</li>
				<li>
					<code>optical="off"</code> opts out when you want geometric padding.
				</li>
			</ul>

			{@render codeExample(
				`<Button>
  <Icon src={SearchIcon} />
  Search
</Button>

<Button>
  Next
  <Icon src={SearchIcon} />
</Button>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="image-edge"
				title="10. Image edges"
				description="Raw images and avatars expose their own edge to whatever sits behind them. A 1px outline that adapts to theme hides the seam without looking like a border."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					<code>Image</code> and <code>Avatar</code> apply
					<code>outline: 1px solid var(--dry-image-edge)</code>
					with <code>outline-offset: -1px</code>.
				</li>
				<li>
					<code>--dry-image-edge</code> is black at 10% in light, white at 10% in dark.
				</li>
			</ul>

			{@render codeExample(
				`<Image src="/photo.jpg" alt="Landscape" width={480} height={320} />
<Avatar src="/face.jpg" name="Rob" />

<!-- Hand-rolled media: -->
<style>
  .my-image {
    outline: 1px solid var(--dry-image-edge);
    outline-offset: -1px;
  }
</style>`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="consistency"
				title="11. Consistency through tokens"
				description="The polish passes above only compound if every surface uses the same durations, easings, radii, shadows, and colors. That's what the token layer is for."
			/>

			<Heading level={3}>Where it lives in DryUI</Heading>
			<ul class="where-list">
				<li>
					Tokens live at <code>--dry-*</code>. Never hardcode a pixel, hex, or ms if a token exists.
				</li>
				<li>
					Browse the token surface with <code>ask --scope list --kind token</code>.
				</li>
				<li>
					The <code>check</code> tool flags drift. Run it on any file after an edit.
				</li>
			</ul>

			{@render codeExample(
				`/* Drift */
.button {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 150ms ease-out;
}

/* Polished */
.button {
  border-radius: var(--dry-radius-md);
  box-shadow: var(--dry-shadow-sm);
  transition:
    box-shadow var(--dry-duration-fast) var(--dry-ease-out),
    transform var(--dry-duration-fast) var(--dry-ease-spring-snappy);
}`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="check-polish"
				title="Check your code"
				description="Every principle above has a matching rule in the check tool. Use the polish filter to surface only those suggestions."
			/>

			{@render codeExample(
				`# Flag polish drift in one file
dryui check --polish src/routes/dashboard/+page.svelte

# Whole workspace pass
dryui check --polish

# Polish + lint + contract in one call
dryui check src/routes/dashboard/+page.svelte`,
				'bash'
			)}

			<DocsCallout title="Polish is a filter, not a separate tool" variant="info">
				<code>--polish</code> narrows <code>check</code> output to the 11 rules mapped from this
				page. Without the flag, <code>check</code> still reports polish suggestions as
				<code>info</code> diagnostics, alongside the rest.
			</DocsCallout>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-12);
	}

	.stack-lg {
		display: grid;
		gap: var(--dry-space-4);
	}

	.where-list {
		display: grid;
		gap: var(--dry-space-2);
		list-style: disc;
		padding-inline-start: var(--dry-space-6);
		margin: 0;
		color: var(--dry-color-text-subtle);
		line-height: 1.6;
	}

	.where-list code {
		color: var(--dry-color-text-strong);
	}
</style>
