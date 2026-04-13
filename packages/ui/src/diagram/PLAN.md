# Diagram — Deferred Work

All previously deferred items (Phases 1–4 + the two `/simplify` passes) have
been implemented. This file now tracks what's still intentionally on the v1
list.

## Implemented (formerly deferred)

- **Cluster label rotation for inner direction** — `DiagramCluster.labelPosition`
  accepts `'top-left'` (default) or `'left'`. `computeClusterBounds` and the
  directed-cluster super-node sizing reserve the gutter on the correct edge;
  `diagram.svelte` rotates the label group via `transform="rotate(-90 …)"` for
  `labelPosition: 'left'`.
- **Cross-boundary edge label avoidance** — `LABEL_BORDER_AVOID_PX = 28` in
  `edge-routing.ts`. `computeLabelAnchor` slides forward edge labels along the
  polyline away from the cluster boundary when the natural midpoint would land
  too close.
- **Nested directed clusters** — `layout.ts` now contains a recursive
  `layoutNested` that handles arbitrary nesting (directed-in-directed,
  flat-in-directed). Sub-layouts are spread into fresh objects on merge so the
  cache stays immutable.
- **Back-edge cross-boundary endpoint anchoring** — `layoutLayeredPass` is
  split into `computeLayeredPositions` + `finishLayeredPass`. The orchestrator
  pre-computes outer node positions, derives global inner-node positions from
  the super-node placements, then feeds them into `computeEdgePaths` along
  with a `backEdgeAnchorOverrides` map so back edges anchor at the inner node
  while forward edges keep their super-node anchoring.
- **Per-cluster sub-layout caching** — `computeLayout` uses a `WeakMap` for
  full-result caching on stable config references, and `layoutNested` keeps an
  LRU `subLayoutCache` keyed on leaf sub-layout content so unchanged inner
  clusters skip the pipeline on subsequent calls.

## Known v1 limitations (intentional, not bugs)

These are design choices we're sticking with for now. Documented so future
contributors don't try to "fix" them without understanding the trade-off.

- **Cross-boundary forward edges anchor to the cluster super-node**, not inner
  nodes. We tried inner-node re-anchoring during Phase 4 and it produced
  Z-shaped paths that conflicted with the inner cluster's flow direction.
  Anchoring to the cluster reads as "the source talks to the agent as a
  whole" which is the right semantic. (Back edges DO re-anchor — see the
  implemented item above. Forward and back are intentionally asymmetric.)
- **Waypoint placement uses the polyline's geometric midpoint** (or an
  explicit `position` fraction). It does _not_ prefer "the longest segment"
  or "the segment perpendicular to the source-target axis". Users with
  non-standard layouts must specify `position` explicitly to bias placement
  onto a specific segment.
- **Single waypoint per edge.** `DiagramEdge.waypoint` is singular. The split
  logic in `placeWaypoints` is recursive-ready (you could split an exit
  segment again) but there's no API for it. Defer until a real use case
  appears.
