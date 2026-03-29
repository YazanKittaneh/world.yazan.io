# world.yazan.io

Nuxt 3 + Three.js project with two immersive scenes: a prebuilt GLTF city model at `/` and a `three-globe` Earth visualization at `/globe`.

## Current state

- Full-screen 3D city viewer at `/`
- Full-screen editorial globe viewer at `/globe`
- Loads `public/gltf/MAP_V5.gltf` with `GLTFLoader` + `DRACOLoader`
- Loads a **grayscale** Earth globe with `three-globe` and Natural Earth country polygons
- SimCity-style orbit camera using `OrbitControls`
- No marketing overlays on the page anymore; the homepage is just the scene
- The 405 signs are currently **fixed world objects**

## Commands

```bash
pnpm dev
pnpm dev --host 0.0.0.0   # local network access
pnpm build
pnpm preview
```

## Local network

Run:

```bash
pnpm dev --host 0.0.0.0
```

Then open the printed LAN URL, or your machine IP on port `3000`.

## Project structure for LLMs

If you are modifying the 3D viewer, start here:

- `pages/index.vue`
  - The homepage shell
  - Renders `<HeroSceneCanvas />` inside `<ClientOnly>` plus a link to `/globe`
- `pages/globe.vue`
  - Full-screen globe route shell
  - Adds minimal back navigation and editorial copy overlay
- `components/hero/HeroSceneCanvas.vue`
  - Main Three.js scene
  - Creates renderer, scene, camera, controls, lights
  - Loads and centers/scales the GLTF city model
  - Best entry point for camera, lighting, animation, and object behavior changes
- `components/globe/GlobeSceneCanvas.vue`
  - Globe-specific Three.js scene
  - Mounts `three-globe`, OrbitControls, lighting, resize handling, and cleanup
- `composables/globeConfig.ts`
  - Typed globe scene tuning values
- `data/globe/countries.geo.json`
  - Natural Earth Admin 0 country polygons used as the first globe data layer
- `public/globe/earth-daymap-solarsystemscope-2k.jpg`
  - 2K Earth texture used by the globe scene
- `public/globe/ATTRIBUTION.md`
  - Exact source and license notes for the globe assets
- `public/gltf/MAP_V5.gltf`
  - Main city map asset
  - References `MAP_V5.bin` and the texture files in the same folder
- `public/gltf/MAP_V5.bin`
  - Geometry buffer for the map
- `public/gltf/*.jpg|*.png`
  - Textures copied from wowmedia.com
- `nuxt.config.ts`
  - Nuxt app config
  - Includes flat component auto-import config (`pathPrefix: false`)
- `app.vue`
  - Very thin app shell/background styling

Legacy-but-still-present components not currently used on `/`:

- `components/hero/HeroSection.vue`
- `components/chrome/SiteHeader.vue`
- `components/overlays/VideoPreloader.vue`
- `components/sections/*`

These came from the earlier marketing-page version. The current root page bypasses them.

## 3D implementation notes

### Loader stack

- `three`
- `GLTFLoader`
- `DRACOLoader`
- `three-globe`
- Draco decoder currently uses Google's hosted decoder path

### Globe route architecture

The `/globe` route follows the same client-only scene pattern as the city viewer:

1. `pages/globe.vue` wraps `<GlobeSceneCanvas />` in `<ClientOnly>`
2. `components/globe/GlobeSceneCanvas.vue` creates the scene, camera, renderer, controls, lights, and animation loop
3. `composables/globeConfig.ts` centralizes camera, controls, lighting, and polygon styling values
4. `data/globe/countries.geo.json` provides the static country polygons
5. `public/globe/earth-daymap-solarsystemscope-2k.jpg` provides the 2K Earth texture

The first globe release intentionally stays small in scope: textured Earth, atmosphere, slow auto-rotation, and country polygons as the hero data layer.

### Camera model

- `PerspectiveCamera`
- `OrbitControls`
- constrained tilt
- zoom enabled
- panning disabled
- tuned to feel more like a city/map viewer than a product hero

### Model placement

The GLTF is not authored around the desired world origin for this app, so the code:

1. computes a `Box3` from the loaded scene
2. finds the scene center
3. offsets the root model by `-center`
4. scales the model to fit the view
5. lifts it to ground level using scaled height

This is all done in `loadCityModel()` in `components/hero/HeroSceneCanvas.vue`.

## Applied patches

### vue-router `__vrv_devtools` crash on load (500)

**Symptom:** Any page load returns a 500 with `null is not an object (evaluating 'instance.__vrv_devtools = info')`.

**Root cause:** `vue-router` 4.6.x `RouterView` tries to tag the rendered component's internal Vue instance with devtools metadata during the initial render pass. On first render the component's `.ref.i` (the internal instance) is not yet set, so the assignment throws.

**Fix:** `scripts/patch-vue-router.mjs` adds a null guard to `dist/vue-router.mjs` and `dist/vue-router.cjs`:

```js
// before
instance.__vrv_devtools = info

// after
if (instance) instance.__vrv_devtools = info
```

The `postinstall` script in `package.json` re-applies this patch automatically after every `pnpm install`.

### `three-globe` 2.45.x — `.polygonLabel()` does not exist

**Symptom:** Globe scene throws `(intermediate value).polygonLabel is not a function` and the canvas stays blank.

**Root cause:** `.polygonLabel()` was removed from `three-globe` 2.45.x. The method no longer exists in this version.

**Fix:** Removed the `.polygonLabel()` call from `components/globe/GlobeSceneCanvas.vue`.

Available polygon methods in 2.45.x:
- `polygonsData`
- `polygonCapColor` / `polygonCapMaterial`
- `polygonSideColor` / `polygonSideMaterial`
- `polygonStrokeColor`
- `polygonAltitude`
- `polygonCapCurvatureResolution`
- `polygonsTransitionDuration`

### `three-globe` — grayscale texture via `.globeMaterial()`

**Why not `.globeImageUrl()`:** To control the material directly (grayscale, shininess, specular), we skip `.globeImageUrl()` and pass a `MeshPhongMaterial` through `.globeMaterial()` instead.

**Approach:** The texture is loaded via a canvas, converted to grayscale with a pixel-by-pixel luminance pass (`0.299R + 0.587G + 0.114B`), then wrapped in a `THREE.CanvasTexture`. Using `ctx.filter = 'grayscale(1)'` is unreliable cross-browser; pixel manipulation is not.

When using `.globeMaterial()` instead of `.globeImageUrl()`, set `waitForGlobeReady: false` — otherwise the globe waits for a texture-load event that never fires.

## What we learned while building this

### 1. The city is a prebuilt GLTF, not procedural

The scene is just a modeled/exported city asset. There is no tile system, no procedural road generation, and no gameplay map logic.

### 2. The textures matter

Just loading `MAP_V5.gltf` + `MAP_V5.bin` is not enough for the final look. The GLTF references many external textures. Without them, the city loads but looks incomplete or flat.

### 3. wowmedia.com adds runtime behavior beyond the GLTF

Important: the WOW site is **not** just “load the GLTF and render it.”

We confirmed:

- the GLTF does **not** contain baked animation tracks for the 405 signs
- wowmedia.com uses extra runtime scene logic in JS
- some visible behaviors on the live site are app-driven, not asset-driven

### 4. The 405 signs are not the same thing as label objects

We traced the GLTF object relationships:

- `Sign1` and `Sign2`
  - use material `M_405`
  - texture is `405 label.jpg`
  - these are the actual textured 405 signs
- `Numbers`
  - is **not** the 405 textured sign
  - rotating it produced the wrong visual result

### 5. Rotating the wrong node causes fake/orbit-like behavior

If you animate the wrong object after the model has been recentered/scaled, motion can appear to happen around the map instead of reading like a local object behavior.

The fix was to identify the actual sign meshes rather than assume the node called `Numbers` was the 405 sign.

### 6. Landmark labels and billboard signs should be treated differently

The desired behavior split is:

- **billboard/sign structures**: remain fixed in world space
- **label-like overlays**: may face the camera

Do not assume every upright plane in the GLTF should spin or billboard.

### 7. Dev/build workflow can corrupt Nuxt dev state

We hit this error multiple times:

```text
Package import specifier "#internal/nuxt/paths" is not defined...
```

This happened after repeated `pnpm build` + dev-server restart cycles while `.nuxt` / `.output` were being regenerated.

When that happens, fix it with a clean restart:

```bash
rm -rf .nuxt .output
pnpm dev --host 0.0.0.0
```

If the dev server looks broken, do this before debugging app code.

### 8. Vue component auto-imports needed flattening

The older page composition referenced components like `SiteHeader`, `StatementBand`, etc. Since those components live in nested folders, Nuxt needed flat auto-import config:

```ts
components: [{ path: '~/components', pathPrefix: false }]
```

Without that, the old page structure produced unresolved component + hydration issues.

## Known asset facts

Useful GLTF object names:

- `Sign1`
- `Sign2`
- `Numbers`
- `Sofi_Stadium.001`
- `Intuit_Dome`
- `KIA`

Useful material names:

- `M_405`
- `M_Billboard_White`

Texture clue:

- `405 label.jpg` is the 405 sign texture

## Globe asset attribution

### Earth texture

- File: `public/globe/earth-daymap-solarsystemscope-2k.jpg`
- Source: [Solar System Scope](https://www.solarsystemscope.com/textures/)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

### Country boundaries

- File: `data/globe/countries.geo.json`
- Source family: [Natural Earth Admin 0 Countries](https://www.naturalearthdata.com/)
- GeoJSON source used: `nvkelso/natural-earth-vector`
- License: Public domain

See `public/globe/ATTRIBUTION.md` for the exact source URLs used in-repo.

## Guidance for future LLM edits

If the request is about any of these topics, go straight to `components/hero/HeroSceneCanvas.vue` first:

- camera feel
- zoom limits
- rotation behavior
- label facing
- per-object animation
- lighting
- model scale/framing
- GLTF traversal/object targeting

If the request is about why something on wowmedia.com behaves differently, assume one of these is true until proven otherwise:

1. the live site adds runtime JS behavior after model load
2. the object name in the GLTF is misleading
3. the visible thing is texture/material-driven, not geometry-driven
4. the current demo is intentionally simpler than the live site

## Globe Storytelling Engine (MCP)

The globe at `/globe` is controllable by an LLM via a local MCP server. Stories are sequences of scenes — each with narration text, country highlights, and animated arcs between countries.

### Architecture

```
Claude (MCP client)
  └─ tell_story tool call
       └─ mcp/dist/index.js  (stdio MCP server)
            └─ writes  public/story/current.json
                 └─ GlobeSceneCanvas.vue polls every 3s
                      └─ renders scenes reactively
```

The globe polls `public/story/current.json` every 3 seconds. When a new story appears, it loads the first scene. The user advances scenes with **→ / Space** and goes back with **←**.

### MCP server setup

The server is pre-configured in `.claude/settings.json`. On each Claude Code session start, the `globe-story` MCP server launches automatically.

To rebuild after changes:

```bash
cd mcp && pnpm build
```

The compiled output is `mcp/dist/index.js`.

### `tell_story` tool schema

```ts
{
  title?: string
  scenes: Array<{
    narration: string                              // text shown on screen
    highlights?: Array<{ iso: string; color: string }>  // ISO 3166-1 alpha-2
    arcs?: Array<{ from: string; to: string; color: string }>
  }>
}
```

### Example stories

- **Haitian Revolution (1791–1804)** — 10 scenes tracing slavery routes from West Africa → Saint-Domingue, the uprising, Toussaint Louverture, Napoleon's defeat, and Haiti's independence as the first Black republic
- See `public/story/current.json` for the current loaded story

### Why the MCP tool doesn't appear in a session

Claude Code connects to MCP servers at **session startup only**. If `.claude/settings.json` was added after the session started, restart Claude Code — `mcp__globe_story__tell_story` will appear as an available tool on the next session.

If the dist is missing, build it first:

```bash
cd mcp && pnpm build
```

## Suggested next work

- Add camera-facing behavior only for true label objects
- Tune framing tighter around the most important landmarks
- Reduce lighting hacks now that the texture set is present
- Optionally move Draco decoder off the Google CDN and host it locally
- Add secondary globe layers like night lights, arcs, or markers once the base globe is stable
