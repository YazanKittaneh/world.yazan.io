# Globe Storytelling MCP

Model Context Protocol (MCP) server for controlling the globe visualization at `/globe`.

## Architecture

```
Claude (MCP client)
  └─ tell_story tool call
       └─ mcp/dist/index.js (stdio MCP server)
            └─ writes public/story/current.json
                 └─ GlobeSceneCanvas.vue polls every 3s
                      └─ renders scenes reactively
```

## Tool: `tell_story`

Load a visual story onto the globe. Each scene displays narration alongside animated globe effects.

### Schema

```ts
{
  title?: string
  scenes: Array<{
    narration: string                    // Required: text shown on screen
    sceneTitle?: string                  // Optional: heading above narration
    duration?: number                    // Optional: ms before auto-advancing (0 = manual)
    highlights?: Array<{                 // Highlight countries by ISO code
      iso: string                        // ISO 3166-1 alpha-2 (e.g., "US", "FR", "HT")
      color: string                      // CSS color string
    }>
    arcs?: Array<{                      // Animated lines between countries
      from: string                       // ISO 3166-1 alpha-2 origin
      to: string                         // ISO 3166-1 alpha-2 destination
      color: string                      // CSS color string
      // Visual styling
      thickness?: number                 // Line width (0.1 to 5.0, default: 1.0)
      speed?: number                     // Animation duration in ms (default: 2000)
      label?: string                     // Label for the route
      style?: 'dashed' | 'solid' | 'dotted'  // Line style (default: 'dashed')
      // Multi-hop routes
      waypoints?: string[]               // Additional ISO codes between from and to
      directional?: boolean              // Show direction (planned, not yet implemented)
    }>
    camera?: {                          // Override auto-framing
      lat: number                        // Latitude (-90 to 90)
      lng: number                        // Longitude (-180 to 180)
      distance?: number                  // Camera distance (globe radius = 100, normal ≈ 260)
    }
    markers?: Array<{                   // ⚠️ NOT YET RENDERED
      lat: number
      lng: number
      label: string
      color: string
    }>
  }>
}
```

## Interaction Types

### 1. Visual Elements (Per Scene)

| Element | Property | Description | Example Use |
|---------|----------|-------------|-------------|
| **Narration** | `narration` | Main text overlay | Tell the story, provide historical context |
| **Scene Title** | `sceneTitle` | Optional heading | Chapter headers, dates, locations |
| **Country Highlights** | `highlights` | Color countries on the globe | Show territories, empires, affected regions |
| **Animated Arcs** | `arcs` | Curved lines between countries | Trade routes, migrations, invasions, data flows |
| **Arc Thickness** | `arcs[].thickness` | Line width multiplier | Volume: thick = mass migration, thin = single explorer |
| **Arc Speed** | `arcs[].speed` | Animation duration (ms) | Urgency: fast = urgent message, slow = gradual journey |
| **Arc Style** | `arcs[].style` | Line pattern | `dashed` (default), `solid`, or `dotted` |
| **Arc Waypoints** | `arcs[].waypoints` | Multi-hop routes | Complex journeys: Silk Road with multiple stops |
| **Arc Labels** | `arcs[].label` | Route description | Shown in data (hover planned) |
| **Markers** | `markers` | Points with labels | Cities, battles, specific locations ⚠️ *Not rendered yet* |
| **Camera** | `camera` | Override auto-framing | Focus on specific region, custom zoom |

### 2. Navigation Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Manual** | Default | User presses →/Space (next) or ← (previous), or swipes on mobile |
| **Auto-advance** | `duration > 0` | Scene automatically advances after specified milliseconds |
| **External Control** | `control.json` | Jump to any scene index by writing to `public/story/control.json` |

### 3. Camera Behavior

| Mode | When It Happens | Description |
|------|-----------------|-------------|
| **Auto-frame** | Default (no camera override) | Calculates spherical centroid of all highlighted countries + arc endpoints, animates smoothly |
| **FOV Adjustment** | Auto-frame with distant countries | Widens field of view for country pairs >30° apart |
| **Manual Override** | `camera` provided | Uses exact lat/lng/distance specified, bypasses auto-framing |

### 4. Scene Lifecycle

| Stage | Timing | Action |
|-------|--------|--------|
| **Load** | Story JSON written | Globe polls every 3s, loads new story automatically |
| **Enter** | Scene becomes active | Camera animates to position, arcs begin animation, highlights apply |
| **Display** | Scene active | Narration visible, user can navigate or auto-advance triggers |
| **Transition** | Next/previous called | Camera animates to new position, arcs/highlight data updates |

## Examples

### Basic Story

```json
{
  "title": "Silk Road",
  "scenes": [
    {
      "sceneTitle": "Chang'an (Xi'an)",
      "narration": "The journey begins in the Tang Dynasty capital...",
      "highlights": [{ "iso": "CN", "color": "#d4af37" }]
    },
    {
      "sceneTitle": "Samarkand",
      "narration": "Traders crossed the Pamir Mountains to reach Central Asian hubs...",
      "highlights": [{ "iso": "UZ", "color": "#d4af37" }],
      "arcs": [{ "from": "CN", "to": "UZ", "color": "#d4af37" }]
    }
  ]
}
```

### Auto-Advancing Slideshow

```json
{
  "title": "Age of Exploration",
  "scenes": [
    {
      "sceneTitle": "1488 - Dias rounds the Cape",
      "narration": "Bartolomeu Dias becomes the first European to sail around the Cape of Good Hope...",
      "highlights": [{ "iso": "PT", "color": "#4a90d9" }, { "iso": "ZA", "color": "#e74c3c" }],
      "arcs": [{ "from": "PT", "to": "ZA", "color": "#4a90d9" }],
      "duration": 5000
    },
    {
      "sceneTitle": "1498 - Da Gama reaches India",
      "narration": "Vasco da Gama completes the first direct European voyage to India...",
      "highlights": [{ "iso": "PT", "color": "#4a90d9" }, { "iso": "IN", "color": "#e74c3c" }],
      "arcs": [{ "from": "PT", "to": "IN", "color": "#4a90d9" }],
      "duration": 5000
    }
  ]
}
```

### Custom Camera Angle

```json
{
  "scenes": [
    {
      "narration": "The Battle of Midway, viewed from the Pacific...",
      "highlights": [{ "iso": "US", "color": "#3498db" }, { "iso": "JP", "color": "#e74c3c" }],
      "camera": {
        "lat": 30,
        "lng": -165,
        "distance": 180
      }
    }
  ]
}
```

### Complex Multi-Route Story

```json
{
  "title": "Triangular Trade",
  "scenes": [
    {
      "sceneTitle": "The Atlantic Triangle",
      "narration": "European goods flowed to Africa, enslaved people to the Americas, raw materials back to Europe...",
      "highlights": [
        { "iso": "GB", "color": "#c0392b" },
        { "iso": "NG", "color": "#8e44ad" },
        { "iso": "JM", "color": "#27ae60" }
      ],
      "arcs": [
        { "from": "GB", "to": "NG", "color": "#c0392b" },
        { "from": "NG", "to": "JM", "color": "#8e44ad" },
        { "from": "JM", "to": "GB", "color": "#27ae60" }
      ]
    }
  ]
}
```

### Advanced Arc Styling (Multi-hop with Waypoints)

```json
{
  "title": "The Silk Road",
  "scenes": [
    {
      "sceneTitle": "From Chang'an to Rome",
      "narration": "The ancient Silk Road spanned thousands of miles across mountains, deserts, and empires...",
      "highlights": [
        { "iso": "CN", "color": "#d4af37" },
        { "iso": "UZ", "color": "#d4af37" },
        { "iso": "IR", "color": "#d4af37" },
        { "iso": "TR", "color": "#d4af37" },
        { "iso": "IT", "color": "#d4af37" }
      ],
      "arcs": [
        {
          "from": "CN",
          "to": "IT",
          "color": "#d4af37",
          "thickness": 1.5,
          "speed": 3000,
          "style": "dashed",
          "label": "The Silk Road",
          "waypoints": ["UZ", "IR", "TR"]
        }
      ]
    }
  ]
}
```

### Mixed Route Styles (Trade vs War vs Migration)

```json
{
  "title": "19th Century Atlantic",
  "scenes": [
    {
      "sceneTitle": "Three Kinds of Crossings",
      "narration": "The same ocean carried trade goods, enslaved people, and hopeful immigrants...",
      "highlights": [
        { "iso": "GB", "color": "#95a5a6" },
        { "iso": "NG", "color": "#e74c3c" },
        { "iso": "IE", "color": "#27ae60" },
        { "iso": "US", "color": "#3498db" }
      ],
      "arcs": [
        {
          "from": "GB",
          "to": "US",
          "color": "#95a5a6",
          "thickness": 0.5,
          "style": "solid",
          "label": "Regular trade",
          "speed": 4000
        },
        {
          "from": "NG",
          "to": "US",
          "color": "#e74c3c",
          "thickness": 2.5,
          "style": "dashed",
          "label": "Middle Passage",
          "speed": 1500
        },
        {
          "from": "IE",
          "to": "US",
          "color": "#27ae60",
          "thickness": 1.0,
          "style": "dotted",
          "label": "Famine migration",
          "speed": 2500
        }
      ]
    }
  ]
}
```

## User Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Next scene | → Arrow or Space | Swipe left on narration card |
| Previous scene | ← Arrow | Swipe right on narration card |

## Current Limitations

| Feature | Status | Note |
|---------|--------|------|
| Markers | ❌ Not rendered | Defined in schema but not displayed on globe |
| Control API | ⚠️ Partial | `control.json` polling exists but no MCP tool writes it |
| Arc labels | ⚠️ Stored only | Stored in data but no hover/legend UI yet |
| Arc directional arrows | ❌ Not implemented | `directional` property stored but not visualized |
| Polygon labels | ❌ Not available | `three-globe` 2.45.x removed `.polygonLabel()` |
| Arc thickness | ✅ Working | Visual line width adjustment |
| Arc speed | ✅ Working | Animation duration control |
| Arc waypoints | ✅ Working | Multi-hop routes via waypoints array |
| Arc styles | ✅ Working | `dashed`, `solid`, `dotted` styles |
| Scene transitions | ✅ Smooth | Camera and data animate between scenes |
| Responsive | ✅ Yes | Works on desktop and mobile |

## Development

### Rebuild MCP Server

```bash
cd mcp && pnpm build
```

Output: `mcp/dist/index.js`

### Configuration

The MCP server is pre-configured in `.claude/settings.json` and launches automatically with Claude Code sessions.

### Story File Location

Stories are written to: `public/story/current.json`

The globe polls this file every 3 seconds for updates.

## ISO Country Codes Reference

Common codes for storytelling:

| Code | Country | Code | Country | Code | Country |
|------|---------|------|---------|------|---------|
| US | United States | CN | China | GB | United Kingdom |
| FR | France | DE | Germany | JP | Japan |
| IN | India | BR | Brazil | RU | Russia |
| EG | Egypt | ZA | South Africa | NG | Nigeria |
| AU | Australia | CA | Canada | MX | Mexico |
| HT | Haiti | CU | Cuba | IR | Iran |
| IQ | Iraq | SY | Syria | IL | Israel |

Full list: [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
