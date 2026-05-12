# Batch 2 Scoring Rubric

Score each output from 1 to 5.

- **Task classification**: correct page/dashboard branch and target brief.
- **Shell/container contract**: shell owns named container, inner page owns grid, queries style descendants.
- **DryUI contract**: `data-layout`, `src/layout.css`, component metadata, no layout wrappers, no route style layout.
- **Mobile-first quality**: mobile base is first-class; tablet and desktop are meaningful container-query shifts.
- **Dashboard hierarchy**: filters before data, efficient metrics, dominant chart/table, useful secondary region.
- **State coverage**: loading, empty, error, disabled, dense-data, long labels, no-overflow.
- **Visual readiness**: explicit mobile/tablet/desktop screenshot criteria.
- **Implementation risk**: fewer hallucinated APIs, less CSS drift, fewer lint risks.

Visual score should be assigned after rendering a static preview from the proposed layout.
