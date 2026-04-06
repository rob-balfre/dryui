import type { LayoutModeComponentType } from './types.js';

interface PlacementSkeletonOptions {
	type: LayoutModeComponentType;
	width: number;
	height: number;
	text?: string;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function cssSize(value: number | string): string {
	return typeof value === 'number' ? `${Math.round(value)}px` : value;
}

function bar(
	width: number | string,
	height: number = 3,
	strong: boolean = false,
	extra: string = ''
): string {
	return `<div style="inline-size:${cssSize(width)};block-size:${cssSize(height)};border-radius:999px;background:${strong ? 'var(--agd-bar-strong)' : 'var(--agd-bar)'};flex-shrink:0;${extra}"></div>`;
}

function block(
	width: number | string,
	height: number | string,
	radius: number = 4,
	extra: string = ''
): string {
	return `<div style="inline-size:${cssSize(width)};block-size:${cssSize(height)};border-radius:${cssSize(radius)};border:1px dashed var(--agd-stroke);background:var(--agd-fill);flex-shrink:0;${extra}"></div>`;
}

function circle(size: number, extra: string = ''): string {
	return `<div style="inline-size:${cssSize(size)};block-size:${cssSize(size)};border-radius:999px;border:1px dashed var(--agd-stroke);background:var(--agd-fill);flex-shrink:0;${extra}"></div>`;
}

function wrap(type: LayoutModeComponentType, body: string): string {
	return `<div data-design-skeleton data-design-skeleton-type="${type}" style="position:relative;inline-size:100%;block-size:100%;overflow:hidden;display:flex;border-radius:inherit;--agd-fill:color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 10%, transparent);--agd-fill-strong:color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 16%, transparent);--agd-stroke:color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 44%, transparent);--agd-bar:color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 26%, transparent);--agd-bar-strong:color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 50%, transparent);--agd-text:color-mix(in srgb, var(--dry-color-text-strong, #111827) 78%, transparent);">${body}</div>`;
}

function renderNavigation(width: number, height: number): string {
	const pad = clamp(height * 0.2, 8, 18);
	return `
    <div style="display:flex;align-items:center;inline-size:100%;block-size:100%;padding:0 ${cssSize(pad)};gap:${cssSize(width * 0.024)};">
      ${block(clamp(height * 0.48, 20, 34), clamp(height * 0.42, 12, 24), 4)}
      <div style="display:flex;flex:1;gap:${cssSize(width * 0.03)};margin-inline-start:${cssSize(width * 0.03)};">
        ${bar(width * 0.08)}
        ${bar(width * 0.09)}
        ${bar(width * 0.07)}
        ${bar(width * 0.08)}
      </div>
      ${block(width * 0.12, clamp(height * 0.44, 20, 28), 6)}
    </div>
  `;
}

function renderHero(width: number, height: number, text?: string, actionCount: number = 1): string {
	const label = text ? escapeHtml(text) : '';
	const buttons = Array.from({ length: actionCount }, () =>
		block(clamp(width * 0.16, 72, 140), clamp(height * 0.12, 26, 38), 8)
	).join('');
	return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;inline-size:100%;block-size:100%;padding:${cssSize(clamp(height * 0.12, 12, 32))};gap:${cssSize(clamp(height * 0.04, 8, 18))};text-align:center;">
      ${
				label
					? `<span style="font-size:${cssSize(clamp(height * 0.085, 14, 22))};font-weight:600;color:var(--agd-text);max-inline-size:80%;line-height:1.2;">${label}</span>`
					: bar(width * 0.52, clamp(height * 0.035, 5, 10), true)
			}
      ${bar(width * 0.62)}
      ${bar(width * 0.42)}
      <div style="display:flex;gap:${cssSize(8)};margin-top:${cssSize(clamp(height * 0.05, 8, 18))};">${buttons}</div>
    </div>
  `;
}

function renderSidebar(width: number, height: number): string {
	const items = clamp(Math.floor(height / 40), 4, 9);
	const rows = Array.from(
		{ length: items },
		(_, index) => `
    <div style="display:flex;align-items:center;gap:${cssSize(8)};">
      ${block(12, 12, 3)}
      ${bar(`${50 + ((index * 11) % 25)}%`)}
    </div>
  `
	).join('');

	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.08, 10, 18))};gap:${cssSize(clamp(height * 0.03, 6, 14))};">
      ${bar('58%', 4, true)}
      ${rows}
    </div>
  `;
}

function renderFooter(width: number, height: number): string {
	const columns = clamp(Math.floor(width / 180), 2, 4);
	const blocks = Array.from(
		{ length: columns },
		() => `
    <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(5)};">
      ${bar('55%', 3, true)}
      ${bar('78%', 2)}
      ${bar('64%', 2)}
      ${bar('70%', 2)}
    </div>
  `
	).join('');

	return `<div style="display:flex;inline-size:100%;block-size:100%;padding:${cssSize(clamp(height * 0.12, 10, 24))} ${cssSize(clamp(width * 0.04, 10, 18))};gap:${cssSize(clamp(width * 0.04, 12, 28))};">${blocks}</div>`;
}

function renderPanel(width: number, height: number, footer: boolean = true): string {
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:${cssSize(clamp(height * 0.05, 8, 14))} ${cssSize(clamp(width * 0.04, 10, 16))};border-bottom:1px solid var(--agd-stroke);">
        ${bar(width * 0.34, 4, true)}
        ${block(14, 14, 4)}
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(6)};padding:${cssSize(clamp(width * 0.04, 10, 16))};">
        ${bar('90%')}
        ${bar('76%')}
        ${bar('84%')}
      </div>
      ${
				footer
					? `<div style="display:flex;justify-content:flex-end;gap:${cssSize(8)};padding:${cssSize(clamp(height * 0.05, 8, 14))} ${cssSize(clamp(width * 0.04, 10, 16))};border-top:1px solid var(--agd-stroke);">
            ${block(70, 28, 6)}
            ${block(72, 28, 6, 'background:var(--agd-bar);')}
          </div>`
					: ''
			}
    </div>
  `;
}

function renderCard(
	width: number,
	height: number,
	text?: string,
	imageRatio: number = 0.38
): string {
	const label = text ? escapeHtml(text) : '';
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;">
      <div style="block-size:${cssSize(height * imageRatio)};background:var(--agd-fill);border-bottom:1px dashed var(--agd-stroke);"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(6)};padding:${cssSize(clamp(width * 0.04, 8, 14))};">
        ${
					label
						? `<span style="font-size:${cssSize(clamp(height * 0.09, 11, 16))};font-weight:600;color:var(--agd-text);line-height:1.2;">${label}</span>`
						: bar('72%', 4, true)
				}
        ${bar('94%', 2)}
        ${bar('82%', 2)}
        ${bar('56%', 2)}
      </div>
    </div>
  `;
}

function renderText(width: number, height: number, text?: string): string {
	if (text) {
		return `
      <div style="inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.04, 8, 12))};font-size:${cssSize(clamp(height * 0.16, 11, 16))};line-height:1.45;color:var(--agd-text);word-break:break-word;overflow:hidden;">
        ${escapeHtml(text)}
      </div>
    `;
	}

	const lines = clamp(Math.floor(height / 24), 2, 6);
	const rows = Array.from({ length: lines }, (_, index) =>
		bar(`${68 + ((index * 13) % 26)}%`, index === 0 ? 5 : 2, index === 0)
	).join('');
	return `<div style="display:flex;flex-direction:column;gap:${cssSize(6)};inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.04, 8, 12))};">${rows}</div>`;
}

function renderMedia(width: number, height: number, showControls: boolean = false): string {
	const controls = showControls
		? `<div style="position:absolute;inset-inline:0;inset-block-end:0;display:flex;align-items:center;gap:${cssSize(8)};padding:${cssSize(10)};background:linear-gradient(180deg, transparent, color-mix(in srgb, var(--agd-fill-strong) 80%, transparent));">
        ${circle(10)}
        ${bar('48%', 3, true)}
        ${bar('18%', 3)}
      </div>`
		: '';

	return `
    <div style="position:relative;inline-size:100%;block-size:100%;">
      <svg width="100%" height="100%" viewBox="0 0 ${Math.max(1, width)} ${Math.max(1, height)}" preserveAspectRatio="none" fill="none">
        <rect x="0.5" y="0.5" width="${Math.max(0, width - 1)}" height="${Math.max(0, height - 1)}" rx="10" stroke="var(--agd-stroke)" stroke-dasharray="6 4" />
        <path d="M0 ${height * 0.78} L${width * 0.32} ${height * 0.44} L${width * 0.54} ${height * 0.62} L${width} ${height * 0.24}" stroke="var(--agd-stroke)" stroke-width="1.4" />
        <circle cx="${width * 0.24}" cy="${height * 0.28}" r="${Math.max(4, Math.min(width, height) * 0.06)}" fill="var(--agd-fill-strong)" stroke="var(--agd-stroke)" />
      </svg>
      ${controls}
    </div>
  `;
}

function renderTable(width: number, height: number): string {
	const columns = clamp(Math.floor(width / 110), 2, 5);
	const rows = clamp(Math.floor(height / 36), 3, 6);
	const header = Array.from(
		{ length: columns },
		() => `<div style="flex:1;padding:0 ${cssSize(8)};">${bar('70%', 3, true)}</div>`
	).join('');
	const body = Array.from(
		{ length: rows },
		(_, rowIndex) => `
    <div style="display:flex;border-bottom:1px solid color-mix(in srgb, var(--agd-stroke) 55%, transparent);padding:${cssSize(6)} 0;">
      ${Array.from({ length: columns }, (_, columnIndex) => `<div style="flex:1;padding:0 ${cssSize(8)};">${bar(`${48 + ((rowIndex * 9 + columnIndex * 11) % 35)}%`, 2)}</div>`).join('')}
    </div>
  `
	).join('');

	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.03, 8, 14))};">
      <div style="display:flex;border-bottom:1px solid var(--agd-stroke);padding:${cssSize(8)} 0;">${header}</div>
      ${body}
    </div>
  `;
}

function renderGrid(width: number, height: number, minColumns: number = 2): string {
	const columns = clamp(Math.floor(width / 160), minColumns, 4);
	const rows = clamp(Math.floor(height / 120), 2, 4);
	const cells = Array.from({ length: rows * columns }, () => block('100%', '100%', 8)).join('');
	return `
    <div style="display:grid;grid-template-columns:repeat(${columns}, minmax(0, 1fr));grid-auto-rows:minmax(0, 1fr);gap:${cssSize(clamp(width * 0.02, 8, 18))};inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.04, 10, 16))};">
      ${cells}
    </div>
  `;
}

function renderList(height: number, kind: 'bullet' | 'faq' | 'timeline' = 'bullet'): string {
	const items = clamp(Math.floor(height / 34), 3, 7);
	const rows = Array.from({ length: items }, (_, index) => {
		if (kind === 'timeline') {
			return `
        <div style="display:flex;align-items:flex-start;gap:${cssSize(10)};">
          <div style="display:flex;flex-direction:column;align-items:center;gap:${cssSize(2)};">
            ${circle(10)}
            ${index < items - 1 ? `<div style="inline-size:2px;block-size:${cssSize(clamp(height * 0.1, 14, 26))};background:var(--agd-stroke);"></div>` : ''}
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(4)};padding-block-start:${cssSize(2)};">
            ${bar('38%', 3, true)}
            ${bar('78%', 2)}
          </div>
        </div>
      `;
		}

		return `
      <div style="display:flex;align-items:${kind === 'faq' ? 'center' : 'flex-start'};gap:${cssSize(8)};">
        ${kind === 'faq' ? block(12, 12, 3) : circle(8)}
        <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(4)};">
          ${bar(`${kind === 'faq' ? 70 : 58}%`, kind === 'faq' ? 3 : 2, kind === 'faq')}
          ${kind === 'faq' ? '' : bar(`${72 + ((index * 9) % 18)}%`, 2)}
        </div>
      </div>
    `;
	}).join('');

	return `<div style="display:flex;flex-direction:column;gap:${cssSize(8)};inline-size:100%;block-size:100%;padding:${cssSize(10)};">${rows}</div>`;
}

function renderTabs(width: number, height: number): string {
	const count = clamp(Math.floor(width / 120), 3, 5);
	const tabs = Array.from({ length: count }, (_, index) =>
		bar(`${60 + ((index * 17) % 18)}px`, 3, index === 0)
	).join('');
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;">
      <div style="display:flex;align-items:center;gap:${cssSize(14)};padding:${cssSize(10)} ${cssSize(12)};border-bottom:1px solid var(--agd-stroke);">${tabs}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:${cssSize(6)};padding:${cssSize(12)};">
        ${bar('42%', 4, true)}
        ${bar('92%', 2)}
        ${bar('80%', 2)}
      </div>
    </div>
  `;
}

function renderPill(text?: string, rounded: number = 999): string {
	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;padding-inline:${cssSize(10)};border-radius:${cssSize(rounded)};border:1px solid var(--agd-stroke);background:var(--agd-fill);">
      ${text ? `<span style="font-size:${cssSize(12)};font-weight:600;color:var(--agd-text);line-height:1;">${escapeHtml(text)}</span>` : bar('58%', 3, true)}
    </div>
  `;
}

function renderField(width: number, height: number, withIcon: boolean = false): string {
	return `
    <div style="display:flex;flex-direction:column;justify-content:center;gap:${cssSize(6)};inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.04, 8, 12))};">
      ${bar(clamp(width * 0.28, 56, 92), 2)}
      <div style="display:flex;align-items:center;gap:${cssSize(8)};block-size:${cssSize(clamp(height * 0.56, 24, 36))};padding-inline:${cssSize(10)};border-radius:${cssSize(6)};border:1px dashed var(--agd-stroke);background:var(--agd-fill);">
        ${withIcon ? circle(12) : ''}
        ${bar(withIcon ? '46%' : '58%', 3, true)}
      </div>
    </div>
  `;
}

function renderForm(width: number, height: number): string {
	const fields = clamp(Math.floor(height / 72), 3, 5);
	const rows = Array.from({ length: fields }, (_, index) =>
		renderField(width, clamp(height * 0.18, 42, 58), index === 0)
	).join('');
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.05, 12, 18))};gap:${cssSize(10)};">
      ${rows}
      <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:${cssSize(8)};">
        ${block(88, 30, 8)}
      </div>
    </div>
  `;
}

function renderPricing(width: number, height: number): string {
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.05, 12, 18))};gap:${cssSize(8)};">
      ${bar('40%', 3, true)}
      ${bar('24%', clamp(height * 0.03, 8, 14), true)}
      ${bar('54%', 2)}
      <div style="display:flex;flex-direction:column;gap:${cssSize(6)};margin-block:${cssSize(10)};">
        ${Array.from({ length: 4 }, () => `<div style="display:flex;align-items:center;gap:${cssSize(8)};">${circle(8)}${bar('72%', 2)}</div>`).join('')}
      </div>
      <div style="margin-top:auto;">${block('100%', 34, 8, 'background:var(--agd-bar);')}</div>
    </div>
  `;
}

function renderAlert(width: number, height: number): string {
	return `
    <div style="display:flex;align-items:center;inline-size:100%;block-size:100%;padding:${cssSize(clamp(height * 0.18, 8, 14))};gap:${cssSize(10)};">
      ${circle(clamp(height * 0.28, 14, 20))}
      <div style="display:flex;flex-direction:column;gap:${cssSize(4)};flex:1;">
        ${bar('48%', 3, true)}
        ${bar('78%', 2)}
      </div>
    </div>
  `;
}

function renderStat(width: number, height: number): string {
	return `
    <div style="display:flex;flex-direction:column;justify-content:center;inline-size:100%;block-size:100%;padding:${cssSize(clamp(width * 0.08, 12, 18))};gap:${cssSize(8)};">
      ${bar('34%', 2)}
      ${bar('44%', clamp(height * 0.08, 12, 20), true)}
      ${bar('60%', 2)}
    </div>
  `;
}

function renderCalendar(width: number, height: number): string {
	const rows = 5;
	const cells = Array.from({ length: rows * 7 }, () => block('100%', '100%', 4)).join('');
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(10)};gap:${cssSize(8)};">
      <div style="display:flex;align-items:center;justify-content:space-between;">${bar('30%', 3, true)}${bar('18%', 2)}</div>
      <div style="display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));grid-auto-rows:minmax(0, 1fr);gap:${cssSize(6)};flex:1;">
        ${cells}
      </div>
    </div>
  `;
}

function renderFileUpload(width: number, height: number): string {
	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;padding:${cssSize(12)};">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${cssSize(8)};inline-size:100%;block-size:100%;border:1.5px dashed var(--agd-stroke);border-radius:${cssSize(10)};background:color-mix(in srgb, var(--agd-fill) 70%, transparent);">
        ${block(20, 20, 6)}
        ${bar('42%', 3, true)}
        ${bar('26%', 2)}
      </div>
    </div>
  `;
}

function renderMap(width: number, height: number): string {
	return `
    <div style="position:relative;inline-size:100%;block-size:100%;background:
      linear-gradient(90deg, color-mix(in srgb, var(--agd-stroke) 28%, transparent) 1px, transparent 1px),
      linear-gradient(color-mix(in srgb, var(--agd-stroke) 28%, transparent) 1px, transparent 1px),
      var(--agd-fill);
      background-size:${cssSize(clamp(width * 0.08, 18, 36))} ${cssSize(clamp(height * 0.12, 18, 36))};
    ">
      <div style="position:absolute;inset-inline-start:${cssSize(width * 0.26)};inset-block-start:${cssSize(height * 0.22)};inline-size:${cssSize(clamp(width * 0.1, 14, 24))};block-size:${cssSize(clamp(width * 0.1, 14, 24))};border-radius:999px;background:var(--agd-fill-strong);border:1px solid var(--agd-stroke);"></div>
      <div style="position:absolute;inset-inline-start:${cssSize(width * 0.56)};inset-block-start:${cssSize(height * 0.48)};inline-size:${cssSize(clamp(width * 0.12, 16, 26))};block-size:${cssSize(clamp(width * 0.12, 16, 26))};border-radius:999px;background:var(--agd-bar-strong);border:1px solid var(--agd-stroke);"></div>
    </div>
  `;
}

function renderRange(width: number, height: number, withThumbs: number = 1): string {
	const thumbSize = clamp(height * 0.35, 10, 14);
	return `
    <div style="display:flex;align-items:center;inline-size:100%;block-size:100%;padding-inline:${cssSize(clamp(width * 0.06, 10, 16))};">
      <div style="position:relative;inline-size:100%;block-size:${cssSize(Math.max(4, height * 0.16))};border-radius:999px;background:var(--agd-fill-strong);">
        ${Array.from({ length: withThumbs }, (_, index) => `<div style="position:absolute;inset-block-start:50%;inset-inline-start:${index === 0 ? '28%' : '70%'};inline-size:${cssSize(thumbSize)};block-size:${cssSize(thumbSize)};border-radius:999px;background:var(--agd-bar-strong);border:1px solid var(--agd-stroke);transform:translate(-50%, -50%);"></div>`).join('')}
      </div>
    </div>
  `;
}

function renderBoolean(kind: 'checkbox' | 'radio' | 'toggle'): string {
	if (kind === 'toggle') {
		return `
      <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;">
        <div style="position:relative;inline-size:100%;block-size:100%;border-radius:999px;background:var(--agd-fill-strong);border:1px solid var(--agd-stroke);">
          <div style="position:absolute;inset-block-start:50%;inset-inline-end:2px;inline-size:calc(50% - 2px);block-size:calc(100% - 4px);border-radius:999px;background:#fff;transform:translateY(-50%);"></div>
        </div>
      </div>
    `;
	}

	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;">
      <div style="inline-size:100%;block-size:100%;border-radius:${kind === 'radio' ? '999px' : cssSize(5)};border:1px solid var(--agd-stroke);background:var(--agd-fill);"></div>
    </div>
  `;
}

function renderSpinner(width: number, height: number): string {
	const size = clamp(Math.min(width, height) * 0.72, 14, 28);
	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;">
      <div style="inline-size:${cssSize(size)};block-size:${cssSize(size)};border-radius:999px;border:${cssSize(Math.max(2, size * 0.12))} solid color-mix(in srgb, var(--agd-fill-strong) 85%, transparent);border-top-color:var(--agd-bar-strong);"></div>
    </div>
  `;
}

function renderDivider(width: number, height: number): string {
	return `<div style="display:flex;align-items:center;inline-size:100%;block-size:100%;">${block('100%', Math.max(1, height), 999, 'border:none;background:var(--agd-stroke);')}</div>`;
}

function renderDatePicker(width: number, height: number): string {
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(10)};gap:${cssSize(8)};">
      ${renderField(width, 44, false)}
      <div style="display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));grid-auto-rows:minmax(0, 1fr);gap:${cssSize(4)};flex:1;">
        ${Array.from({ length: 28 }, () => block('100%', '100%', 4)).join('')}
      </div>
    </div>
  `;
}

function renderDropdown(width: number, height: number): string {
	const rows = Array.from({ length: clamp(Math.floor(height / 34), 4, 6) }, () =>
		bar('72%', 2)
	).join('');
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(10)};gap:${cssSize(10)};">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--agd-stroke);padding-bottom:${cssSize(6)};">
        ${bar('42%', 3, true)}
        ${bar('12%', 2)}
      </div>
      <div style="display:flex;flex-direction:column;gap:${cssSize(8)};">${rows}</div>
    </div>
  `;
}

function renderRating(width: number): string {
	const stars = Array.from({ length: 5 }, () =>
		block(clamp(width * 0.12, 14, 20), clamp(width * 0.12, 14, 20), 4)
	).join('');
	return `<div style="display:flex;align-items:center;justify-content:center;gap:${cssSize(6)};inline-size:100%;block-size:100%;">${stars}</div>`;
}

function renderLogo(width: number, height: number): string {
	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;gap:${cssSize(8)};">
      ${block(clamp(height * 0.56, 14, 22), clamp(height * 0.56, 14, 22), 4)}
      ${bar(clamp(width * 0.42, 28, 56), 4, true)}
    </div>
  `;
}

function renderChart(width: number, height: number): string {
	const columns = 5;
	const bars = Array.from(
		{ length: columns },
		(_, index) =>
			`<div style="flex:1;display:flex;align-items:flex-end;">${block('70%', `${38 + ((index * 17) % 42)}%`, 4, 'align-self:flex-end;')}</div>`
	).join('');
	return `
    <div style="display:flex;flex-direction:column;inline-size:100%;block-size:100%;padding:${cssSize(12)};gap:${cssSize(8)};">
      ${bar('32%', 3, true)}
      <div style="display:flex;align-items:flex-end;gap:${cssSize(8)};flex:1;">${bars}</div>
    </div>
  `;
}

function renderButton(width: number, height: number, text?: string): string {
	return `
    <div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;border-radius:${cssSize(clamp(height / 3, 8, 14))};border:1px solid var(--agd-stroke);background:var(--agd-fill);">
      ${text ? `<span style="font-size:${cssSize(clamp(height * 0.36, 11, 14))};font-weight:600;color:var(--agd-text);line-height:1;">${escapeHtml(text)}</span>` : bar(clamp(width * 0.46, 26, 64), 3, true)}
    </div>
  `;
}

function renderPlacementBody({ type, width, height, text }: PlacementSkeletonOptions): string {
	switch (type) {
		case 'navigation':
		case 'header':
			return renderNavigation(width, height);
		case 'hero':
			return renderHero(width, height, text, 1);
		case 'cta':
			return renderHero(width, height, text, 2);
		case 'sidebar':
			return renderSidebar(width, height);
		case 'footer':
			return renderFooter(width, height);
		case 'modal':
			return renderPanel(width, height, true);
		case 'drawer':
		case 'popover':
			return renderPanel(width, height, false);
		case 'card':
		case 'testimonial':
		case 'feature':
			return renderCard(width, height, text, 0.34);
		case 'productCard':
			return renderCard(width, height, text, 0.46);
		case 'profile':
			return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;inline-size:100%;block-size:100%;padding:${cssSize(14)};gap:${cssSize(10)};">
          ${circle(clamp(Math.min(width, height) * 0.24, 24, 48))}
          ${text ? `<span style="font-size:${cssSize(14)};font-weight:600;color:var(--agd-text);">${escapeHtml(text)}</span>` : bar('40%', 4, true)}
          ${bar('64%', 2)}
          ${bar('52%', 2)}
        </div>
      `;
		case 'pricing':
			return renderPricing(width, height);
		case 'button':
			return renderButton(width, height, text);
		case 'badge':
		case 'tag':
		case 'chip':
			return renderPill(text, 999);
		case 'input':
			return renderField(width, height, false);
		case 'search':
			return renderField(width, height, true);
		case 'form':
		case 'login':
		case 'contact':
			return renderForm(width, height);
		case 'text':
		case 'codeBlock':
			return renderText(width, height, text);
		case 'list':
			return renderList(height);
		case 'faq':
			return renderList(height, 'faq');
		case 'timeline':
			return renderList(height, 'timeline');
		case 'image':
		case 'gallery':
		case 'map':
			return type === 'map'
				? renderMap(width, height)
				: type === 'gallery'
					? renderGrid(width, height, 3)
					: renderMedia(width, height, false);
		case 'video':
		case 'carousel':
			return renderMedia(width, height, true);
		case 'table':
			return renderTable(width, height);
		case 'calendar':
			return renderCalendar(width, height);
		case 'grid':
		case 'section':
		case 'team':
			return renderGrid(width, height);
		case 'tabs':
			return renderTabs(width, height);
		case 'dropdown':
			return renderDropdown(width, height);
		case 'breadcrumb':
			return `<div style="display:flex;align-items:center;inline-size:100%;block-size:100%;gap:${cssSize(8)};padding-inline:${cssSize(8)};">${bar('18%', 2, true)}${bar('6%', 2)}${bar('22%', 2)}${bar('6%', 2)}${bar('20%', 2)}</div>`;
		case 'pagination':
			return `<div style="display:flex;align-items:center;justify-content:center;gap:${cssSize(8)};inline-size:100%;block-size:100%;">${Array.from({ length: 5 }, (_, index) => block(clamp(height * 0.9, 18, 28), clamp(height * 0.9, 18, 28), 6, index === 2 ? 'background:var(--agd-bar-strong);' : '')).join('')}</div>`;
		case 'progress':
			return renderRange(width, height, 0);
		case 'slider':
			return renderRange(width, height, 1);
		case 'stepper':
			return `<div style="display:flex;align-items:center;justify-content:center;gap:${cssSize(8)};inline-size:100%;block-size:100%;">${Array.from({ length: 4 }, (_, index) => `<div style="display:flex;align-items:center;gap:${cssSize(8)};">${circle(14)}${index < 3 ? bar(40, 2) : ''}</div>`).join('')}</div>`;
		case 'toggle':
			return renderBoolean('toggle');
		case 'checkbox':
			return renderBoolean('checkbox');
		case 'radio':
			return renderBoolean('radio');
		case 'avatar':
			return `<div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;">${circle(clamp(Math.min(width, height) * 0.88, 18, 44))}</div>`;
		case 'tooltip':
			return renderAlert(width, height);
		case 'toast':
		case 'notification':
		case 'alert':
		case 'banner':
			return renderAlert(width, height);
		case 'stat':
			return renderStat(width, height);
		case 'rating':
			return renderRating(width);
		case 'fileUpload':
			return renderFileUpload(width, height);
		case 'datePicker':
			return renderDatePicker(width, height);
		case 'skeleton':
			return renderText(width, height);
		case 'icon':
			return `<div style="display:flex;align-items:center;justify-content:center;inline-size:100%;block-size:100%;">${block(clamp(Math.min(width, height) * 0.78, 12, 22), clamp(Math.min(width, height) * 0.78, 12, 22), 4)}</div>`;
		case 'spinner':
			return renderSpinner(width, height);
		case 'logo':
			return renderLogo(width, height);
		case 'chart':
			return renderChart(width, height);
		case 'divider':
			return renderDivider(width, height);
		default:
			return renderCard(width, height, text, 0.38);
	}
}

export function renderPlacementSkeleton(options: PlacementSkeletonOptions): string {
	return wrap(options.type, renderPlacementBody(options));
}
