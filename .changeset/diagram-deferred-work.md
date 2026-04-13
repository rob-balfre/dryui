---
'@dryui/ui': minor
'@dryui/primitives': minor
---

Diagram: close out the deferred work tracked in `packages/ui/src/diagram/PLAN.md`.

- `DiagramCluster.labelPosition` accepts `'top-left'` (default) or `'left'`. The layout reserves the gutter on the chosen edge and `<Diagram />` rotates the label group via `transform="rotate(-90 …)"`.
- Forward edge labels slide along the polyline to stay `LABEL_BORDER_AVOID_PX` (28) away from cluster boundaries via the new `computeLabelAnchor` helper and `superNodeIds` option.
- `layoutNested` is now recursive, supporting nested directed clusters and flat clusters nested inside directed clusters.
- Cross-boundary back edges anchor at the inner node instead of the cluster super-node. `layoutLayeredPass` is split into `computeLayeredPositions` + `finishLayeredPass` so the orchestrator can derive global inner-node positions and feed them to `computeEdgePaths` via `backEdgeAnchorOverrides`. Forward cross-boundary edges intentionally keep super-node anchoring.
- Two-tier caching: a `WeakMap` on `computeLayout` for full-result identity caching and an LRU `subLayoutCache` keyed on leaf sub-layout content so unchanged inner clusters skip the pipeline on subsequent calls.
