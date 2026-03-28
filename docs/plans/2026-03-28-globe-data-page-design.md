# Globe Data Page Design

## Summary

Add a new immersive `/globe` route that introduces an editorial-style 3D Earth experience alongside the existing city viewer. The page should use a textured globe with atmospheric treatment and country polygons as the first data layer, while preserving the repo's current Nuxt 3 + Three.js + client-only rendering patterns.

## Goals

- Add a dedicated full-screen globe exploration page at `/globe`
- Keep the first version editorial and cinematic rather than dashboard-like
- Use country polygons as the primary data layer
- Keep the implementation compatible with existing raw Three.js scene patterns
- Document architecture, assets, licensing, and extension points in repo docs

## Non-Goals

- No heavy analytics panel or filtering UI in v1
- No full GIS feature set
- No custom GLTF Earth mesh as the primary implementation
- No advanced marker/arcs/tooltip system in the first pass unless trivial to layer on later

## User Experience

### Page behavior

- Route: `/globe`
- Full-screen dark presentation matching the aesthetic of the current homepage
- Slow auto-rotation by default
- Drag to rotate, wheel/pinch to zoom
- Minimal navigation to return to `/`

### Visual direction

- Editorial demo feel, not a control-heavy exploration tool
- Soft atmosphere and dark-background contrast
- **Grayscale Earth texture** — the texture is desaturated at runtime via pixel-level canvas manipulation so country polygon outlines read clearly against the muted landmasses
- Desktop-first presentation with reasonable mobile fallback behavior

## Technical Direction

### Chosen approach

Use `three-globe` as the globe/data-layer engine rather than a GLTF Earth model.

Why:

- Better fit for country polygons and future arcs/markers
- Faster path to a real data globe than hand-building polygon projection/rendering
- Keeps the globe procedural and flexible instead of asset-bound
- Works well inside a Nuxt client-only canvas component

### Rejected alternatives

#### Raw Three.js sphere + fully custom polygon layer

Pros:
- Maximum control
- Fewer dependencies

Cons:
- Considerably more custom implementation for country polygon rendering and interaction
- Slower path to a useful first version

#### GLTF/GLB globe model

Pros:
- Useful for decorative or stylized globe scenes

Cons:
- Poor fit for dynamic country polygons and future data layers
- Less flexible than a procedural sphere for an Earth/data visualization experience

## Architecture

### New route

- `pages/globe.vue`
  - Full-screen page shell for the globe experience
  - Wrap scene in `<ClientOnly>` to avoid SSR issues
  - Provide minimal route navigation back to the city viewer

### New scene component

- `components/globe/GlobeSceneCanvas.vue`
  - Owns scene/camera/renderer lifecycle
  - Creates the `three-globe` object and mounts it into a Three.js scene
  - Applies controls, lighting/environment treatment, resize handling, animation loop, and cleanup

### Supporting data/assets

- `public/globe/earth-daymap-solarsystemscope-2k.jpg`
  - Initial Earth texture (2K Solar System Scope day map)
- `data/globe/countries.geo.json`
  - Natural Earth 110m country boundary data used to render the polygon layer
- `public/globe/ATTRIBUTION.md`
  - Co-located source and license note for the globe assets

### Optional supporting config

- `composables/globeConfig.ts`
  - If useful, centralize scene tuning values (camera distance, auto-rotate speed, atmosphere settings, polygon colors)

## Data Sources

### Earth textures

Primary recommendation:
- Solar System Scope Earth textures
- License: CC BY 4.0
- Use 2K texture first for performance

Chosen first implementation:
- `public/globe/earth-daymap-solarsystemscope-2k.jpg`
- Attribution documented in `public/globe/ATTRIBUTION.md` and `README.md`

Possible future additions:
- Night map
- Clouds map
- Specular/normal maps

Alternative source:
- NASA Blue Marble / Visible Earth
- Higher fidelity but heavier and less convenient for v1

### Country boundaries

Use a static world countries GeoJSON dataset with clear licensing and browser-safe size. Convert or trim if necessary to keep initial payload reasonable.

Chosen first implementation:
- Natural Earth Admin 0 Countries at 110m scale
- Stored in `data/globe/countries.geo.json`
- Public domain source data
- Antarctica omitted from the rendered polygon layer for the first editorial pass

## Interaction Model

### Included in v1

- Auto-rotation
- Pointer drag rotation
- Zoom
- Basic country polygon rendering

### Deferred

- Rich hover tooltips
- Region/country detail panels
- Animated arcs between cities
- Marker clusters
- Story steps / guided camera choreography

## Performance Constraints

- Start with 2K Earth texture
- Keep polygon dataset lightweight
- Avoid multiple expensive layers in first release
- Cleanly dispose of renderer/resources on unmount
- Reuse the repo's existing client-only and resize/cleanup patterns

## Routing and Navigation

- Existing `/` route remains the city viewer
- New `/globe` route is independent and focused
- Add minimal navigation so users can switch between experiences

## Documentation Requirements

### README

Update README to include:

- `/globe` route and its purpose
- `three-globe`-based implementation summary
- globe data/texture source notes
- attribution/licensing notes for Earth texture and country data

### Project docs

Document:

- route/component structure
- chosen implementation approach and rationale
- asset/data sources
- extension points for markers/arcs/tooltips
- performance constraints and initial scope decisions

## Risks

- Some public country datasets are too large or messy for first-load performance
- `three-globe` styling may need scene/material overrides to match the current immersive aesthetic
- Texture licensing must be documented clearly if Solar System Scope assets are used

## Success Criteria

- `/globe` renders successfully in-browser
- Globe matches the repo's immersive visual direction
- Country polygons are visible and form the hero data layer
- Interaction feels smooth and editorial, not cluttered
- README and docs are updated with architecture and licensing notes
