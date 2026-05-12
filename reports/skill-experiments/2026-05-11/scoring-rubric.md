# Scoring Rubric

Score each output from 1 to 5 in each category.

- **Branch following**: Did the agent correctly identify this as a full dashboard page and follow the relevant branch?
- **DryUI contract**: Did it preserve `data-layout`, `src/layout.css`, token/component, and no-layout-in-style constraints?
- **Container query quality**: Did it define a named container and use `@container` rules coherently?
- **Dashboard layout judgment**: Did it choose sensible regions, density, hierarchy, and data-first structure?
- **State coverage**: Did it include loading, empty, error, and dense-data considerations?
- **Low-reasoning robustness**: Did the instructions produce a good result without requiring subtle inference?

Prefer the variant that gives the clearest correct behavior with the least prose.
