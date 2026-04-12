# Awesome Design Systems Gap Audit

Date: 2026-04-12

## Scope

This audit compares DryUI against the catalog in [`alexpate/awesome-design-systems`](https://github.com/alexpate/awesome-design-systems).

- Corpus size: 187 listed systems
- Systems with coded components: 182
- Systems with designer kits: 86
- Systems with voice and tone guidance: 78
- Systems with public source code: 135

DryUI baseline for this audit:

- `@dryui/ui`: 144 exported styled components
- `@dryui/primitives`: broader headless surface, including some latent foundations not promoted to `@dryui/ui`
- Strong local tooling already exists: docs site, CLI, MCP server, lint rules, theme wizard, token docs, and component-level accessibility notes

## Where DryUI Is Already Strong

- Breadth: DryUI already covers most mainstream component primitives and many advanced ones.
- Theming: the token system, preset themes, and theme wizard are better than many OSS libraries.
- AI workflow: the MCP + skill + CLI story is unusually strong.
- Accessibility at component level: many components already encode keyboard and ARIA behavior correctly.
- Visual range: DryUI already has more motion and visual-effect primitives than most design systems.

This is not a “you need 50 more widgets” audit. Most gaps are in product workflow patterns and system-level assets around the components.

## Priority Gaps

| Priority | Gap                                                                | Why it matters                                                                                                                                                 | DryUI status                                                                                                                                | Representative systems                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | App shell and split-view foundations                               | Real SaaS and admin apps start with shell structure, not isolated buttons. Teams need canonical header, nav, content, aside, and responsive collapse behavior. | DryUI has parts like `Sidebar`, `Drawer`, `Splitter`, and `NavigationMenu`, but no first-class app shell or coordinated split-panel layout. | [Cloudscape](https://cloudscape.design/), [Mantine AppShell](https://mantine.dev/core/app-shell/), [Shopify Polaris](https://polaris-react.shopify.com/components)                                                                                       |
| 2        | Collection filtering and saved-view patterns                       | Mature systems standardize large-list workflows with query bars, tokenized filters, bulk actions, and saved views.                                             | `DataGrid` is capable, but there is no dedicated property-filter, collection toolbar, query-builder, or saved-view pattern.                 | [Cloudscape Property Filter](https://cloudscape.design/components/property-filter/), [Ant Design Table](https://ant.design/components/table/), [Carbon Data Table](https://carbondesignsystem.com/components/data-table/usage/)                          |
| 3        | Resource-management workflows around tables                        | Enterprise apps need split detail panes, row workbenches, empty/error/loading variants, and review-before-commit flows.                                        | DryUI has the pieces, but not a canonical pattern layer on top of `DataGrid`.                                                               | [Cloudscape patterns](https://cloudscape.design/patterns/), [Fluent](https://fluent2.microsoft.design/), [Polaris](https://polaris.shopify.com/)                                                                                                         |
| 4        | Form orchestration story                                           | Adoption depends on how quickly teams can assemble validated, production forms, not how many raw inputs exist.                                                 | Inputs are strong, but the higher-level story around validation summaries, grouped state, and framework integration is still thin.          | [Radix](https://www.radix-ui.com/primitives/docs/overview/introduction), [shadcn/ui](https://ui.shadcn.com/docs/components), [Mantine](https://mantine.dev/)                                                                                             |
| 5        | Design-kit / Figma / annotation workflow                           | Mature systems usually ship a design-side artifact, not just code and docs.                                                                                    | DryUI has internal design research and a theme wizard, but no public Figma kit or annotation workflow.                                      | [Primer Annotation Toolkit](https://primer.style/accessibility/tools-and-resources/annotation-toolkit/), [Carbon design resources](https://v10.carbondesignsystem.com/designing/design-resources/)                                                       |
| 6        | Foundations beyond tokens: content, iconography, data-viz guidance | Big systems document how to write, label, illustrate, and chart consistently.                                                                                  | DryUI has component docs, but not a clear voice-and-tone foundation, governed icon system, or chart/dashboard guidance layer.               | [Atlassian voice and tone](https://atlassian.design/foundations/content/voice-tone/), [Cloudscape foundations](https://cloudscape.design/foundation/), [Carbon data visualization](https://v10.carbondesignsystem.com/data-visualization/chart-anatomy/) |

## Latent Work Already In The Repo

Several useful foundations already exist in `@dryui/primitives` but are not surfaced as polished `@dryui/ui` components.

- `app-frame`
- `page-header`
- `empty-state`
- `stat-card`
- `footer`
- `logo-cloud`
- `surface`
- `hero`
- `stack`
- `grid`
- `avatar-group`
- `selectable-tile-group`

This matters because some “gaps” are not greenfield work. They are promotion and productization work.

Good examples:

- [`app-frame`](../../packages/primitives/src/app-frame/index.ts)
- [`page-header`](../../packages/primitives/src/page-header/index.ts)
- [`empty-state`](../../packages/primitives/src/empty-state/index.ts)
- [`stat-card`](../../packages/primitives/src/stat-card/index.ts)

## Expanded Sample Scanned

The first pass did not inspect all 187 systems individually. This follow-up widened the scan across more official docs from the list to validate the earlier conclusions.

- Cloudscape:
  - property filter
  - collection select filter
  - collection preferences
  - table view
  - split view
  - split panel
  - secondary panels
  - design resources
  - foundation and iconography
- Carbon:
  - data table usage
  - data table accessibility
  - tree view
  - data visualization dashboards
  - design kits
- Primer:
  - annotation toolkit
  - designer checklist
  - action menu
  - action menu guidelines
- Mantine:
  - `AppShell`
- Atlassian:
  - voice and tone
  - message-writing foundations
- Fluent:
  - design tokens and high-contrast support
- PatternFly:
  - dashboard layout
  - dashboard design guidelines
  - modeless overlay
- GitLab Pajamas:
  - filters and search
  - dashboard panels
  - destructive-action patterns
  - layout foundations
- USWDS:
  - page templates
  - maturity-model guidance
  - complex forms and records
- Siemens iX:
  - application layout
  - application header
  - panes
  - icon library guidance
  - application switch
  - forms layout
- SAP Fiori:
  - shell bar and shell concepts
  - floorplans and overview pages
  - flexible column layout
  - powerful filter bars
  - placeholder loading
- Public-sector systems:
  - GOV.UK
  - NHS
  - Ontario
  - Aurora
  - SGDS
  - CMS
  - DSFR
  - NASA
  - templates, localization, and transaction-state pages
- Account-management systems:
  - Cloudflare billing, invoices, notifications, profile settings, and 2FA flows
  - Shopify billing and account pages
  - Twilio notifications, confirmation, data export, and topbar patterns
- Content and marketing systems:
  - GitLab banner
  - PatternFly banner
  - Contentful website and content-modeling resources
  - Mailchimp template guidance
- Help and docs systems:
  - Cloudscape help system and onboarding
  - USWDS documentation pages and release notes
  - GitLab contextual help and release-process pages
  - Primer page-header and annotation resources
- Identity and security systems:
  - Okta settings, authenticators, recent activity, and recovery flows
  - Login.gov auth methods, backup codes, and account deletion
  - Persona profile security and inquiry-session references
- Ops and monitoring systems:
  - PatternFly timeline, notification drawer, status/severity, and log-snippet patterns
  - SAP timeline and notification-center patterns
  - Oracle Redwood monitoring and reconciliation dashboards
  - Cloudscape timestamps, split-view monitoring, and operational layouts
  - Clarity KPI/status surfaces
- Commerce and catalog patterns:
  - Shopify resource index and resource details layouts
  - SAP comparison pattern and table select dialog
  - Polaris filters and option-list patterns
- Classic component-rich systems:
  - Ant Design transfer and upload workflows
  - PatternFly dual-list selector and file upload
  - Base Web file uploader
  - Chakra file upload
- Additional governance and journey patterns:
  - GOV.UK, NHS, and Ontario task-list journeys
  - Spectrum 2 feedback and adoption framing
  - USWDS language selector and multilingual patterns

After the category-based passes, the remaining catalog was swept again in alphabetical ranges (`A-F`, `G-L`, `M-R`, `S-Z`) to catch stragglers and deduplicate recurring patterns. At this point the awesome-design-systems list has been covered broadly enough that new findings are now mostly refinements of the same major themes rather than undiscovered categories.

- Twilio Paste:
  - design-system homepage
  - design guidelines for Figma usage
  - customization and design-kit surfaces

## False Positives To Avoid

- DryUI is not missing basic overlays, navigation, date controls, drag and drop, tree, transfer, or notification primitives.
- DryUI is not weak on tokens or theme mechanics.
- DryUI does not need more novelty visual effects right now.
- DryUI already has enough component breadth that “just add more widgets” is the wrong top-level answer.

## Recommended Sequence

1. Promote the latent app and dashboard foundations from `@dryui/primitives` into `@dryui/ui`.
2. Build a collection layer on top of `DataGrid`:
   - property filter
   - collection toolbar
   - saved views
   - split detail panel
   - empty/error/loading collection states
3. Publish an opinionated app-shell story:
   - header
   - sidebar
   - content
   - secondary panel
   - mobile collapse behavior
4. Write a real form orchestration guide with supported validation patterns and starter compositions.
5. Add system-level foundations docs for:
   - content and voice
   - iconography
   - dashboard and chart usage
   - accessibility review workflow
6. Decide whether DryUI wants a public Figma kit. If yes, ship a narrow one first:
   - tokens
   - core surfaces
   - navigation
   - forms
   - data display

## Bottom Line

DryUI does not have a component-count problem.

DryUI has a “ship a real product faster” problem:

- stronger app-shell defaults
- stronger collection-management workflows
- stronger form orchestration
- stronger system artifacts around code

That is where the strongest design systems in the catalog keep compounding value.
