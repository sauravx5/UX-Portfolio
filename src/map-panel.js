// map-panel.js — Shadcn-style right panel for zone info

import { ZONES } from './map-zones.js';

const panel  = document.getElementById('zone-panel');
const icon   = document.getElementById('panel-icon');
const tag    = document.getElementById('panel-tag');
const title  = document.getElementById('panel-title');
const body   = document.getElementById('panel-body');

/* ── Open panel with zone data ───────────────────────────────────── */
export function openPanel(zone) {
  // Header
  icon.textContent  = zone.icon;
  tag.textContent   = zone.tag;
  title.textContent = zone.name;

  // Body content
  body.innerHTML = renderBody(zone);

  // Animate stat counters
  setTimeout(() => {
    body.querySelectorAll('[data-count]').forEach(el => {
      animateCount(el, parseInt(el.dataset.count, 10));
    });
  }, 80);

  // Pedestal accordion
  body.querySelectorAll('.pedestal-item').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('expanded'));
  });

  panel.classList.add('open');
}

/* ── Close panel ─────────────────────────────────────────────────── */
export function closePanel() {
  panel.classList.remove('open');
}

/* ── Render panel body HTML ──────────────────────────────────────── */
function renderBody(zone) {
  // Impact bullets
  const impactList = zone.impact
    ? `<ul style="margin:0;padding-left:16px;display:flex;flex-direction:column;gap:5px;">
        ${zone.impact.map(i => `<li style="font-size:0.8rem;color:var(--panel-fg);line-height:1.5;">${i}</li>`).join('')}
      </ul>`
    : '';

  let html = `
    <p class="panel-desc">${zone.desc}</p>
    <div>
      <span class="panel-section-label">Impact Achieved</span>
      ${impactList}
    </div>
    <div>
      <span class="panel-section-label">Key Metrics</span>
      <div class="achievements-grid">
        ${zone.achievements.map(a => `
          <div class="ach-row">
            <div class="ach-stat">
              <span data-count="${a.stat}">0</span><span style="font-size:1rem">${a.suffix}</span>
            </div>
            <div class="ach-label">${a.label}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div>
      <span class="panel-section-label">Key Features</span>
      <div class="tools-wrap">
        ${zone.tools.map(t => `<span class="tool-chip">${t}</span>`).join('')}
      </div>
    </div>
  `;

  // Footer hint
  html += `
    <div style="padding: 14px 0 4px; border-top: 1px solid var(--panel-border); margin-top: 4px;">
      <p style="font-family: var(--mono); font-size: 0.68rem; color: var(--panel-muted); letter-spacing: 1px;">
        Click other zones on the map or legend to explore →
      </p>
    </div>
  `;

  return html;
}

/* ── Animated counter ─────────────────────────────────────────────── */
function animateCount(el, target) {
  const dur = 1400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
