// world.js — Spline Diorama Style: bright pastel city, chunky buildings, soft lighting

import * as THREE from 'three';

function randRange(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max)   { return Math.floor(randRange(min, max)); }

/* ── Color Palette (Spline diorama pastels) ──────────────────── */
const LIME      = 0x6EE86E;  // background
const LIME_MID  = 0x5AC85A;
const WHITE     = 0xFFFFFF;
const CREAM     = 0xFAF8F0;
const PINK      = 0xFFADD6;
const SKY       = 0x82CCEE;
const YELLOW    = 0xFFE680;
const ORANGE    = 0xFFAA66;
const LAVENDER  = 0xCFC0FF;
const MINT      = 0x8AEEC0;
const CORAL     = 0xFF9999;
const SAND      = 0xF2E8C8;
const WOOD      = 0xD4956A;
const SLATE     = 0xB0C4D8;

/* ── Ground — Lime Green Base ────────────────────────────────── */
function buildGround(scene) {
  // Main flat ground
  const geo = new THREE.PlaneGeometry(600, 600, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: LIME_MID });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Path (lighter lime strip along roads)
  const pathMat = new THREE.MeshLambertMaterial({ color: 0x7AEF7A });
  const buildPath = (w, l, x, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), pathMat);
    m.rotation.x = -Math.PI/2; m.position.set(x, 0.02, z);
    scene.add(m);
  };
  buildPath(14, 480, 0, 0);     // main avenue X
  buildPath(480, 14, 0, 0);     // main avenue Z
}

/* ── Sidewalk Tiles ──────────────────────────────────────────── */
function buildSidewalks(scene) {
  const tileMat = new THREE.MeshLambertMaterial({ color: 0xE8F8E8 });
  const positions = [
    [ 0,0, -20, 400],[ 0,0,  20, 400],  // along X road
    [-20,0,  0, 400],[ 20,0,  0, 400],  // along Z road
  ];
  for (const [dx,dy,dz,len] of positions) {
    // skip the actual positions, just build a subtle path edge
  }
}

/* ── Chunky Low-Poly Buildings ─────────────────────────────── */
function buildGenericCity(scene) {
  // Pastel building color palette (Spline diorama)
  const buildingColors = [
    WHITE, CREAM, 0xF9F3FF, 0xEFF8FF, 0xFFFBEF,
    0xFFF0F5, 0xF0FFF8, 0xF5F5FF,
  ];
  const roofColors   = [PINK, SKY, YELLOW, ORANGE, LAVENDER, MINT, CORAL, SAND];
  const windowColors = [SKY, YELLOW, PINK, 0xFFFFFF];

  // Building clusters around each zone
  const clusters = [
    { cx:-80, cz:-80, n:10 }, { cx:80,  cz:-80, n:9  },
    { cx:-80, cz: 80, n:9  }, { cx:80,  cz: 80, n:10 },
    { cx:-155,cz:  0, n:8  }, { cx:155, cz:  0, n:8  },
    { cx:  0, cz:-165,n:7  }, { cx:  0, cz: 165,n:7  },
    { cx:-160,cz:-160,n:6  }, { cx:160, cz:-160,n:6  },
    { cx:-160,cz: 160,n:6  }, { cx:160, cz: 160,n:6  },
  ];

  for (const clust of clusters) {
    for (let i = 0; i < clust.n; i++) {
      const w = randRange(7, 16);
      const d = randRange(7, 16);
      const h = randRange(8, 35);
      const x = clust.cx + randRange(-28, 28);
      const z = clust.cz + randRange(-28, 28);

      const bodyColor = buildingColors[randInt(0, buildingColors.length)];
      const roofColor = roofColors[randInt(0, roofColors.length)];

      // Main body
      const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
      const body    = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
      body.position.set(x, h/2, z);
      body.castShadow  = true;
      body.receiveShadow = true;
      scene.add(body);

      // Flat roof slab (colored)
      const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w+0.4, 0.8, d+0.4), roofMat);
      roof.position.set(x, h + 0.4, z);
      roof.castShadow = true;
      scene.add(roof);

      // Windows (2 rows)
      const wColor = windowColors[randInt(0, windowColors.length)];
      const wMat = new THREE.MeshBasicMaterial({ color: wColor, transparent: true, opacity: 0.85 });
      for (let wh = 4; wh < h - 3; wh += randRange(3, 4.5)) {
        for (let col = -1; col <= 1; col++) {
          const ww = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.12), wMat.clone());
          ww.position.set(x + col * 2.8, wh, z - d/2 - 0.06);
          scene.add(ww);
        }
      }

      // Rooftop water tank or AC unit (details)
      if (Math.random() > 0.6) {
        const detailColor = bodyColors => bodyColors[Math.floor(Math.random()*bodyColors.length)];
        const tankMat = new THREE.MeshLambertMaterial({ color: SLATE });
        const tank = new THREE.Mesh(
          Math.random() > 0.5
            ? new THREE.CylinderGeometry(0.8, 0.8, 1.5, 8)
            : new THREE.BoxGeometry(2, 1.2, 2),
          tankMat
        );
        tank.position.set(x + randRange(-w/3, w/3), h + 1.2, z + randRange(-d/3, d/3));
        scene.add(tank);
      }
    }
  }
}

/* ── Trees (chunky sphere clusters, Spline style) ─────────────── */
function buildTrees(scene) {
  const leafColors = [0x5CC85A, 0x72E880, 0x4AB848, 0x7FDD60, 0x3D9E3C];
  const trunkMat  = new THREE.MeshLambertMaterial({ color: WOOD });

  const spots = [
    [-42,-52],[-52,-40],[-40,52],[-52,42],
    [42,-52],[52,-40],[42,52],[52,42],
    [-78,-78],[78,-78],[-78,78],[78,78],
    [-100,0],[100,0],[0,-105],[0,105],
    [-25,-28],[25,-28],[-25,28],[25,28],
    [-57,-12],[-57, 12],[57,-12],[57, 12],
    [-12,-60],[ 12,-60],[-12,60],[ 12,60],
    [-65,-45],[-65,45],[65,-45],[65,45],
    [-35,-70],[35,-70],[-35,70],[35,70],
  ];

  for (const [tx, tz] of spots) {
    const x = tx + randRange(-4, 4);
    const z = tz + randRange(-4, 4);
    const sc = randRange(1, 1.6);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3*sc, 0.4*sc, 2.5*sc, 6), trunkMat);
    trunk.position.set(x, 1.2*sc, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Sphere cluster canopy (3 balls, Spline "round tree" style)
    const lColor = leafColors[randInt(0, leafColors.length)];
    const lMat   = new THREE.MeshLambertMaterial({ color: lColor });
    for (let b = 0; b < 3; b++) {
      const bsc = randRange(1.2, 2.0) * sc;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(bsc, 8, 6), lMat);
      ball.position.set(
        x + randRange(-0.8, 0.8)*sc,
        2.5*sc + b*0.8*sc + randRange(0, 0.5),
        z + randRange(-0.8, 0.8)*sc
      );
      ball.castShadow = true;
      scene.add(ball);
    }
  }
}

/* ── Street Furniture ────────────────────────────────────────── */
function buildStreetFurniture(scene) {
  const postMat  = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const lightMat = new THREE.MeshBasicMaterial({ color: YELLOW });

  const lampPos = [];
  for (let t = -180; t <= 180; t += 28) {
    lampPos.push([t, 0, -11]); lampPos.push([t, 0, 11]);
    lampPos.push([-11, 0, t]); lampPos.push([11, 0, t]);
  }

  lampPos.forEach(([lx, , lz], idx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7, 6), postMat);
    pole.position.set(lx, 3.5, lz);
    scene.add(pole);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), lightMat);
    head.position.set(lx, 7.3, lz);
    scene.add(head);

    // Only add point lights every 5th lamp to keep GPU happy
    if (idx % 5 === 0) {
      const pl = new THREE.PointLight(0xfff5cc, 1.2, 22);
      pl.position.set(lx, 7, lz);
      scene.add(pl);
    }
  });
}

/* ── Lighting — Spline "diffuse sunlight" ────────────────────── */
function buildLighting(scene) {
  // Bright ambient (Spline scenes are very evenly lit)
  const ambient = new THREE.AmbientLight(0xFFFFFF, 1.8);
  scene.add(ambient);

  // Main sun — slightly warm, casting soft shadows
  const sun = new THREE.DirectionalLight(0xFFFDE8, 1.5);
  sun.position.set(100, 180, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.width  = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near   = 1;
  sun.shadow.camera.far    = 600;
  sun.shadow.camera.left   = -250;
  sun.shadow.camera.right  =  250;
  sun.shadow.camera.top    =  250;
  sun.shadow.camera.bottom = -250;
  sun.shadow.bias          = -0.001;
  sun.shadow.radius        = 4;   // soft shadow blur
  scene.add(sun);

  // Soft fill light from opposite side
  const fill = new THREE.DirectionalLight(0xE8F4FF, 0.8);
  fill.position.set(-80, 100, -60);
  scene.add(fill);

  // Bounced light from green ground (gives Spline green tint to undersides)
  const ground = new THREE.HemisphereLight(0x8EE88E, 0xF0F0F0, 0.6);
  scene.add(ground);
}

/* ── Sky — Bright daylight (Spline vibe) ───────────────────── */
function buildSky(scene) {
  // Bright off-white sky (not dark — Spline scenes are bright!)
  scene.background = new THREE.Color(0x6EE86E);
  // Very light fog for depth without darkening
  scene.fog = new THREE.FogExp2(0x6EE86E, 0.0012);
}

/* ── Decorative Flowers / Bushes ─────────────────────────────── */
function buildDecorations(scene) {
  const flowerColors = [PINK, CORAL, YELLOW, 0xFF80AC, 0xFFCC44];
  const stemMat  = new THREE.MeshLambertMaterial({ color: 0x3A8C3A });

  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 170;
    const x = Math.cos(angle) * radius + randRange(-8, 8);
    const z = Math.sin(angle) * radius + randRange(-8, 8);

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.8, 5), stemMat);
    stem.position.set(x, 0.4, z);
    scene.add(stem);

    // Flower head
    const col  = flowerColors[randInt(0, flowerColors.length)];
    const fMat = new THREE.MeshLambertMaterial({ color: col });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), fMat);
    head.position.set(x, 0.9, z);
    scene.add(head);
  }
}

/* ── Main Export ──────────────────────────────────────────────── */
export function buildWorld(scene) {
  buildSky(scene);
  buildGround(scene);
  buildGenericCity(scene);
  buildTrees(scene);
  buildStreetFurniture(scene);
  buildDecorations(scene);
  buildLighting(scene);
  return { streetLights: [] };
}
