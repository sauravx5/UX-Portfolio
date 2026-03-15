// map-zones.js — Zone definitions with real-world coordinates + metadata

// All zones placed in Midtown Manhattan as a symbolic "city"
// Each zone is a few blocks apart so they're visible at zoom 14
export const ZONES = [
  {
    id: 'zone1',
    name: 'Planning District',
    tag: 'ZONE 01 — CELL SITE PLANNING',
    icon: '🗺️',
    color: '#18181b',      // zinc-900 (dark marker)
    accentBg: '#f4f4f5',   // zinc-100
    coords: [-73.9875, 40.7580],  // Times Square area
    height: 120,           // 3D tower height in meters
    desc: 'Transformed manual, swivel-chair network planning into a unified self-serve design studio. Engineers design smarter, faster, with real-time intelligence.',
    achievements: [
      { stat: 30, suffix: '%', label: 'Faster deployment cycles' },
      { stat: 10, suffix: 'K+', label: 'Engineers on platform' },
    ],
    tools: ['GIS Engine', 'React', 'Node.js', 'PostgreSQL', 'Spatial Algorithms'],
  },
  {
    id: 'zone2',
    name: 'Core Network Tower',
    tag: 'ZONE 02 — GIS & INVENTORY',
    icon: '📡',
    color: '#18181b',
    accentBg: '#f4f4f5',
    coords: [-73.9712, 40.7614],  // Grand Central area
    height: 200,
    desc: 'Consolidated 6+ legacy network intelligence tools into a single unified GIS layer. Fiber routes, neighbor sites, and live inventory in one canvas.',
    achievements: [
      { stat: 90, suffix: '%', label: 'Reduction in tool complexity' },
      { stat: 6, suffix: '+', label: 'Legacy systems replaced' },
    ],
    tools: ['Mapbox GL', 'Three.js', 'Esri ArcGIS', 'REST APIs', 'WebSockets'],
  },
  {
    id: 'zone3',
    name: 'Operations Center',
    tag: 'ZONE 03 — GENAI NOC COPILOT',
    icon: '⚡',
    color: '#18181b',
    accentBg: '#f4f4f5',
    coords: [-73.9855, 40.7489],  // Penn Station area
    height: 160,
    desc: 'Built the AI-powered NOC copilot that instantly surfaces diagnostics, anomaly patterns, and resolution paths through thousands of real-time network alerts.',
    achievements: [
      { stat: 50, suffix: '%+', label: 'Manual diagnostic effort reduced' },
      { stat: 20, suffix: '%', label: 'Operational efficiency gained' },
    ],
    tools: ['Gemini AI', 'LangChain', 'Python', 'React', 'Kafka'],
  },
  {
    id: 'zone4',
    name: 'Consumer Front',
    tag: 'ZONE 04 — NETWORK STATUS',
    icon: '📱',
    color: '#18181b',
    accentBg: '#f4f4f5',
    coords: [-73.9800, 40.7549],  // Midtown center
    height: 90,
    desc: 'Gave customers direct visibility into network health and outage status. Self-Serve First and Trust by Default became the design principles of the platform.',
    achievements: [
      { stat: 40, suffix: '%', label: 'Customer resolution time reduced' },
      { stat: 1, suffix: 'M+', label: 'Customers with live visibility' },
    ],
    tools: ['React Native', 'Maps SDK', 'GraphQL', 'Design System'],
  },
  {
    id: 'hall',
    name: 'Hall of Achievements',
    tag: 'CENTRAL — AWARDS & CERTS',
    icon: '🏛️',
    color: '#18181b',
    accentBg: '#f4f4f5',
    coords: [-73.9780, 40.7520],  // Center
    height: 260,
    desc: 'The heart of the command center — celebrating the Innovation Award, professional certifications, and the engineering philosophy behind every platform.',
    achievements: [
      { stat: 11, suffix: ' yrs', label: 'Enterprise telecom experience' },
      { stat: 3, suffix: '', label: 'Professional certifications' },
    ],
    tools: ['SAFe 5', 'CXA UX Analyst', 'Innovation Award'],
    pedestals: [
      { label: '🏆', tag: 'SPOTLIGHT AWARD', title: 'Innovation Award 2023', body: 'Recognized for pioneering the Telecom Design Studio — a unified self-serve network engineering platform that transformed manual, multi-tool workflows into a single-pane-of-glass experience.' },
      { label: '📋', tag: 'CERTIFICATION', title: 'SAFe® 5 Practitioner', body: 'Certified SAFe® 5 Practitioner — expertise in scaled agile frameworks for enterprise-grade product delivery and cross-functional team coordination.' },
      { label: '🎨', tag: 'CERTIFICATION', title: 'Certified UX Analyst (CXA)', body: 'Certified User Experience Analyst (CXA) — deep human-centered design skills applied to complex enterprise telecom products.' },
    ],
  },
];

// Map center + initial view
export const MAP_CONFIG = {
  center: [-73.9800, 40.7549],
  zoom: 14.5,
  pitch: 52,
  bearing: -20,
  style: 'https://tiles.openfreemap.org/styles/positron',
};
