// hud.js — Minimap, zone cards, copilot panel, network status, achievement modals

import { ZONE_DATA } from './zones.js';

/* ── Minimap ─────────────────────────────────────────────────── */
export class Minimap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.W = this.canvas.width;
    this.H = this.canvas.height;
    this.worldScale = this.W / 480; // 480 units = world half-span

    this.zoneColors = {
      zone1: '#ffb347', zone2: '#00f5ff',
      zone3: '#00d4aa', zone4: '#2ed573', hall: '#ffffff',
    };
    this.zonePositions = [
      { id:'zone1', x:-130, z:0 }, { id:'zone2', x:130, z:0 },
      { id:'zone3', x:0, z:-140 }, { id:'zone4', x:0, z:140 },
      { id:'hall',  x:0,   z:0 },
    ];
  }

  _worldToMap(wx, wz) {
    const cx = this.W/2, cy = this.H/2;
    return {
      mx: cx + wx * this.worldScale,
      my: cy + wz * this.worldScale,
    };
  }

  update(playerPos, playerYaw) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    ctx.clearRect(0,0,W,H);

    // Background
    ctx.save();
    ctx.beginPath(); ctx.arc(W/2,H/2,W/2,0,Math.PI*2); ctx.clip();
    ctx.fillStyle = 'rgba(5,10,22,0.88)'; ctx.fillRect(0,0,W,H);

    // Scanline rings
    ctx.strokeStyle='rgba(0,245,255,0.07)'; ctx.lineWidth=1;
    for (let r=20;r<W/2;r+=20){
      ctx.beginPath(); ctx.arc(W/2,H/2,r,0,Math.PI*2); ctx.stroke();
    }

    // Cross lines
    ctx.strokeStyle='rgba(0,245,255,0.1)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();

    // Road lines (simplified)
    ctx.strokeStyle='rgba(20,40,60,0.5)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(W/2-60,H/2); ctx.lineTo(W/2+60,H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2,H/2-60); ctx.lineTo(W/2,H/2+60); ctx.stroke();

    // Zone dots
    for (const z of this.zonePositions) {
      const {mx,my} = this._worldToMap(z.x - playerPos.x, z.z - playerPos.z);
      if (mx<0||mx>W||my<0||my>H) continue;
      const col = this.zoneColors[z.id];
      ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2);
      ctx.fillStyle=col+'55'; ctx.fill();
      ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke();
      // pulse
      const pulse = 0.5+0.5*Math.sin(Date.now()*0.003);
      ctx.beginPath(); ctx.arc(mx,my,5+pulse*3,0,Math.PI*2);
      ctx.strokeStyle=col+'44'; ctx.lineWidth=1; ctx.stroke();
    }

    // Player arrow
    const cx2=W/2, cy2=H/2;
    ctx.save();
    ctx.translate(cx2,cy2);
    ctx.rotate(playerYaw);
    ctx.beginPath();
    ctx.moveTo(0,-7); ctx.lineTo(4,5); ctx.lineTo(0,2); ctx.lineTo(-4,5);
    ctx.closePath();
    ctx.fillStyle='#fff'; ctx.fill();
    ctx.restore();

    // Border ring
    ctx.restore();
    ctx.beginPath(); ctx.arc(W/2,H/2,W/2-1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,245,255,0.25)'; ctx.lineWidth=1.5; ctx.stroke();
  }
}

/* ── Zone Card ───────────────────────────────────────────────── */
let activeZoneCard = null;
export function showZoneCard(zoneId) {
  if (activeZoneCard === zoneId) return;
  activeZoneCard = zoneId;
  const data = ZONE_DATA[zoneId];
  if (!data) return;

  document.getElementById('zone-card-tag').textContent   = data.tag;
  document.getElementById('zone-card-title').textContent = data.title;
  document.getElementById('zone-card-icon').textContent  = data.icon;
  document.getElementById('zone-card-desc').textContent  = data.desc;
  document.getElementById('current-zone-name').textContent = data.tag.split('—')[0].trim();

  // Achievements with animated counters
  const achEl = document.getElementById('zone-achievements');
  achEl.innerHTML = '';
  data.achievements.forEach(a => {
    const div = document.createElement('div');
    div.className = 'ach-item';
    const statEl = document.createElement('div'); statEl.className='ach-stat';
    statEl.textContent = '0'+a.suffix;
    const labEl = document.createElement('div'); labEl.className='ach-label';
    labEl.textContent = a.label;
    div.appendChild(statEl); div.appendChild(labEl);
    achEl.appendChild(div);
    // Animate counter if numeric
    const num = parseInt(a.stat);
    if (!isNaN(num)) animateCounter(statEl, 0, num, a.suffix, 1200);
    else statEl.textContent = a.stat + a.suffix;
  });

  // Tools
  const toolsEl = document.getElementById('zone-tools');
  toolsEl.innerHTML = '';
  (data.tools || []).forEach(t => {
    const chip = document.createElement('div');
    chip.className='tool-chip'; chip.textContent=t;
    toolsEl.appendChild(chip);
  });

  const card = document.getElementById('zone-card');
  card.classList.remove('hidden');
}

export function hideZoneCard() {
  activeZoneCard = null;
  document.getElementById('zone-card').classList.add('hidden');
  document.getElementById('current-zone-name').textContent = 'OPEN CITY';
}

export function getActiveZoneCard() { return activeZoneCard; }

/* ── Counter Animation ───────────────────────────────────────── */
function animateCounter(el, from, to, suffix, durationMs) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (to-from)*ease);
    el.textContent = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── Interaction Prompt ──────────────────────────────────────── */
export function showPrompt(text, elId='interaction-prompt', textId='prompt-text') {
  const el = document.getElementById(elId);
  const tx = document.getElementById(textId);
  if (tx) tx.textContent = text;
  el.classList.remove('hidden');
}
export function hidePrompt(elId='interaction-prompt') {
  document.getElementById(elId).classList.add('hidden');
}

/* ── Copilot Panel ───────────────────────────────────────────── */
const COPILOT_SCRIPT = [
  { delay:200,  type:'system',  text:'SYSTEM MONITOR ACTIVE — Airwave NOC v3.4.1' },
  { delay:600,  type:'alert',   text:'⚠ ALERT: Sector 7G — Signal degradation detected (RxLevel: -95 dBm)' },
  { delay:1100, type:'alert',   text:'⚠ ALERT: 23 neighbor handoff failures in last 5 min' },
  { delay:1800, type:'ai',      text:'Copilot> Analyzing antenna tilt configuration...' },
  { delay:2800, type:'ai',      text:'Copilot> Root cause identified: Physical tilt drift on AZM 045° sector' },
  { delay:3400, type:'ai',      text:'Copilot> Cross-referencing RF model vs. live measurement delta...' },
  { delay:4200, type:'ai',      text:'Copilot> Recommended action: Adjust electrical tilt from 4° → 6°' },
  { delay:5000, type:'success', text:'✓ Dispatch ticket auto-created — Priority: HIGH — ETA: 45 min' },
  { delay:5400, type:'success', text:'✓ Predicted coverage improvement: +18% in Sector 7G' },
  { delay:6000, type:'system',  text:'Manual diagnostic effort reduced by 50%+ via AI-assisted triage' },
];

let copilotRunning = false;
export function runCopilotSimulation() {
  if (copilotRunning) return;
  copilotRunning = true;

  const panel = document.getElementById('copilot-panel');
  const log   = document.getElementById('copilot-log');
  const typing= document.getElementById('copilot-typing');
  panel.classList.remove('hidden');
  log.innerHTML = '';

  COPILOT_SCRIPT.forEach(({delay, type, text}) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `log-line ${type}`;
      if (type === 'ai') {
        // Typewriter effect
        typing.textContent = '';
        let i = 0;
        const iv = setInterval(() => {
          typing.textContent += text[i++];
          if (i >= text.length) {
            clearInterval(iv);
            const final = document.createElement('div');
            final.className = `log-line ${type}`;
            final.textContent = text;
            log.appendChild(final);
            typing.textContent = '';
            scrollLog(log);
          }
        }, 28);
      } else {
        line.textContent = text;
        log.appendChild(line);
        scrollLog(log);
      }
    }, delay);
  });

  setTimeout(() => { copilotRunning = false; }, 7000);
}

function scrollLog(el) { el.scrollTop = el.scrollHeight; }

export function hideCopilot() {
  document.getElementById('copilot-panel').classList.add('hidden');
  copilotRunning = false;
}

/* ── Network Status Map (Zone 4) ────────────────────────────── */
export function showNetworkStatus(isOutage) {
  const panel = document.getElementById('network-status-panel');
  panel.classList.remove('hidden');

  const cv  = document.getElementById('network-map-canvas');
  const ctx = cv.getContext('2d');
  drawNetworkMap(ctx, cv.width, cv.height, isOutage);
}

function drawNetworkMap(ctx, W, H, hasOutage) {
  ctx.fillStyle = '#060c1c'; ctx.fillRect(0,0,W,H);

  // Grid background
  ctx.strokeStyle='rgba(0,245,255,0.05)'; ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0;y<H;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Sites
  const sites = [
    {x:60,y:50,status:'green'},{x:120,y:80,status:'green'},{x:190,y:55,status:'green'},
    {x:250,y:90,status:'green'},{x:310,y:60,status:'green'},{x:360,y:80,status:'green'},
    {x:90,y:130,status:'green'},{x:160,y:160,status:hasOutage?'red':'green'},
    {x:220,y:140,status:hasOutage?'red':'green'},{x:280,y:150,status:hasOutage?'yellow':'green'},
    {x:330,y:130,status:'green'},{x:50,y:175,status:'green'},
    {x:130,y:195,status:hasOutage?'red':'green'},{x:200,y:190,status:hasOutage?'yellow':'green'},
    {x:270,y:185,status:'green'},{x:340,y:175,status:'green'},{x:380,y:155,status:'green'},
  ];

  const colorMap = { green:'#2ed573', yellow:'#ffa502', red:'#ff4757' };

  // Draw connections
  ctx.lineWidth=0.8;
  for (let i=0;i<sites.length-1;i++) {
    const a=sites[i], b=sites[i+1];
    const col = (a.status==='red'||b.status==='red') ? '#ff475755'
              : (a.status==='yellow'||b.status==='yellow') ? '#ffa50255'
              : '#2ed57333';
    ctx.strokeStyle=col;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }

  // Draw site circles
  for (const s of sites) {
    const col = colorMap[s.status];
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI*2);
    ctx.fillStyle = col+'44'; ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth=1.5; ctx.stroke();
    // Glow
    ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, Math.PI*2);
    ctx.strokeStyle = col+'22'; ctx.lineWidth=1; ctx.stroke();
  }

  // Status labels
  if (hasOutage) {
    ctx.fillStyle='rgba(255,71,87,0.15)';
    ctx.fillRect(130,100,120,80);
    ctx.strokeStyle='rgba(255,71,87,0.5)'; ctx.lineWidth=1;
    ctx.strokeRect(130,100,120,80);
    ctx.fillStyle='#ff4757'; ctx.font='bold 9px monospace';
    ctx.fillText('OUTAGE ZONE', 148,118);
    ctx.fillStyle='#ffffff66'; ctx.font='8px monospace';
    ctx.fillText('Weather Impact: 3 sites', 135,132);
    ctx.fillText('Est. restore: 45 min', 135,144);
  }

  ctx.fillStyle='rgba(0,245,255,0.7)'; ctx.font='8px monospace';
  ctx.fillText('NATIONWIDE COVERAGE VIEW', 8, 12);
  ctx.fillStyle='rgba(0,212,170,0.6)';
  ctx.fillText(hasOutage ? 'STATUS: PARTIAL OUTAGE' : 'STATUS: ALL SYSTEMS NOMINAL', 8, H-6);
}

export function hideNetworkStatus() {
  document.getElementById('network-status-panel').classList.add('hidden');
}

/* ── Achievement Modal ────────────────────────────────────────── */
export function showAchievement(data) {
  document.getElementById('ach-modal-icon').textContent  = data.label;
  document.getElementById('ach-modal-tag').textContent   = data.tag;
  document.getElementById('ach-modal-title').textContent = data.title;
  document.getElementById('ach-modal-body').textContent  = data.body;
  document.getElementById('achievement-modal').classList.remove('hidden');
}

export function hideAchievement() {
  document.getElementById('achievement-modal').classList.add('hidden');
}

/* ── Storm Banner ────────────────────────────────────────────── */
export function showStormAlert() {
  const el = document.getElementById('storm-alert');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4500);
}
