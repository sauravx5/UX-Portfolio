// zones.js — Spline Diorama Style: chunky pastel low-poly zone props

import * as THREE from 'three';
import { buildNocScreenTexture, buildFiberNetwork, createStormBurst } from './effects.js';

/* ─── Shared Helpers ────────────────────────────────────────── */
const WHITE     = 0xFFFFFF;
const CREAM     = 0xFAF8F0;
const PINK      = 0xFFADD6;
const SKY       = 0x82CCEE;
const YELLOW    = 0xFFE680;
const ORANGE    = 0xFFAA66;
const LAVENDER  = 0xCFC0FF;
const MINT      = 0x8AEEC0;
const CORAL     = 0xFF9999;
const WOOD      = 0xD4956A;
const LIME      = 0xA8E860;
const SLATE     = 0xB0C4D8;

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}
function box(w, h, d, color) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}
function cyl(rt, rb, h, segs, color) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat(color));
}
function sph(r, color) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(color));
}

/* ─── Zone 1: Planning District — Bright Construction Site ─── */
function buildZone1(scene) {
  const cx = -130, cz = 0;
  const group = new THREE.Group(); group.position.set(cx, 0, cz);

  /* --- Foundation pad (yellow-ish site) --- */
  const pad = box(50, 0.8, 50, YELLOW);
  pad.position.set(0, 0.4, 0); pad.receiveShadow = true; group.add(pad);

  /* --- Blueprint table (teal flat desk) --- */
  const desk = box(14, 1, 10, SKY);
  desk.position.set(-8, 2, 0); group.add(desk);
  const blueprint = box(12, 0.15, 8, 0xB8E0FF);
  blueprint.position.set(-8, 2.6, 0); group.add(blueprint);
  // Blueprint grid lines
  for (let g = -5; g <= 5; g += 2.5) {
    const hl = box(12, 0.1, 0.12, 0x5599CC);
    hl.position.set(-8, 2.7, g); group.add(hl);
    const vl = box(0.12, 0.1, 8, 0x5599CC);
    vl.position.set(-8 + g*1.2, 2.7, 0); group.add(vl);
  }

  /* --- Crane (bright orange) --- */
  const craneBase = box(3, 6, 3, ORANGE);
  craneBase.position.set(10, 3, -8); group.add(craneBase);
  const craneMast = box(1, 18, 1, ORANGE);
  craneMast.position.set(10, 12, -8); group.add(craneMast);
  const craneArm  = box(18, 1, 1, ORANGE);
  craneArm.position.set(2, 21, -8); group.add(craneArm);
  const craneHook = box(0.6, 4, 0.6, 0x888);
  craneHook.position.set(-5, 17, -8); group.add(craneHook);

  /* --- Scaffolding (white beams) --- */
  const sColors = [WHITE, CREAM];
  for (let i = 0; i < 4; i++) {
    const angle = (i/4)*Math.PI*2;
    const pole = cyl(0.3, 0.35, 14, 6, WHITE);
    pole.position.set(Math.cos(angle)*8, 7, Math.sin(angle)*8);
    group.add(pole);
  }
  for (let hy of [5, 10]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.25, 6, 18),
      mat(CREAM)
    );
    ring.position.set(0, hy, 0); ring.rotation.x = Math.PI/2;
    group.add(ring);
  }

  /* --- Construction materials (colored boxes) --- */
  [[PINK,3,0.8,3, -12,0.5,-5],[MINT,2.5,0.8,2.5, -14,0.5,3],[LAVENDER,4,0.8,3, -10,0.5,6]].forEach(([c,w,h,d,x,y,z])=>{
    const m = box(w,h,d,c); m.position.set(x,y,z); m.castShadow=true; group.add(m);
  });

  /* --- Terminal screens (chunky tablets) --- */
  const screens = [];
  [[-18,4,0],[-18,4,5],[-18,4,-5]].forEach(([sx,sy,sz])=>{
    const stand = cyl(0.3,0.3,3,6,0x555); stand.position.set(sx,1.5,sz); group.add(stand);
    const scrn  = box(3,2.5,0.4,SKY); scrn.position.set(sx,sy,sz); group.add(scrn);
    screens.push(scrn);
    // Screen face (lighter)
    const face = box(2.6,2,0.1,0xE0F4FF); face.position.set(sx,sy,sz-0.26); group.add(face);
  });

  /* --- "ZONE 1" sign --- */
  const sign = box(10,2,0.5,ORANGE); sign.position.set(0, 17, 12); group.add(sign);

  scene.add(group);

  let t=0;
  function update(dt) {
    t+=dt;
    screens.forEach((s,i)=>{ s.material.color.setHex(i%2===0 ? SKY : 0x60AACC); });
  }

  return {
    group, update,
    center: new THREE.Vector3(cx, 0, cz), radius: 50, interactRadius: 28, id: 'zone1',
  };
}

/* ─── Zone 2: Core Network Tower — Futuristic but Friendly ─── */
function buildZone2(scene) {
  const cx = 130, cz = 0;
  const group = new THREE.Group(); group.position.set(cx, 0, cz);

  /* --- Circular base platform --- */
  const base = new THREE.Mesh(new THREE.CylinderGeometry(14,16,1.2,16), mat(WHITE));
  base.position.set(0,0.6,0); base.receiveShadow=true; group.add(base);
  // ring detail
  const ring0 = new THREE.Mesh(new THREE.TorusGeometry(11,0.6,6,24), mat(SKY));
  ring0.position.set(0,1.3,0); ring0.rotation.x=Math.PI/2; group.add(ring0);

  /* --- Tower mast (chunky cylinder) --- */
  const mast = cyl(1.4,2,38,10, WHITE);
  mast.position.set(0,19.8,0); group.add(mast);

  /* --- Cross-arm levels --- */
  for (const [y, color] of [[12,SKY],[22,MINT],[32,LAVENDER]]) {
    const arm = box(18,1.2,1.2,color); arm.position.set(0,y,0); group.add(arm);
    // Endpoint spheres (antennae tips)
    for (const xs of [-10,10]) {
      const tip = sph(1.2, color); tip.position.set(xs,y,0); group.add(tip);
      // Little light box
      const lb = box(0.8,0.8,0.8,YELLOW); lb.position.set(xs,y+1.5,0); group.add(lb);
    }
  }

  /* --- Satellite dishes (4 directions, bright) --- */
  const dishes = [];
  const dishColors = [PINK, SKY, YELLOW, MINT];
  for (let i=0; i<4; i++) {
    const angle = (i/4)*Math.PI*2;
    const dg = new THREE.Group();
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(2.8,0.4,0.5,16,1,true), mat(dishColors[i]));
    dish.rotation.x = Math.PI/2.2; dg.add(dish);
    const feed = cyl(0.15,0.15,1.8,6,WHITE); feed.position.y=1.2; dg.add(feed);
    dg.position.set(Math.cos(angle)*6, 37, Math.sin(angle)*6);
    dg.rotation.y = angle;
    group.add(dg); dishes.push(dg);
  }

  /* --- Beacon top (round ball, blinking) --- */
  const beacon = sph(1.2, CORAL); beacon.position.set(0,42,0); group.add(beacon);
  const beaconLight = new THREE.PointLight(0xFF6666, 2, 30);
  beaconLight.position.set(cx,42,cz); scene.add(beaconLight);

  /* --- Small tech outbuildings --- */
  [[8,3,-10,WHITE,SKY],[-8,3,10,WHITE,MINT],[8,3,10,CREAM,LAVENDER]].forEach(([bx,bh,bz,bc,rc])=>{
    const b = box(8,bh*2,8,bc); b.position.set(bx,bh,bz); b.castShadow=true; group.add(b);
    const rf = box(8.4,0.8,8.4,rc); rf.position.set(bx,bh*2+0.4,bz); group.add(rf);
  });

  scene.add(group);

  // Fiber network
  const fiber = buildFiberNetwork(scene, new THREE.Vector3(cx, 0, cz));
  let xrayOn = false, t = 0;

  function update(dt) {
    t += dt;
    dishes.forEach((d,i) => { d.rotation.y += (0.2+i*0.05)*dt; });
    beaconLight.intensity = 1.5 + 1.5*Math.abs(Math.sin(t*2));
    beacon.material.color.setHex(Math.sin(t*2) > 0 ? CORAL : 0xFF4444);
    fiber.update(dt);
  }
  function toggleXray() { xrayOn = !xrayOn; fiber.setVisible(xrayOn); return xrayOn; }

  return {
    group, update, toggleXray,
    center: new THREE.Vector3(cx, 0, cz), radius: 42, interactRadius: 24, id: 'zone2',
  };
}

/* ─── Zone 3: Operations Center — Bright NOC Building ──────── */
function buildZone3(scene) {
  const cx = 0, cz = -140;
  const group = new THREE.Group(); group.position.set(cx, 0, cz);

  /* --- Main building --- */
  const body = box(44,22,32, WHITE);
  body.position.set(0,11,0); body.castShadow=true; body.receiveShadow=true; group.add(body);
  const roof = box(44.8,2,32.8, SKY); roof.position.set(0,23,0); group.add(roof);

  /* --- Colorful facade stripes --- */
  const stripeColors = [PINK,SKY,MINT,YELLOW,LAVENDER];
  for (let i=0;i<5;i++) {
    const stripe = box(0.6,20,30, stripeColors[i]);
    stripe.position.set(-20+i*10, 11, 16.2); group.add(stripe);
  }

  /* --- Main screen on facade (NOC) --- */
  const nocScreen = buildNocScreenTexture();
  // Override texture color for bright theme
  const screenMat = new THREE.MeshBasicMaterial({ map: nocScreen.tex });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(20,10), screenMat);
  screenMesh.position.set(0,13,16.3); group.add(screenMesh);

  /* --- Side info panels (colored rect) --- */
  for (const [sc,sx] of [[YELLOW,-11],[MINT,11]]) {
    const p = box(7,5.5,0.4,sc); p.position.set(sx,8.5,16.3); group.add(p);
  }

  /* --- Entry arch --- */
  const archL = box(1.5,9,1.5,WHITE); archL.position.set(-4, 4.5, 16.3); group.add(archL);
  const archR = box(1.5,9,1.5,WHITE); archR.position.set( 4, 4.5, 16.3); group.add(archR);
  const archT = box(10,1.5,1.5,SKY);  archT.position.set( 0, 9.2, 16.3); group.add(archT);

  /* --- Console (the interact point) --- */
  const console3d = box(6,1.8,3, SKY); console3d.position.set(0,1.8,19); group.add(console3d);
  const cscrn = box(4,3,0.3,WHITE); cscrn.position.set(0,3.8,18.5); cscrn.rotation.x=-0.2; group.add(cscrn);

  /* --- Rooftop dishes --- */
  for (const [dx,dz,dc] of [[-10,0,PINK],[10,0,ORANGE],[0,-6,LAVENDER]]) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(2.2,0.4,0.5,12,1,true), mat(dc));
    d.rotation.x=-Math.PI/3; d.position.set(dx,24.5,dz); group.add(d);
  }

  /* --- "NOC" signage --- */
  const sign = box(30,2.5,0.6,ORANGE); sign.position.set(0,24,16.4); group.add(sign);

  scene.add(group);

  let t=0;
  function update(dt) { t+=dt; nocScreen.update(dt); }

  return {
    group, update,
    center: new THREE.Vector3(cx,0,cz), radius: 52, interactRadius: 30, id: 'zone3',
    consolePos: new THREE.Vector3(cx,1.5,cz+19),
  };
}

/* ─── Zone 4: Consumer Front — Neighborhood + Store ────────── */
function buildZone4(scene) {
  const cx = 0, cz = 140;
  const group = new THREE.Group(); group.position.set(cx, 0, cz);

  // Pavement
  const pave = box(75,0.4,55, 0xEAF5EA);
  pave.position.set(0,0.2,0); group.add(pave);

  /* --- 5 Cute houses --- */
  const houseBodyColors = [WHITE, CREAM, 0xFFF5F5, 0xF5FFFA, 0xF5F5FF];
  const houseRoofColors = [PINK, ORANGE, SKY, MINT, LAVENDER];
  for (let i=-2;i<=2;i++) {
    const x=i*18;
    const body = box(12,8,10, houseBodyColors[i+2]);
    body.position.set(x,4,4); body.castShadow=true; group.add(body);
    // Pitched roof (cone as pyramid)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9,6,4), mat(houseRoofColors[i+2]));
    roof.position.set(x,11.5,4); roof.rotation.y=Math.PI/4; roof.castShadow=true; group.add(roof);
    // Door
    const door = box(2,3,0.2, WOOD); door.position.set(x,1.5,9.1); group.add(door);
    // Windows
    const wc = [SKY,YELLOW,WHITE][Math.abs(i)%3];
    for (const wx of [-3,3]) {
      const w = box(2.2,1.8,0.1,wc); w.position.set(x+wx,5,9.1); group.add(w);
    }
    // Garden path
    const path = box(2,0.15,6,CREAM); path.position.set(x,0.45,12); group.add(path);
  }

  /* --- Retail store (bigger, colorful) --- */
  const store = box(24,14,18, WHITE);
  store.position.set(0,7,-22); store.castShadow=true; group.add(store);
  const storeRoof = box(24.8,1.5,18.8, SKY); storeRoof.position.set(0,14.75,-22); group.add(storeRoof);
  const storefront = box(24,14,0.6, 0xF0FAFF); storefront.position.set(0,7,-13.2); group.add(storefront);
  // Shop sign
  const shopSign = box(20,3,0.8,ORANGE); shopSign.position.set(0,16,-14); group.add(shopSign);
  // Shop windows
  for (const sx of [-7,0,7]) {
    const sw = box(5,7,0.1,0xD0EEFE); sw.position.set(sx,6,-13.2); group.add(sw);
  }

  /* --- Network Status board (bright!) --- */
  const board = box(11,7,0.5,WHITE); board.position.set(-22,4.5,-14); group.add(board);
  const boardTop = box(11.6,1.2,0.6,MINT); boardTop.position.set(-22,8.5,-14); group.add(boardTop);
  const boardScreen = box(9,5.5,0.1,0xE0F8F0); boardScreen.position.set(-22,4.5,-13.75); group.add(boardScreen);

  /* --- Giant mobile phone prop (floating, very Spline) --- */
  const phone = box(2,3.6,0.4,WHITE); phone.position.set(18,2.5,-14); group.add(phone);
  const pScreen = box(1.7,3.0,0.1,SKY); pScreen.position.set(18,2.5,-13.79); group.add(pScreen);
  const pBtn = sph(0.2, 0x888); pBtn.position.set(18,0.7,-13.79); group.add(pBtn);
  // Phone stand
  const pStand = box(3,0.4,2,CREAM); pStand.position.set(18,0.4,-14); group.add(pStand);

  scene.add(group);

  let t=0, stormTick=null;
  function update(dt) {
    t+=dt;
    // Phone gentle float
    phone.position.y = 2.5 + Math.sin(t*1.5)*0.1;
    pScreen.position.y = 2.5 + Math.sin(t*1.5)*0.1;
    pBtn.position.y    = 0.7 + Math.sin(t*1.5)*0.1;
    if (stormTick) stormTick(dt);
  }
  function triggerStorm(s) { stormTick = createStormBurst(s, new THREE.Vector3(cx,2,cz)); }

  return {
    group, update, triggerStorm,
    center: new THREE.Vector3(cx,0,cz), radius: 58, interactRadius: 32, id: 'zone4',
  };
}

/* ─── Hall of Achievements — Central Plaza ──────────────────── */
function buildHall(scene) {
  const cx=0, cz=0;
  const group = new THREE.Group();

  /* --- Circular plaza (big, white) --- */
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(30,32,0.8,32), mat(WHITE));
  plaza.position.set(cx,0.4,cz); plaza.receiveShadow=true; group.add(plaza);

  // Plaza ring detail
  for (let r=22; r<=26; r+=4) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r,0.5,6,48), mat(LIME));
    ring.position.set(cx,0.9,cz); ring.rotation.x=Math.PI/2; group.add(ring);
  }

  /* --- Central monument (colorful stacked cylinders, Spline stacked toy style) --- */
  const stack = [
    [0, PINK,    6,   3, 1.5],
    [0, SKY,     4,   5, 3  ],
    [0, YELLOW,  2.5, 3, 8  ],
    [0, ORANGE,  1.5, 2, 11 ],
    [0, LAVENDER,0.8, 6, 13 ],
  ];
  for (const [, color, r, h, y] of stack) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r+0.2,h,16), mat(color));
    m.position.set(cx,y,cz); m.castShadow=true; group.add(m);
  }
  // Star on top
  const star = sph(1.5,YELLOW); star.position.set(cx,16,cz); group.add(star);
  const starLight = new THREE.PointLight(0xFFE080, 3, 20);
  starLight.position.set(cx,18,cz); group.add(starLight);

  /* --- 5 Pedestals (colorful cylinders) --- */
  const pedestals = [
    { label:'🏆', tag:'SPOTLIGHT AWARD',  title:'Innovation Award',
      body:'Recognized for pioneering the Telecom Design Studio — a unified self-serve network engineering platform that transformed manual, multi-tool workflows into a single-pane-of-glass experience.',
      angle:0, color:YELLOW },
    { label:'📋', tag:'CERTIFICATION', title:'SAFe 5 Practitioner',
      body:'Certified SAFe® 5 Practitioner — expertise in scaled agile frameworks for enterprise-grade product delivery and cross-functional team coordination.',
      angle:Math.PI*2/5, color:SKY },
    { label:'🎨', tag:'CERTIFICATION', title:'Certified UX Analyst (CXA)',
      body:'Certified User Experience Analyst (CXA) — deep human-centered design skills applied to complex enterprise telecom products.',
      angle:Math.PI*4/5, color:PINK },
    { label:'👤', tag:'ABOUT', title:'Saurav — Senior Product Manager',
      body:'Enterprise telecom product leader with expertise in GIS network design, GenAI operations tooling, self-serve platform architecture, and human-centered enterprise UX. Building the future of intelligent network infrastructure.',
      angle:Math.PI*6/5, color:MINT },
    { label:'📊', tag:'IMPACT', title:'Platform Scale & Reach',
      body:'Platforms serve 10,000+ network engineers. Products support millions of fiber lines, thousands of cell sites, and real-time monitoring of nationwide 5G deployments.',
      angle:Math.PI*8/5, color:LAVENDER },
  ];

  const pedObjs = [];
  const pedR = 20;
  for (const p of pedestals) {
    const px = cx + Math.cos(p.angle)*pedR;
    const pz = cz + Math.sin(p.angle)*pedR;

    // Pedestal base
    const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.6,3,12), mat(WHITE));
    pedBase.position.set(px,1.5,pz); group.add(pedBase);
    const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,0.5,12), mat(p.color));
    pedTop.position.set(px,3.25,pz); group.add(pedTop);

    // Floating icon box (colorful cube)
    const iconBox = box(2,2,2, p.color);
    iconBox.position.set(px,5.2,pz); group.add(iconBox);
    pedObjs.push({ mesh:iconBox, ...p, pos:new THREE.Vector3(px,2,pz) });

    // Pillar of light (thin beam)
    const beam = cyl(0.08,0.08,10,4, p.color);
    beam.material.transparent=true; beam.material.opacity=0.25;
    beam.position.set(px,9,pz); group.add(beam);

    // Point light
    const pl = new THREE.PointLight(p.color, 2, 8);
    pl.position.set(px,5,pz); group.add(pl);
  }

  /* --- Outer pillars --- */
  const pillarColors = [PINK,SKY,YELLOW,MINT,LAVENDER,CORAL,ORANGE,LIME,PINK,SKY,YELLOW,MINT];
  for (let i=0;i<12;i++) {
    const a=(i/12)*Math.PI*2;
    const pillar = cyl(0.5,0.6,7,8, pillarColors[i]);
    pillar.position.set(cx+Math.cos(a)*28, 3.5, cz+Math.sin(a)*28);
    pillar.castShadow=true; group.add(pillar);
    // Pillar cap
    const cap = sph(0.7, pillarColors[i]);
    cap.position.set(cx+Math.cos(a)*28, 7.5, cz+Math.sin(a)*28);
    group.add(cap);
  }

  scene.add(group);

  let t=0;
  function update(dt) {
    t+=dt;
    pedObjs.forEach((p,i)=>{
      p.mesh.position.y = 5.2 + Math.sin(t*1.4+i*1.2)*0.2;
      p.mesh.rotation.y = t*0.6;
    });
    starLight.intensity = 2+1.5*Math.sin(t*1.8);
  }

  return {
    group, update, pedObjs,
    center: new THREE.Vector3(cx,0,cz), radius: 38, interactRadius: 24, id: 'hall',
  };
}

/* ─── Zone Data ─────────────────────────────────────────────── */
export const ZONE_DATA = {
  zone1: {
    tag:'ZONE 1 — PLANNING DISTRICT', title:'Intelligent Cell Site Placement', icon:'🗺️',
    desc:'Transformed manual, swivel-chair network planning — Excel, Google Earth, and tribal knowledge — into a unified self-serve design studio. Engineers now design smarter, faster, and with real-time intelligence.',
    achievements:[
      {stat:'30',suffix:'%',label:'compression in network deployment cycles'},
      {stat:'10K+',suffix:'',label:'engineers on the self-serve platform'},
    ],
    tools:['GIS Engine','React Frontend','Node.js API','PostgreSQL','Network Algorithms'],
    iconBg:'#FFF0EC', hint:'Press [E] to enter Top-Down Planning View',
  },
  zone2: {
    tag:'ZONE 2 — CORE NETWORK', title:'GIS Visualization & Network Inventory', icon:'📡',
    desc:'Consolidated 6+ legacy network intelligence tools into a single unified GIS layer. Engineers now see fiber routes, neighbor sites, and live inventory in one canvas.',
    achievements:[
      {stat:'90',suffix:'%',label:'reduction in operational complexity'},
      {stat:'6+',suffix:'',label:'legacy systems replaced'},
    ],
    tools:['Mapbox GL','Three.js','Esri ArcGIS','REST APIs','WebSockets'],
    iconBg:'#E8F5FF', hint:'Press [X] to toggle X-Ray fiber view',
  },
  zone3: {
    tag:'ZONE 3 — OPERATIONS CENTER', title:'Airwave & GenAI Network Copilot', icon:'⚡',
    desc:'Built the AI-powered NOC copilot that instantly surfaces diagnostics, anomaly patterns, and resolution paths — cutting through thousands of real-time network alerts.',
    achievements:[
      {stat:'50',suffix:'%+',label:'reduction in manual diagnostic effort'},
      {stat:'20',suffix:'%',label:'improvement in operational efficiency'},
    ],
    tools:['Gemini AI','LangChain','Python','React','Kafka Streams'],
    iconBg:'#F0FFF4', hint:'Press [E] at console to run Copilot demo',
  },
  zone4: {
    tag:'ZONE 4 — CONSUMER FRONT', title:'Check Network Status & Retail Map', icon:'📱',
    desc:'Gave customers direct visibility into network health — building trust through transparency. Self-Serve First and Trust by Default drove every design decision.',
    achievements:[
      {stat:'40',suffix:'%',label:'reduction in customer resolution times'},
      {stat:'1M+',suffix:'',label:'customers with real-time network visibility'},
    ],
    tools:['React Native','Maps SDK','GraphQL','Customer APIs','Design System'],
    iconBg:'#FFF8E1', hint:'Press [E] to trigger weather event',
  },
  hall: {
    tag:'CENTRAL PLAZA', title:'Hall of Achievements', icon:'🏛️',
    desc:'The heart of the city — celebrating engineering milestones, professional certifications, and the human-centered design philosophy behind every product.',
    achievements:[], tools:[], iconBg:'#F3F0FF', hint:'Walk to a pedestal and press [E]',
  },
};

/* ─── Main Build ─────────────────────────────────────────────── */
export function buildZones(scene) {
  return [buildZone1(scene), buildZone2(scene), buildZone3(scene), buildZone4(scene), buildHall(scene)];
}
