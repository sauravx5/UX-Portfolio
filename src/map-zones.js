// map-zones.js — Zone definitions with real-world coordinates + metadata

export const ZONES = [
  {
    id: 'zone1',
    name: 'Planning Zone',
    tag: 'iCSP — INTELLIGENT CELL SITE PLACEMENT',
    icon: '🗺️',
    coords: [-73.9875, 40.7580],  // Times Square area
    height: 140,
    desc: 'GIS-powered infrastructure planning tool for RF and transport engineering teams.',
    achievements: [
      { stat: 90, suffix: '%', label: 'Reduction in multi-system swivel-chair operations' },
      { stat: 30, suffix: '%', label: 'Faster cell site deployment cycles' },
    ],
    impact: [
      'Reduced multi-system swivel-chair operations by ~90%',
      'Compressed network planning from 5 weeks to hours',
      'Accelerated cell site deployment cycles by ~30%',
    ],
    tools: ['AI-powered site placement', 'Search ring candidate analysis', 'GIS heatmaps for coverage', 'Coverage simulation'],
  },
  {
    id: 'zone2',
    name: 'Infrastructure Zone',
    tag: 'NETWORK INVENTORY & TOPOLOGY',
    icon: '🏗️',
    coords: [-73.9712, 40.7614],  // Grand Central area
    height: 190,
    desc: 'Interactive geospatial inventory tools for US network infrastructure assets.',
    achievements: [
      { stat: 20, suffix: '%', label: 'Reduction in diagnostic coordination delays' },
      { stat: 100, suffix: '%', label: 'Visual access to equipment topology' },
    ],
    impact: [
      'Reduced diagnostic coordination delays by 20%',
      'Visual access to equipment topology',
      'Streamlined cross-team collaboration',
    ],
    tools: ['Equipment hierarchy view', 'Utilization patterns', 'Topology relationships', 'Network mapping'],
  },
  {
    id: 'zone3',
    name: 'Operations Zone',
    tag: 'AIRWAVE PERFORMANCE INTELLIGENCE',
    icon: '⚡',
    coords: [-73.9855, 40.7489],  // Penn Station area
    height: 170,
    desc: 'Unified AI-powered network monitoring platform replacing 10+ legacy tools.',
    achievements: [
      { stat: 10, suffix: 'K+', label: 'Daily anomalies reduced to 5 prioritized tasks' },
      { stat: 10, suffix: '+', label: 'Legacy tools replaced by one platform' },
    ],
    impact: [
      'Reduced 10,000+ daily anomalies to 5 prioritized tasks',
      'Shifted teams from reactive to proactive management',
      'Reduced average response latency significantly',
    ],
    tools: ['Live geospatial map', 'GenAI performance summaries', 'Real-time anomaly detection', 'Mobile alerting app'],
  },
  {
    id: 'zone4',
    name: 'Customer Experience Zone',
    tag: 'CHECK NETWORK STATUS — SELF-SERVICE',
    icon: '📱',
    coords: [-73.9800, 40.7549],  // Midtown center
    height: 100,
    desc: 'Redesigned Verizon\'s outage self-service experience.',
    achievements: [
      { stat: 40, suffix: '%', label: 'Reduction in outage resolution time' },
      { stat: 100, suffix: '%', label: 'Inbound support calls measurably reduced' },
    ],
    impact: [
      'Reduced outage resolution time by 40%',
      'Measurably reduced inbound support calls',
      'Simplified outage communication flows',
    ],
    tools: ['Coverage check', 'Service qualification', 'Outage status', 'Self-service tools'],
  },
];

// Map center + initial view
export const MAP_CONFIG = {
  center: [-73.9810, 40.7555],
  zoom: 14.5,
  pitch: 52,
  bearing: -20,
  style: 'https://tiles.openfreemap.org/styles/positron',
};
