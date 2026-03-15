// map-main.js — MapLibre GL JS + Three.js custom layer for 3D zone towers

import * as THREE from 'three';
import { ZONES, MAP_CONFIG } from './map-zones.js';
import { openPanel, closePanel } from './map-panel.js';

/* ── Initialize MapLibre ──────────────────────────────────────── */
const map = new maplibregl.Map({
  container: 'map',
  style: MAP_CONFIG.style,
  center: MAP_CONFIG.center,
  zoom: MAP_CONFIG.zoom,
  pitch: MAP_CONFIG.pitch,
  bearing: MAP_CONFIG.bearing,
  antialias: true,
});

/* ── Wait for map to load, then add 3D layer + markers ─────────── */
map.on('load', () => {
  addZoneMarkers();
  addThreejsLayer();
  setupLegend();
});

/* ── 3D Custom Layer (Three.js towers) ─────────────────────────── */
let threeScene, threeCamera, threeRenderer;
let towerMeshes = []; // { mesh, zone, coords }
let clock = new THREE.Clock();

function getMercatorTransform(lngLat, altitudeM = 0) {
  const mc = maplibregl.MercatorCoordinate.fromLngLat(lngLat, altitudeM);
  return {
    x: mc.x, y: mc.y, z: mc.z,
    scale: mc.meterInMercatorCoordinateUnits(),
  };
}

const threejsLayer = {
  id: 'three-zone-towers',
  type: 'custom',
  renderingMode: '3d',

  onAdd(map, gl) {
    threeScene  = new THREE.Scene();
    threeCamera = new THREE.Camera();

    // Lighting — clean white directional (shadcn vibe)
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    threeScene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(0.5, 1, 0.8).normalize();
    threeScene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-0.5, 0.8, -0.5).normalize();
    threeScene.add(fill);

    // Create a 3D tower for each zone
    ZONES.forEach((zone, idx) => {
      const tf = getMercatorTransform(zone.coords, 0);
      const heightM = zone.height;
      const scl = tf.scale;

      // Tower group
      const group = new THREE.Group();

      // Main tower body — sleek dark cylinder
      const bodyGeo = new THREE.CylinderGeometry(
        scl * 18,    // top radius (18m)
        scl * 22,    // bottom radius (22m)
        scl * heightM,
        16
      );
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,          // zinc-950 (near black)
        roughness: 0.25,
        metalness: 0.8,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = scl * heightM / 2;
      group.add(body);

      // Glowing cap ring (white disk on top)
      const capGeo = new THREE.CylinderGeometry(scl*20, scl*20, scl*3, 24);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa, roughness: 0.1, metalness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.2,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = scl * (heightM + 1.5);
      group.add(cap);

      // Base platform ring
      const ringGeo = new THREE.CylinderGeometry(scl*30, scl*30, scl*2, 32, 1, true);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x27272a, roughness: 0.4, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = scl;
      group.add(ring);

      // Position the group at the geocoordinate
      group.position.set(tf.x, tf.y, tf.z);
      group.scale.set(1, 1, -1); // flip Z for maplibre coords

      threeScene.add(group);
      towerMeshes.push({ group, zone, cap, body, idx });
    });

    // Three.js renderer shares MapLibre's canvas
    threeRenderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    threeRenderer.autoClear = false;
    threeRenderer.shadowMap.enabled = false;
  },

  render(gl, args) {
    const dt = clock.getDelta();

    // Animate tower caps — subtle pulsing emissive
    towerMeshes.forEach(({ cap, idx }) => {
      const t = clock.elapsedTime;
      cap.material.emissiveIntensity = 0.15 + 0.15 * Math.sin(t * 1.5 + idx * 1.2);
    });

    // Build the camera matrix from MapLibre
    const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);

    // Apply world transform
    const l = new THREE.Matrix4().makeTranslation(0, 0, 0);
    threeCamera.projectionMatrix = m.multiply(l);

    threeRenderer.resetState();
    threeRenderer.render(threeScene, threeCamera);
    map.triggerRepaint();
  },
};

function addThreejsLayer() {
  map.addLayer(threejsLayer);
}

/* ── MapLibre HTML Markers (clickable labels) ──────────────────── */
const activeMarkers = [];

function addZoneMarkers() {
  ZONES.forEach((zone, idx) => {
    // Create custom HTML element
    const el = document.createElement('div');
    el.className = 'zone-marker-label';
    el.innerHTML = `
      <span>${zone.icon}</span>
      <span>${zone.name}</span>
      <span class="zm-num">${String(idx + 1).padStart(2, '0')}</span>
    `;
    el.title = zone.tag;

    el.addEventListener('click', () => {
      flyToZone(zone);
      openPanel(zone);
      setActiveLegend(zone.id);
    });

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(zone.coords)
      .addTo(map);

    activeMarkers.push(marker);
  });
}

/* ── Fly to zone on click ───────────────────────────────────────── */
function flyToZone(zone) {
  map.flyTo({
    center: zone.coords,
    zoom: 15.5,
    pitch: 55,
    bearing: Math.random() * 30 - 15,
    duration: 1200,
    essential: true,
  });
}

/* ── Legend click → fly to zone ────────────────────────────────── */
function setupLegend() {
  document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const zoneId = item.dataset.zone;
      const zone = ZONES.find(z => z.id === zoneId);
      if (zone) {
        flyToZone(zone);
        openPanel(zone);
        setActiveLegend(zoneId);
      }
    });
  });
}

function setActiveLegend(zoneId) {
  document.querySelectorAll('.legend-item').forEach(item => {
    item.querySelector('.legend-dot').classList.toggle('active', item.dataset.zone === zoneId);
  });
}

/* ── Close panel button ─────────────────────────────────────────── */
document.getElementById('panel-close').addEventListener('click', () => {
  closePanel();
  // Reset legend
  document.querySelectorAll('.legend-dot').forEach(d => d.classList.remove('active'));
});

/* ── Cinematic intro: fly in from high altitude ─────────────────── */
map.on('load', () => {
  // Start at a higher zoom out, then fly in
  map.jumpTo({ center: MAP_CONFIG.center, zoom: 12, pitch: 30 });
  setTimeout(() => {
    map.flyTo({
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      duration: 2400,
      essential: true,
    });
  }, 300);
});
