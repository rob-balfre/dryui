# DryUI Architecture Audit

Generated from `DolphinGraph` on 2026-04-06T21:33:51.945Z.

## Metrics

| Metric | Count |
| --- | ---: |
| Primitive component nodes | 148 |
| UI component nodes | 144 |
| UI wrappers | 130 |
| UI composites | 14 |
| Compound parts | 662 |
| Mismatch count | 23 |
| PrimitivePart components | 0 |
| Thin wrapper count | 65 |

## Package Overview

```mermaid
flowchart LR
  p_root["Primitives root: 148"]
  u_wrap["UI wrappers: 130"]
  u_comp["UI composites: 14"]
  audit["Audit clusters: 0"]
  p_root -->|wraps| u_wrap
  u_wrap -->|feeds| u_comp
  audit -->|highlights duplication in| u_comp
  audit -->|highlights duplication in| u_wrap
```

## Duplication Clusters

```mermaid
flowchart TB
```

## Canonicalize Now

No findings in this bucket.

## Document Decision Tree

No findings in this bucket.

## Watch

No findings in this bucket.

## Structural Signals

- `PrimitivePart` appears in 0 UI components: none.
- Thin wrapper candidates: `Adjust`, `AspectRatio`, `Aurora`, `Avatar`, `Backdrop`, `Badge`, `Beam`, `Button`, `ButtonGroup`, `Checkbox`, `Chip`, `ChromaticAberration`, `ChromaticShift`, `Clipboard`, `Container`, `CountrySelect`, `Displacement`, `FocusTrap`, `FormatBytes`, `FormatDate`, `FormatNumber`, `Gauge`, `Glass`, `Glow`, `GodRays`, `GradientMesh`, `Hotkey`, `Icon`, `Image`, `ImageComparison`, `Input`, `Kbd`, `Label`, `Link`, `Marquee`, `MaskReveal`, `Noise`, `NumberInput`, `PhoneInput`, `Portal`, `Progress`, `ProgressRing`, `PromptInput`, `QRCode`, `Rating`, `RelativeTime`, `Reveal`, `ScrollArea`, `ScrollToTop`, `Separator`, `ShaderCanvas`, `Skeleton`, `Slider`, `Spacer`, `Sparkline`, `Spinner`, `Spotlight`, `Svg`, `Textarea`, `TimeInput`, `Toggle`, `Tour`, `VideoEmbed`, `VirtualList`, `VisuallyHidden`.
- UI subpath-only exports: none.
- Primitive subpath-only exports: `UseThemeOverride`.
- UI exports missing spec metadata: none.
- Primitive exports missing spec metadata: `AffixGroup`, `AppFrame`, `AvatarGroup`, `ChatMessage`, `EmptyState`, `Flex`, `Footer`, `Grid`, `Hero`, `LogoCloud`, `PageHeader`, `SelectableTileGroup`, `Stack`, `StatCard`, `Surface`, `User`, `UseThemeOverride`, `WaveDivider`.
- Docs nav missing components: `AlphaSlider`, `DropZone`, `StarRating`, `Tag`.
- Docs nav orphan entries: none.

## Mismatch Summary

- `docs-nav-missing` in `docs`: 4
- `spec-missing` in `primitives`: 18
- `subpath-only-export` in `primitives`: 1

## Priority Mismatches

- `docs-nav-missing` on `AlphaSlider` in `docs` (packages/ui/src/alpha-slider/index.ts): Public UI export is missing from the docs component navigation.
- `docs-nav-missing` on `DropZone` in `docs` (packages/ui/src/drop-zone/index.ts): Public UI export is missing from the docs component navigation.
- `docs-nav-missing` on `StarRating` in `docs` (packages/ui/src/star-rating/index.ts): Public UI export is missing from the docs component navigation.
- `docs-nav-missing` on `Tag` in `docs` (packages/ui/src/tag/index.ts): Public UI export is missing from the docs component navigation.
- `spec-missing` on `AffixGroup` in `primitives` (packages/primitives/src/affix-group/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `AppFrame` in `primitives` (packages/primitives/src/app-frame/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `AvatarGroup` in `primitives` (packages/primitives/src/avatar-group/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `ChatMessage` in `primitives` (packages/primitives/src/chat-message/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `EmptyState` in `primitives` (packages/primitives/src/empty-state/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Flex` in `primitives` (packages/primitives/src/flex/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Footer` in `primitives` (packages/primitives/src/footer/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Grid` in `primitives` (packages/primitives/src/grid/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Hero` in `primitives` (packages/primitives/src/hero/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `LogoCloud` in `primitives` (packages/primitives/src/logo-cloud/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `PageHeader` in `primitives` (packages/primitives/src/page-header/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `SelectableTileGroup` in `primitives` (packages/primitives/src/selectable-tile-group/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Stack` in `primitives` (packages/primitives/src/stack/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `StatCard` in `primitives` (packages/primitives/src/stat-card/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `Surface` in `primitives` (packages/primitives/src/surface/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `User` in `primitives` (packages/primitives/src/user/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `UseThemeOverride` in `primitives` (packages/primitives/src/use-theme-override/index.ts): Public export exists without generated spec metadata.
- `spec-missing` on `WaveDivider` in `primitives` (packages/primitives/src/wave-divider/index.ts): Public export exists without generated spec metadata.
