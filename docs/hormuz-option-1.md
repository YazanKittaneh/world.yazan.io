# Option 1: Zoomed Globe with Custom Markers

## Overview
The easiest approach - use three-globe's existing layers with a tight camera zoom and detailed markers/labels for the strait.

## Pros
- Minimal code changes
- Uses existing infrastructure
- Consistent with other scenes
- Good performance

## Cons
- Limited detail (still just a globe view)
- No custom 3D geometry
- Markers are limited to points

## Implementation

### Story JSON Structure
```json
{
  "sceneTitle": "Strait of Hormuz - Detailed View",
  "narration": "The narrow waterway... 21 miles wide at its narrowest point...",
  "camera": {
    "lat": 26.5,
    "lng": 56.5,
    "distance": 120
  },
  "highlights": [
    { "iso": "IR", "color": "#c0392b" },
    { "iso": "OM", "color": "#2980b9" },
    { "iso": "AE", "color": "#2980b9" }
  ],
  "markers": [
    {
      "lat": 26.5,
      "lng": 56.4,
      "label": "Strait of Hormuz",
      "color": "#e74c3c"
    },
    {
      "lat": 26.6,
      "lng": 56.3,
      "label": "Iran Coast",
      "color": "#c0392b"
    },
    {
      "lat": 25.2,
      "lng": 56.4,
      "label": "Oman Coast",
      "color": "#2980b9"
    }
  ],
  "arcs": [
    {
      "from": "SA",
      "to": "AE",
      "waypoints": ["OM"],
      "color": "#27ae60",
      "thickness": 2,
      "label": "Oil tanker route"
    }
  ]
}
```

### Visual Elements
- **Camera**: Positioned at lat 26.5°, lng 56.5° (center of strait), distance 120 (closer than normal ~260)
- **Highlights**: Iran, Oman, UAE in different colors to distinguish sides
- **Markers**: Point labels for key locations
- **Arcs**: Thick lines showing oil routes

### When to Use
- When you want quick implementation
- When geographic context matters (seeing surrounding countries)
- When maintaining consistency with other globe scenes

### Notes
The `markers` type exists in the schema but may not be fully rendered yet - may need to implement marker display in `GlobeSceneCanvas.vue`.
