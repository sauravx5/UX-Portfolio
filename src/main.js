// main.js — Spline Diorama Style: Isometric camera + OrbitControls

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildWorld } from './world.js';
import { buildZones } from './zones.js';
import { buildCityParticles, animateAmbientParticles } from './effects.js';
import {
  Minimap, showZoneCard, hideZoneCard, getActiveZoneCard,
  showPrompt, hidePrompt,
  runCopilotSimulation, hideCopilot,
  showNetworkStatus, hideNetworkStatus,
  showAchievement, hideAchievement,
  showStormAlert,
} from './hud.js';

/* ── Renderer ───────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x6EE86E);

/* ── Scene ──────────────────────────────────────────────────── */
const scene = new THREE.Scene();

/* ── Isometric-style Camera (Perspective with steep angle) ──── */
// Spline uses perspective but with very long focal length + high angle
// giving a near-orthographic isometric feel
const CAM_DIST = 280;
const ISO_ANGLE = Math.PI / 4.5; // ~40 degrees from horizontal
const ISO_YAW   = Math.PI / 4;   // 45 degrees horizontal (true isometric)

const camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 1, 2000);

// Isometric position
function setIsoCameraPos(target, dist) {
  camera.position.set(
    target.x + Math.cos(ISO_YAW) * Math.cos(ISO_ANGLE) * dist,
    target.y + Math.sin(ISO_ANGLE) * dist,
    target.z + Math.sin(ISO_YAW) * Math.cos(ISO_ANGLE) * dist
  );
  camera.lookAt(target);
}
setIsoCameraPos(new THREE.Vector3(0, 5, 0), CAM_DIST);

/* ── Orbit Controls (drag to pan/rotate, scroll to zoom) ────── */
const orbit = new OrbitControls(camera, canvas);
orbit.enableDamping     = true;
orbit.dampingFactor     = 0.08;
orbit.enablePan         = true;
orbit.panSpeed          = 1.2;
orbit.rotateSpeed       = 0.6;
orbit.zoomSpeed         = 1.2;
orbit.minDistance       = 40;
orbit.maxDistance       = 500;
orbit.maxPolarAngle     = Math.PI / 2.5; // don't go below ground
orbit.target.set(0, 5, 0);
orbit.update();

/* ── Build World ────────────────────────────────────────────── */
buildWorld(scene);
const zones    = buildZones(scene);

/* ── Ambient Particles (bright specks for Spline feel) ─────── */
const particles = buildCityParticles(scene);

/* ── HUD Minimap ────────────────────────────────────────────── */
const minimap = new Minimap('minimap');

/* ── State ──────────────────────────────────────────────────── */
let gameStarted   = false;
let prevTime      = performance.now();
let nearZone      = null;
let nearPedestal  = null;
let copilotOpen   = false;
let netStatusOpen = false;
let xrayOn        = false;
let zone4outage   = false;

/* ── Zone Color Map (for zone card icon bg) ─────────────────── */
const ZONE_ICON_CLASSES = { zone1:'z1', zone2:'z2', zone3:'z3', zone4:'z4', hall:'zh' };

/* ── Loading Progress ───────────────────────────────────────── */
const msgs = [
  'Building the City...','Painting the Buildings...','Planting Trees...',
  'Setting Up NOC...','Connecting the Network...','Starting Experience...'
];
let step = 0;
const loaderBar    = document.getElementById('loader-bar');
const loaderStatus = document.getElementById('loader-status');

function advanceLoader() {
  if (step >= msgs.length) return;
  loaderStatus.textContent = msgs[step];
  loaderBar.style.width = ((step+1)/msgs.length*100)+'%';
  step++;
  if (step < msgs.length) setTimeout(advanceLoader, 380+Math.random()*280);
  else setTimeout(showWelcome, 450);
}

function showWelcome() {
  const ls = document.getElementById('loading-screen');
  ls.classList.add('fade-out');
  setTimeout(() => {
    ls.style.display = 'none';
    document.getElementById('welcome-overlay').classList.remove('hidden');
  }, 600);
}

advanceLoader();

/* ── Enter City ─────────────────────────────────────────────── */
document.getElementById('enter-btn').addEventListener('click', () => {
  document.getElementById('welcome-overlay').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  if ('ontouchstart' in window) document.getElementById('mobile-controls').classList.remove('hidden');
  startCinematic();
});

/* ── Cinematic Flythrough ───────────────────────────────────── */
function startCinematic() {
  // Start high, orbit down to isometric view
  const startPos  = new THREE.Vector3(0, 400, 400);
  const endTarget = new THREE.Vector3(0, 5, 0);
  const dur       = 3200;
  const startTime = performance.now();
  orbit.enabled   = false;

  function cinTick(now) {
    const t    = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1-t, 3);

    // Lerp from sky to iso position
    const isoPos = new THREE.Vector3(
      endTarget.x + Math.cos(ISO_YAW)*Math.cos(ISO_ANGLE)*CAM_DIST,
      endTarget.y + Math.sin(ISO_ANGLE)*CAM_DIST,
      endTarget.z + Math.sin(ISO_YAW)*Math.cos(ISO_ANGLE)*CAM_DIST
    );
    camera.position.lerpVectors(startPos, isoPos, ease);
    camera.lookAt(endTarget);

    if (t < 1) {
      requestAnimationFrame(cinTick);
    } else {
      orbit.enabled = true;
      orbit.target.copy(endTarget);
      orbit.update();
      gameStarted = true;
    }
  }
  requestAnimationFrame(cinTick);
}

/* ── Interaction (E key + Click on zone) ────────────────────── */
document.addEventListener('keydown', e => {
  if (!gameStarted) return;

  if (e.code === 'KeyE') handleInteract();

  if (e.code === 'KeyX' && nearZone === 'zone2') {
    const z = zones.find(z => z.id === 'zone2');
    if (z?.toggleXray) {
      xrayOn = z.toggleXray();
      showPrompt(xrayOn ? '🔍 X-Ray Mode Active' : '✖ X-Ray Off', 'xray-prompt');
      setTimeout(() => hidePrompt('xray-prompt'), 2200);
    }
  }

  if (e.code === 'Escape') {
    hideZoneCard(); hideCopilot(); hideNetworkStatus(); hideAchievement();
    copilotOpen = false; netStatusOpen = false;
  }
});

function handleInteract() {
  if (!nearZone) return;
  const zone = zones.find(z => z.id === nearZone);
  if (!zone) return;
  switch (zone.id) {
    case 'zone1': focusZone(zone); break;
    case 'zone2': showZoneCard('zone2'); break;
    case 'zone3':
      if (!copilotOpen) { copilotOpen = true; runCopilotSimulation(); }
      break;
    case 'zone4':
      zone4outage = true;
      zone.triggerStorm(scene);
      showStormAlert();
      setTimeout(() => { showNetworkStatus(true); netStatusOpen = true; }, 1100);
      break;
    case 'hall':
      if (nearPedestal) showAchievement(nearPedestal);
      else showZoneCard('hall');
      break;
  }
}

/* ── Focus Camera on Zone ───────────────────────────────────── */
function focusZone(zone) {
  const target = zone.center.clone();
  const start  = orbit.target.clone();
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(
    target.x + Math.cos(ISO_YAW)*Math.cos(ISO_ANGLE)*100,
    target.y + Math.sin(ISO_ANGLE)*100,
    target.z + Math.sin(ISO_YAW)*Math.cos(ISO_ANGLE)*100
  );
  const dur = 900, startT = performance.now();
  orbit.enabled = false;

  function tween(now) {
    const t = Math.min((now-startT)/dur, 1);
    const ease = 1-Math.pow(1-t,3);
    camera.position.lerpVectors(startPos, endPos, ease);
    orbit.target.lerpVectors(start, target, ease);
    orbit.update();
    camera.lookAt(orbit.target);
    if (t < 1) requestAnimationFrame(tween);
    else { orbit.enabled = true; }
  }
  requestAnimationFrame(tween);
}

/* ── Clicking on zones in 3D space ─────────────────────────── */
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

canvas.addEventListener('click', e => {
  if (!gameStarted) return;
  mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  if (hits.length > 0) {
    // Find which zone was clicked
    for (const zone of zones) {
      const dist = hits[0].point.distanceTo(zone.center);
      if (dist < zone.radius) {
        nearZone = zone.id;
        showZoneCard(zone.id);
        focusZone(zone);
        if (zone.id !== 'zone1') handleInteract();
        break;
      }
    }
  }
});

/* ── Proximity Detection (updates every frame) ──────────────── */
function checkProximity() {
  const camTarget = orbit.target;
  nearZone    = null;
  nearPedestal = null;

  for (const z of zones) {
    const dist = camTarget.distanceTo(z.center);
    if (dist < z.radius + 30) {
      nearZone = z.id;
      showZoneCard(z.id);

      if (dist < z.interactRadius + 20) {
        const promptTexts = {
          zone1:'🗺️ Enter Planning View', zone2:'📡 View GIS Network',
          zone3:'⚡ Activate Copilot',    zone4:'📱 Trigger Weather Event',
          hall: '🏛️ Explore Achievements',
        };
        showPrompt(promptTexts[z.id]);
        if (z.id === 'zone2') showPrompt('🔍 Toggle X-Ray', 'xray-prompt');

        // Pedestal detection
        if (z.id === 'hall' && z.pedObjs) {
          for (const ped of z.pedObjs) {
            if (camTarget.distanceTo(ped.pos) < 12) {
              nearPedestal = ped; showPrompt(ped.title); break;
            }
          }
        }
      } else {
        hidePrompt();
        if (z.id !== 'zone2') hidePrompt('xray-prompt');
      }
      break;
    }
  }

  if (!nearZone) {
    hideZoneCard(); hidePrompt(); hidePrompt('xray-prompt');
  }
}

/* ── Zone Card Icon Background ──────────────────────────────── */
function setZoneIconBg(zoneId) {
  const el = document.getElementById('zone-card-icon');
  if (!el) return;
  const map = { zone1:'#FFF0EC', zone2:'#E8F5FF', zone3:'#F0FFF4', zone4:'#FFF8E1', hall:'#F3F0FF' };
  el.style.background = map[zoneId] || '#F5F5F5';
  el.className = 'zone-icon ' + (ZONE_ICON_CLASSES[zoneId] || '');
}

/* ── Close buttons ──────────────────────────────────────────── */
document.getElementById('zone-card-close').addEventListener('click', hideZoneCard);
document.getElementById('copilot-close').addEventListener('click', () => { hideCopilot(); copilotOpen=false; });
document.getElementById('ns-close').addEventListener('click', () => { hideNetworkStatus(); netStatusOpen=false; });
document.getElementById('ach-modal-close').addEventListener('click', hideAchievement);
document.getElementById('mobile-interact')?.addEventListener('click', handleInteract);

/* ── Resize ─────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ── Update top bar zone name when card changes ─────────────── */
let lastZone = null;
function syncTopBar() {
  const zn = getActiveZoneCard();
  if (zn !== lastZone) {
    lastZone = zn;
    const names = {
      zone1:'Planning District', zone2:'Core Network Tower',
      zone3:'Operations Center', zone4:'Consumer Front', hall:'Hall of Achievements',
    };
    document.getElementById('current-zone-name').textContent = names[zn] || 'City Overview';
    if (zn) setZoneIconBg(zn);
  }
}

/* ── Main Render Loop ───────────────────────────────────────── */
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt  = Math.min((now - prevTime)/1000, 0.05);
  prevTime  = now;

  if (gameStarted) {
    orbit.update();
    checkProximity();
    minimap.update(orbit.target, 0);
    syncTopBar();
  }

  for (const z of zones) z.update(dt);
  animateAmbientParticles(particles, dt);

  renderer.render(scene, camera);
}

animate();
