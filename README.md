# Saurav's Network Command Center 🌐

An interactive, 3D WebGL Command Center showcasing specialized enterprise telecom engineering tools and AI operations platforms. Built from the ground up for the browser, blending raw web technologies with geospatial rendering and custom 3D models.

![Landing Page](./landing-preview.png)
*(Self Note: add an image here)*

## 🚀 Live Experience
**[Open the Command Center](https://sauravx5.github.io/UX-Portfolio/)** *(if hosted on GitHub pages)*

## ✨ Architecture & Tech Stack
The project was entirely rebuilt transitioning from a standard 3D scene to a real-world geographic map overlay containing custom 3D markers.

### Core Technologies
- **Vanilla HTML/JS/CSS** (No heavy framing frameworks, for pure performance and rapid loading)
- **MapLibre GL JS** - Open-source vector tile map renderer, configured with highly minimal OpenFreeMap tiles.
- **Three.js** - Driving the 3D WebGL overlay via a Custom Layer inside MapLibre.
- **Shadcn Design Language** - A custom CSS system directly translating the popular shadcn/ui aesthetic (Zinc, pure black, muted text) into a completely vanilla implementation.

## 🏗️ Structure & File Overview

```text
/
├── index.html          # Landing page (B&W shadcn terminal style)
├── map.html            # MapLibre + Three.js main canvas
├── style.css           # Custom vanilla CSS design system (shadcn zinc theme)
├── src/
│   ├── map-main.js     # Map config, Three.js custom layer, rendering loop
│   ├── map-panel.js    # Slide-out shadcn cards handling interactivity
│   └── map-zones.js    # Real-world coordinate locations, data, metrics
└── .gitignore 
```

## 🌍 Key Project Features

1. **Custom 3D Georeferenced Towers:** Built entirely in Three.js and projected onto MapLibre Mercator Coordinates. Features dark zinc-950 bodies with glowing, pulsing white emissive caps (`MeshStandardMaterial`).
2. **Interactive Map Navigation:** Custom `flyTo` camera movements triggered by both map interactions and the external legend component.
3. **Animated Data Metrics:** Smooth Bezier-eased number counters that roll up to highlight key network metrics (e.g., *90% Complexity Reduced*, *50%+ Effort Saved*).
4. **Shadcn Vanilla Implementation:** Complete replication of the ubiquitous shadcn/ui React components (buttons, input pills, slide-over panels, badges) using nothing but scoped `style.css` vanilla classes.
5. **Real-world Projection:** Mapped onto midtown Manhattan serving as a symbolic "Command Center" grid.

## 🛠️ Local Setup
To run this locally, you just need a local static server to resolve ES Modules correctly.

1. Clone repo:
   ```bash
   git clone https://github.com/sauravx5/UX-Portfolio.git
   cd UX-Portfolio
   ```
2. Serve locally (using Node `serve` or Python):
   ```bash
   npx serve .
   # or
   python -m http.server
   ```
3. Open `http://localhost:3000` (or the respective port) in your browser.

## 🎨 Theme & Design Inspiration
The visual design mirrors high-level enterprise and security operations centers:
- **Palette**: Dark (`#09090b`), Pure White text (`#fafafa`), with slight pulsing greens for "System Online" diagnostics.
- **Typography**: Inter (UI elements) and JetBrains Mono (Terminal data/measurements).
- **Layout**: Floating card interfaces with high-blur backdrops.
