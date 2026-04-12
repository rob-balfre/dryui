# Awesome Design Systems Roadmap TODO

Trimmed from `awesome-design-systems-followup-todo.md` into actual roadmap-sized work.

## Near Term

- [ ] Promote `app-frame`, `page-header`, `empty-state`, and `stat-card` from `@dryui/primitives` to `@dryui/ui`.
- [ ] Ship a first-class `AppShell` API with `Header`, `Nav`, `Main`, `Aside`, and `Footer`.
- [ ] Support responsive nav collapse, mobile drawer fallback, sticky header behavior, and secondary panel layouts in `AppShell`.
- [ ] Publish an app-shell guide with canonical SaaS, admin, and back-office page compositions.
- [ ] Promote `FileUpload`, `Transfer`, and `DragAndDrop` as workflow patterns rather than leaf components.
- [ ] Add canonical split-detail and modeless secondary-panel patterns for resource-management screens.
- [ ] Build a collection workbench layer: `PropertyFilter`, `CollectionToolbar`, `CollectionPreferences`, and `SavedViews`.
- [ ] Extend `DataGrid` for bulk actions, detail-pane coordination, empty/error/loading slots, and stronger row actions.
- [ ] Add explicit filtered-empty-state handling, sticky-toolbar guidance, and delayed export patterns for large collections.
- [ ] Add first-class `ActionMenu` and `Banner` patterns.
- [ ] Publish starter page templates for dashboard, collection-detail, settings, auth, empty/onboarding, record detail, confirmation/problem, and docs/search pages.
- [ ] Write a collection-management guide covering filters, saved views, bulk actions, and split-detail flows.
- [ ] Write a form-orchestration guide covering validation summaries, async submit states, destructive confirmation, review-before-save, stepped flows, and guided create/edit patterns.
- [ ] Publish `Wait UX`, status messaging, and page-level loading guidance so long-running and full-page states have a canonical story.
- [ ] Publish dashboard foundations docs for KPI blocks, chart headers, trend treatments, legends, and no-data states.
- [ ] Publish a system-level accessibility review checklist plus sensitive-data display guidance.

## Later

- [ ] Decide whether DryUI should ship a canonical form-state helper or adapter layer.
- [ ] Add account-security patterns: step-up auth, MFA enrollment, account recovery, session/device management, and account deletion/deactivation.
- [ ] Add localization and directionality guidance, including locale-aware strings, RTL support, and direction-aware motion.
- [ ] Add high-contrast guidance and decide whether DryUI needs a first-class high-contrast token layer.
- [ ] Publish motion, elevation, iconography, and status/severity foundations as first-class docs.
- [ ] Publish voice-and-tone, glossary, channel-aware content, and content QA guidance.
- [ ] Add privacy and consent patterns plus docs/help page feedback patterns.
- [ ] Add release-notes and “What’s new” page patterns.
- [ ] Create a lightweight maturity/adoption checklist for teams using DryUI.
- [ ] Publish a public support, lifecycle, and feedback-loop policy for components, themes, and future design assets.
- [ ] Add a design-side annotation and accessibility checklist workflow.

## Not Near Term

- [ ] `EnterpriseSearch` floorplan
- [ ] `Compare` floorplan
- [ ] `TaskList` as a new journey pattern separate from `Stepper`
- [ ] richer catalog/item picker dialog
- [ ] `TreeSelect` as a first-class component
- [ ] `ContextualHelp` as a first-class pattern
- [ ] `DashboardLayout` or `DashboardPanel` as a distinct component layer
- [ ] `OpsDashboard` floorplan
- [ ] expanded `NotificationCenter` drawer/history model
- [ ] `DiagnosticLogView`
- [ ] `CardList` or `CardView` pattern family
- [ ] public brand-asset library
- [ ] first-class icon package
- [ ] richer `RichTextEditor` authoring workflow
- [ ] public Figma kit

## Principles

- [ ] Favor “ship a real app faster” work over novelty visual effects.
- [ ] Prefer promoting latent primitives already in the repo before inventing greenfield surface area.
- [ ] Treat app shell, collection workflows, and form orchestration as the main adoption levers.
- [ ] Keep copy-paste block marketplaces and cross-framework ambitions out of the near-term roadmap.
