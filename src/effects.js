// effects.js — City particles, NOC screen texture, fiber network, storm burst

import * as THREE from 'three';

/* ── Bloom Composer — disabled for bright diorama theme ───── */
// No bloom needed — Spline style is bright and flat-lit
export function buildComposer(renderer, scene, camera) {
  return null; // use plain renderer
}

/* ── Ambient Floating Particles — bright pastels ────────────── */
export function buildCityParticles(scene) {
  const N = 600;
  const positions = new Float32Array(N * 3);
  const colors    = new Float32Array(N * 3);

  // Bright pastel palette for daylight Spline look
  const palette = [
    [1, 0.68, 0.84],   // pink
    [0.51, 0.76, 0.93],// sky blue
    [1, 0.9, 0.5],     // yellow
    [0.54, 0.91, 0.75],// mint
    [0.81, 0.75, 1],   // lavender
    [1, 0.67, 0.4],    // orange
  ];

  for (let i = 0; i < N; i++) {
    positions[i*3]   = (Math.random()-0.5) * 400;
    positions[i*3+1] = Math.random() * 40 + 1;
    positions[i*3+2] = (Math.random()-0.5) * 400;
    const c = palette[Math.floor(Math.random()*palette.length)];
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.55, vertexColors: true, transparent: true, opacity: 0.7,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}

/* ── Storm / Confetti Burst (colorful, Spline feel) ──────────── */
export function createStormBurst(scene, center) {
  const N = 250;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const vel = [];
  const palette = [
    [1, 0.68, 0.84],[0.51, 0.76, 0.93],[1, 0.9, 0.5],
    [0.54, 0.91, 0.75],[0.81, 0.75, 1],[1, 0.67, 0.4],
  ];
  for (let i = 0; i < N; i++) {
    pos[i*3]   = center.x; pos[i*3+1] = center.y+1; pos[i*3+2] = center.z;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 2;
    vel.push({ x: Math.cos(angle)*speed, y: 1.5+Math.random()*3, z: Math.sin(angle)*speed });
    const c = palette[Math.floor(Math.random()*palette.length)];
    col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 1.0 });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  let life = 0, removed = false;
  function tick(dt) {
    if (removed) return;
    life += dt;
    const posAttr = pts.geometry.getAttribute('position');
    for (let i = 0; i < N; i++) {
      posAttr.array[i*3]   += vel[i].x * dt;
      posAttr.array[i*3+1] += vel[i].y * dt;
      posAttr.array[i*3+2] += vel[i].z * dt;
      vel[i].y -= 5 * dt;
    }
    posAttr.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - life * 0.6);
    if (life > 2.2) { scene.remove(pts); removed = true; }
  }
  return tick;
}

/* ── Animated NOC Screen Texture ─────────────────────────────── */
export function buildNocScreenTexture() {
  const cv  = document.createElement('canvas'); cv.width = 256; cv.height = 128;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  tex.userData.cv = cv; tex.userData.ctx = ctx;
  tex.userData.t  = 0;

  function update(dt) {
    tex.userData.t += dt;
    const t = tex.userData.t;
    ctx.fillStyle = '#020a14';
    ctx.fillRect(0,0,256,128);

    // Scrolling graph lines
    const lineColors = ['#00f5ff','#00d4aa','#ffb347','#ff4757'];
    lineColors.forEach((c, li) => {
      ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8;
      ctx.beginPath();
      for (let x=0; x<256; x++) {
        const y = 64 + li*14 - 24
          + Math.sin((x/256)*Math.PI*6 + t*(0.8+li*0.4)) * 14
          + Math.sin((x/256)*Math.PI*12 + t*1.2) * 4;
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Status text
    ctx.fillStyle = '#00f5ff'; ctx.font = '8px monospace';
    ctx.fillText('NET OPS CENTER — LIVE', 8, 12);
    ctx.fillStyle = '#00d4aa';
    ctx.fillText(`UPTIME: ${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`, 8, 122);
    ctx.fillStyle = '#2ed573';
    ctx.fillText('● ALL SYSTEMS NOMINAL', 160, 122);

    tex.needsUpdate = true;
  }
  return { tex, update };
}

/* ── Holographic Grid Plane (Zone 1) ─────────────────────────── */
export function buildHoloGrid(scene, center) {
  const group = new THREE.Group();
  group.position.copy(center);

  const size = 60;
  const divs = 10;
  const step = size / divs;

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00f5ff, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i <= divs; i++) {
    const x = -size/2 + i*step;
    const geoX = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, -size/2), new THREE.Vector3(x, 0, size/2)
    ]);
    const geoZ = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-size/2, 0, x), new THREE.Vector3(size/2, 0, x)
    ]);
    group.add(new THREE.Line(geoX, lineMat.clone()));
    group.add(new THREE.Line(geoZ, lineMat.clone()));
  }

  // Pulsing horizontal plane
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff, transparent: true, opacity: 0.04,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), planeMat);
  plane.rotation.x = -Math.PI/2; plane.position.y = 0.05;
  group.add(plane);

  scene.add(group);

  let t = 0;
  function update(dt) {
    t += dt;
    planeMat.opacity = 0.03 + 0.03*Math.sin(t*2);
    group.position.y = 0.02 + 0.08*Math.sin(t*1.2);
  }
  return { group, update };
}

/* ── Fiber Network Lines (X-Ray Mode) ────────────────────────── */
export function buildFiberNetwork(scene, zoneCenter) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: 0x00f5ff, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending,
  });

  // Spoke lines from tower to surrounding nodes
  const nodes = [
    [-80,-30],[-60, 60],[80,-50],[70, 40],[-40, 80],
    [100, 10],[-100, 20],[0,-80],[0, 100],[60,-70],
  ];
  for (const [nx, nz] of nodes) {
    const pts = [
      new THREE.Vector3(zoneCenter.x, 10, zoneCenter.z),
      new THREE.Vector3(zoneCenter.x + nx, 1, zoneCenter.z + nz),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, mat.clone());
    group.add(line);

    // Node circle
    const nodeGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0x00d4aa, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(zoneCenter.x + nx, 1.5, zoneCenter.z + nz);
    group.add(node);
  }

  scene.add(group);

  let visible = false;
  let t = 0;

  function setVisible(v) {
    visible = v;
  }

  function update(dt) {
    t += dt;
    const target = visible ? 0.75 : 0;
    group.children.forEach(c => {
      if (c.material) {
        c.material.opacity += (target - c.material.opacity) * 4 * dt;
      }
    });
  }

  return { group, setVisible, update };
}

/* ── Animate floating tick (updates per frame) ───────────────── */
export function animateAmbientParticles(pts, dt) {
  if (!pts) return;
  const pos = pts.geometry.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    pos.array[i*3+1] += 0.02 + 0.01 * Math.sin(i + Date.now()*0.001);
    if (pos.array[i*3+1] > 55) pos.array[i*3+1] = 1;
  }
  pos.needsUpdate = true;
}
