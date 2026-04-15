# DryUI Architecture Audit

## Metrics

| Metric | Count |
| --- | ---: |
| Primitive component nodes | 143 |
| UI component nodes | 145 |
| UI wrappers | 129 |
| UI composites | 16 |
| Compound parts | 654 |
| Mismatch count | 287 |
| PrimitivePart components | 0 |
| Thin wrapper count | 64 |

## Package Overview

```mermaid
flowchart LR
  p_root["Primitives root: 143"]
  u_wrap["UI wrappers: 129"]
  u_comp["UI composites: 16"]
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
- Thin wrapper candidates: `Adjust`, `AspectRatio`, `Aurora`, `Avatar`, `Backdrop`, `Badge`, `Beam`, `Button`, `ButtonGroup`, `Checkbox`, `Chip`, `ChromaticAberration`, `ChromaticShift`, `Clipboard`, `Container`, `CountrySelect`, `Displacement`, `FocusTrap`, `FormatBytes`, `FormatDate`, `FormatNumber`, `Gauge`, `Glass`, `Glow`, `GodRays`, `GradientMesh`, `Hotkey`, `Icon`, `Image`, `ImageComparison`, `Input`, `Kbd`, `Label`, `Link`, `Marquee`, `MaskReveal`, `Noise`, `NumberInput`, `PhoneInput`, `Portal`, `Progress`, `ProgressRing`, `PromptInput`, `QRCode`, `Rating`, `RelativeTime`, `Reveal`, `ScrollArea`, `ScrollToTop`, `Separator`, `ShaderCanvas`, `Skeleton`, `Slider`, `Spacer`, `Sparkline`, `Spinner`, `Spotlight`, `Svg`, `Textarea`, `Toggle`, `Tour`, `VideoEmbed`, `VirtualList`, `VisuallyHidden`.
- UI subpath-only exports: none.
- Primitive subpath-only exports: none.
- UI exports missing spec metadata: none.
- Primitive exports missing spec metadata: none.
- Docs nav missing components: none.
- Docs nav orphan entries: none.

## Mismatch Summary

- `missing-subpath-export` in `primitives`: 143
- `missing-subpath-export` in `ui`: 144

## Priority Mismatches

No priority mismatches detected.

