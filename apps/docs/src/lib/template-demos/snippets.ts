const ROOT_OPEN = '<AreaGrid' + '.Root';
const ROOT_CLOSE = '</AreaGrid' + '.Root>';

export const centeredSnippet = `${ROOT_OPEN} template="centered" fill>
  <Card.Root>Sign in</Card.Root>
${ROOT_CLOSE}`;

export const sidebarSnippet = `${ROOT_OPEN} template="sidebar" fill>
  <Sidebar.Root --dry-grid-area-name="aside">…</Sidebar.Root>
  <Article.Root --dry-grid-area-name="main">…</Article.Root>
${ROOT_CLOSE}`;

export const stackSnippet = `${ROOT_OPEN} template="stack" fill>
  <Header.Root --dry-grid-area-name="masthead">…</Header.Root>
  <Article.Root --dry-grid-area-name="main">…</Article.Root>
  <Footer.Root --dry-grid-area-name="foot">…</Footer.Root>
${ROOT_CLOSE}`;

export const holyGrailSnippet = `${ROOT_OPEN} template="holy-grail" fill>
  <Header.Root --dry-grid-area-name="masthead">…</Header.Root>
  <Sidebar.Root --dry-grid-area-name="nav">…</Sidebar.Root>
  <Article.Root --dry-grid-area-name="main">…</Article.Root>
  <Aside.Root --dry-grid-area-name="aside">…</Aside.Root>
  <Footer.Root --dry-grid-area-name="foot">…</Footer.Root>
${ROOT_CLOSE}`;

export const spanSnippet = `${ROOT_OPEN} template="12-span">
  <Card.Root>1</Card.Root>
  <Card.Root>2</Card.Root>
  <!-- … flows into 12 equal columns … -->
${ROOT_CLOSE}`;

export const cardGridSnippet = `${ROOT_OPEN} template="card-grid" --dry-area-grid-min-track="14rem">
  <Card.Root>…</Card.Root>
  <Card.Root>…</Card.Root>
  <Card.Root>…</Card.Root>
${ROOT_CLOSE}`;
