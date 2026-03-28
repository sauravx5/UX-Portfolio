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

    // ── Shared materials ────────────────────────────────────────────────
    const matDark   = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.28, metalness: 0.75 });
    const matMid    = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.35, metalness: 0.6 });
    const matLight  = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.2,  metalness: 0.4 });
    const matGlow   = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.1,  metalness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.25 });

    // ── Model builders (all heights expressed in metres; scl converts to Mercator) ─

    /** Zone 1 — Modern skyscraper (Planning) */
    function buildSkyscraper(scl) {
      const g = new THREE.Group();
      // Main shaft
      g.add(mesh(new THREE.BoxGeometry(scl*36, scl*100, scl*36), matDark, 0, scl*50, 0));
      // Set-back upper section
      g.add(mesh(new THREE.BoxGeometry(scl*22, scl*28, scl*22), matMid, 0, scl*114, 0));
      // Floor bands — 8 horizontal strips
      for (let i = 0; i < 8; i++) {
        g.add(mesh(new THREE.BoxGeometry(scl*38, scl*2.5, scl*38), matGlow, 0, scl*(10 + i*12), 0));
      }
      // Antenna spire
      g.add(mesh(new THREE.CylinderGeometry(scl*1.5, scl*2.5, scl*24, 8), matLight, 0, scl*140, 0));
      const beacon = mesh(new THREE.SphereGeometry(scl*4, 12, 8), matGlow, 0, scl*153, 0);
      g.add(beacon);
      return { g, beacon };
    }

    /** Zone 2 — Lattice cell tower (Infrastructure) */
    function buildCellTower(scl) {
      const g = new THREE.Group();
      // Central mast
      g.add(mesh(new THREE.CylinderGeometry(scl*2.5, scl*5, scl*118, 8), matDark, 0, scl*59, 0));
      // Cross-arms at 4 levels (tapered width)
      [22, 46, 70, 92].forEach((h, i) => {
        const w = scl * (56 - i * 10);
        g.add(mesh(new THREE.BoxGeometry(w, scl*3.5, scl*7), matMid, 0, scl*h, 0));
        // Vertical end posts
        [-1, 1].forEach(side => {
          g.add(mesh(new THREE.BoxGeometry(scl*3.5, scl*12, scl*3.5), matMid, side*(w/2), scl*(h+6), 0));
        });
      });
      // Dish / antenna platform at top
      g.add(mesh(new THREE.CylinderGeometry(scl*18, scl*10, scl*6, 16), matLight, 0, scl*122, 0));
      // Diagonal bracing (2 thin boxes, rotated)
      [-0.35, 0.35].forEach(angle => {
        const br = mesh(new THREE.BoxGeometry(scl*3, scl*65, scl*3), matMid, scl*18, scl*55, 0);
        br.rotation.z = angle;
        g.add(br);
      });
      const beacon = mesh(new THREE.SphereGeometry(scl*4, 12, 8), matGlow, 0, scl*130, 0);
      g.add(beacon);
      return { g, beacon };
    }

    /** Zone 3 — Corporate office building (Operations) */
    function buildOffice(scl) {
      const g = new THREE.Group();
      // Wide podium base
      g.add(mesh(new THREE.BoxGeometry(scl*76, scl*28, scl*56), matDark, 0, scl*14, 0));
      // Main tower
      g.add(mesh(new THREE.BoxGeometry(scl*42, scl*90, scl*42), matMid, scl*8, scl*73, 0));
      // Side wing
      g.add(mesh(new THREE.BoxGeometry(scl*22, scl*60, scl*32), matDark, -scl*28, scl*58, 0));
      // Horizontal floor lines on tower
      for (let i = 0; i < 6; i++) {
        g.add(mesh(new THREE.BoxGeometry(scl*44, scl*2.5, scl*44), matGlow, scl*8, scl*(28 + i*14), 0));
      }
      // Rooftop equipment box
      g.add(mesh(new THREE.BoxGeometry(scl*16, scl*12, scl*16), matMid, scl*8, scl*124, 0));
      const beacon = mesh(new THREE.SphereGeometry(scl*4, 12, 8), matGlow, scl*8, scl*134, 0);
      g.add(beacon);
      return { g, beacon };
    }

    /** Zone 4 — Residential home (Customer Experience) */
    function buildHome(scl) {
      const g = new THREE.Group();
      // House body
      g.add(mesh(new THREE.BoxGeometry(scl*62, scl*52, scl*52), matDark, 0, scl*26, 0));
      // Gabled roof (4-sided cone / pyramid)
      const roofGeo = new THREE.ConeGeometry(scl*50, scl*36, 4);
      const roofMesh = mesh(roofGeo, matMid, 0, scl*88, 0);
      roofMesh.rotation.y = Math.PI / 4; // align ridge to box
      g.add(roofMesh);
      // Chimney
      g.add(mesh(new THREE.BoxGeometry(scl*9, scl*28, scl*9), matMid, scl*18, scl*95, scl*8));
      // Front door
      g.add(mesh(new THREE.BoxGeometry(scl*13, scl*22, scl*2.5), matGlow, 0, scl*13, scl*27));
      // Windows (left & right)
      [-scl*19, scl*19].forEach(x => {
        g.add(mesh(new THREE.BoxGeometry(scl*13, scl*12, scl*2.5), matGlow, x, scl*32, scl*27));
      });
      // Garage extension
      g.add(mesh(new THREE.BoxGeometry(scl*28, scl*30, scl*32), matMid, -scl*38, scl*15, scl*10));
      const beacon = mesh(new THREE.SphereGeometry(scl*4, 12, 8), matGlow, scl*18, scl*124, scl*8);
      g.add(beacon);
      return { g, beacon };
    }

    // ── Tiny helper: create + position a mesh ──────────────────────
    function mesh(geo, mat, x, y, z) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    // ── Build model per zone and place on map ──────────────────────
    const builders = [buildSkyscraper, buildCellTower, buildOffice, buildHome];

    ZONES.forEach((zone, idx) => {
      const tf  = getMercatorTransform(zone.coords, 0);
      const scl = tf.scale;

      const { g: group, beacon } = builders[idx](scl);

      // Base footprint ring
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, side: THREE.DoubleSide });
      group.add(mesh(new THREE.CylinderGeometry(scl*44, scl*44, scl*2, 32, 1, true), ringMat, 0, scl*1, 0));

      // Geo-position
      group.position.set(tf.x, tf.y, tf.z);
      group.scale.set(1, 1, -1); // flip Z for MapLibre coords

      threeScene.add(group);
      towerMeshes.push({ group, zone, cap: beacon, idx });
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
