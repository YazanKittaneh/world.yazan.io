# Globe Data Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new immersive `/globe` page with a Three.js-powered Earth globe using three-globe library, country polygons as the first data layer, and updated project documentation.

**Architecture:** Add a dedicated Nuxt route at `/globe` that mounts a client-only globe scene component. Use `three-globe` inside the existing Three.js scene lifecycle pattern (following HeroSceneCanvas.vue patterns exactly). Source a lightweight 2K Earth texture and static country GeoJSON data. Keep navigation minimal and documentation explicit.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Three.js ^0.176.0, three-globe ^2.24.13, static GeoJSON assets

**Constraints & Guardrails:**
- Earth texture must be ≤2K resolution (2048x1024)
- Country GeoJSON must be ≤500KB uncompressed
- Three-globe version must be compatible with three@0.176.0 (v2.24.13 verified compatible)
- Only country polygons as data layer - NO markers, arcs, tooltips, or interactive handlers
- NO additional textures (night, clouds, specular) in v1
- MUST follow existing HeroSceneCanvas.vue lifecycle patterns exactly
- MUST use `<ClientOnly>` wrapper to avoid SSR issues
- MUST dispose of ThreeGlobe instance in onBeforeUnmount

---

## Acceptance Criteria (MUST PASS)

**AC1: Build succeeds**
- Command: `pnpm build`
- Expected: Exit code 0, no import errors

**AC2: No type errors**
- Command: Check `lsp_diagnostics` on all modified/new files
- Expected: Zero introduced errors

**AC3: Navigation works**
- From `/`: Click "Explore globe" → navigates to `/globe`
- From `/globe`: Click "Back to city" → navigates to `/`
- Both transitions complete without full page reload

**AC4: Globe renders correctly**
- Earth texture visible on globe surface
- At least 150 country polygon boundaries rendered
- Countries have semi-transparent fill (rgba(255,255,255,0.08))
- Country borders visible in contrasting color

**AC5: Interaction functional**
- OrbitControls: drag to rotate, wheel to zoom
- Auto-rotation active by default (0.35 speed)
- No console errors during interaction

**AC6: Resources cleaned up**
- Navigate `/` → `/globe` → `/` repeatedly
- Check: No WebGL context warnings in console
- Memory usage stable (no leaks)

**AC7: README updated**
- Section exists: `/globe` route description
- Section exists: Implementation summary (three-globe, textures, country data)
- Section exists: Earth texture attribution (CC BY 4.0 - Solar System Scope)
- Section exists: Country data source and license

---

## Prerequisites & Data Sources

### Three-Globe Version
**Version:** 2.24.13 (verified compatible with three@0.176.0)
**Install:** `pnpm add three-globe@2.24.13`

### Earth Texture Source
**Source:** Solar System Scope Earth textures
**URL:** https://www.solarsystemscope.com/textures/
**File:** 2K Earth - Day map (2048x1024)
**License:** CC BY 4.0 (requires attribution)
**Save as:** `public/globe/earth-daymap.jpg`

### Country GeoJSON Source
**Source:** Natural Earth (simplified)
**URL:** https://github.com/datasets/geo-countries
**File:** `countries.geojson` (simplified 1:110m scale)
**License:** Public Domain (Natural Earth)
**Expected size:** ~200-300KB
**Save as:** `public/globe/countries.geojson` (in public for runtime fetch)

---

## Task 1: Install three-globe dependency

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto-generated)

**Step 1: Add the dependency**

```bash
pnpm add three-globe@2.24.13
```

**Step 2: Verify installation**

```bash
npm ls three
```

Expected output shows no version conflicts:
```
wowmedia-demo@ /path/to/project
├── three@0.176.0
└── three-globe@2.24.13
```

**Step 3: Verify three-globe can be imported**

Create temporary test file `test-import.ts`:
```typescript
import ThreeGlobe from 'three-globe'
console.log('ThreeGlobe imported:', typeof ThreeGlobe)
```

Run:
```bash
npx tsx test-import.ts
```

Expected: No errors, logs "function" or "object"

**Step 4: Clean up test file**

```bash
rm test-import.ts
```

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add three-globe@2.24.13 for globe visualization"
```

---

## Task 2: Add globe assets (Earth texture and country data)

**Files:**
- Create: `public/globe/earth-daymap.jpg` (2K texture)
- Create: `public/globe/countries.geojson` (country boundaries)
- Create: `public/globe/ATTRIBUTION.md` (license notes)

**Step 1: Create directory structure**

```bash
mkdir -p public/globe
```

**Step 2: Download Earth texture**

From https://www.solarsystemscope.com/textures/ download:
- **2K Earth - Day map** (2048x1024px)

Save as: `public/globe/earth-daymap.jpg`

**Verify file size:**
```bash
ls -lh public/globe/earth-daymap.jpg
```

Expected: ~500KB-1MB (for 2K JPEG)

**Step 3: Download country GeoJSON**

From https://github.com/datasets/geo-countries download:
- `data/countries.geojson` (use raw file or simplified version)

Alternative source (if file too large):
```bash
curl -L https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson -o public/globe/countries.geojson
```

**Verify file size:**
```bash
ls -lh public/globe/countries.geojson
```

Expected: <500KB

**Step 4: Validate GeoJSON format**

```bash
head -50 public/globe/countries.geojson
```

Expected: Valid JSON with `{"type":"FeatureCollection","features":[...` structure

**Step 5: Create attribution file**

Create `public/globe/ATTRIBUTION.md`:
```markdown
# Globe Assets Attribution

## Earth Texture
- **Source:** Solar System Scope (https://www.solarsystemscope.com/textures/)
- **File:** 2K Earth - Day map
- **License:** CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
- **Attribution:** Textures by Solar System Scope

## Country Boundaries
- **Source:** Natural Earth (https://www.naturalearthdata.com/)
- **File:** 1:110m Cultural - Admin 0 Countries
- **License:** Public Domain
- **Processed via:** geo-countries dataset (https://github.com/datasets/geo-countries)
```

**Step 6: Verify asset locations**

```bash
ls -la public/globe/
```

Expected:
```
earth-daymap.jpg
countries.geojson
ATTRIBUTION.md
```

**Step 7: Commit**

```bash
git add public/globe/
git commit -m "feat: add globe assets (Earth texture and country data)"
```

---

## Task 3: Add globe scene configuration

**Files:**
- Create: `composables/globeConfig.ts`
- Reference: `composables/cityConfig.ts` (follow this pattern exactly)

**Step 1: Write the config module**

Create `composables/globeConfig.ts`:
```typescript
export interface GlobeConfig {
  // Scene
  backgroundColor: string
  
  // Atmosphere
  atmosphereColor: string
  atmosphereAltitude: number
  
  // Camera
  cameraFov: number
  cameraNear: number
  cameraFar: number
  initialCameraPosition: { x: number; y: number; z: number }
  
  // Controls
  autoRotateSpeed: number
  minDistance: number
  maxDistance: number
  
  // Polygons
  polygonAltitude: number
  polygonCapColor: string
  polygonSideColor: string
  polygonStrokeColor: string
}

export const globeConfig: GlobeConfig = {
  // Scene
  backgroundColor: '#090a0d',
  
  // Atmosphere - soft blue glow
  atmosphereColor: '#4f7cff',
  atmosphereAltitude: 0.12,
  
  // Camera - positioned for editorial view
  cameraFov: 35,
  cameraNear: 0.1,
  cameraFar: 1000,
  initialCameraPosition: { x: 0, y: 0, z: 260 },
  
  // Controls - gentle auto-rotation
  autoRotateSpeed: 0.35,
  minDistance: 120,
  maxDistance: 400,
  
  // Polygons - subtle, readable styling
  polygonAltitude: 0.01,
  polygonCapColor: 'rgba(255, 255, 255, 0.08)',
  polygonSideColor: 'rgba(79, 124, 255, 0.18)',
  polygonStrokeColor: 'rgba(255, 255, 255, 0.45)'
}

export function getGlobeConfig(): GlobeConfig {
  return globeConfig
}
```

**Step 2: Verify TypeScript types**

```bash
npx tsc --noEmit composables/globeConfig.ts
```

Expected: No errors

**Step 3: Run diagnostics**

Use `lsp_diagnostics` on `composables/globeConfig.ts`

Expected: No introduced errors

**Step 4: Commit**

```bash
git add composables/globeConfig.ts
git commit -m "feat: add globe scene configuration"
```

---

## Task 4: Implement the globe scene component

**Files:**
- Create: `components/globe/GlobeSceneCanvas.vue`
- Reference: `components/hero/HeroSceneCanvas.vue` (follow lifecycle exactly)
- Reference: `composables/globeConfig.ts`

**Step 1: Create the component shell**

Create `components/globe/GlobeSceneCanvas.vue`:
```vue
<script setup lang="ts">
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { globeConfig } from '~/composables/globeConfig'

const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let globe: ThreeGlobe | null = null
let frameId = 0

// Country data
const countriesData = ref<any>(null)
const dataLoaded = ref(false)

const renderScene = () => {
  if (!renderer || !scene || !camera) {
    return
  }

  controls?.update()
  renderer.render(scene, camera)
  frameId = window.requestAnimationFrame(renderScene)
}

const resizeScene = () => {
  if (!containerRef.value || !renderer || !camera) {
    return
  }

  const { clientWidth, clientHeight } = containerRef.value
  renderer.setSize(clientWidth, clientHeight)
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
}

const loadCountryData = async () => {
  try {
    const response = await fetch('/globe/countries.geojson')
    if (!response.ok) {
      throw new Error(`Failed to load country data: ${response.status}`)
    }
    countriesData.value = await response.json()
    dataLoaded.value = true
    console.log('Country data loaded:', countriesData.value.features?.length, 'countries')
  } catch (error) {
    console.error('Error loading country data:', error)
  }
}

const createGlobe = () => {
  if (!scene || !countriesData.value) return

  globe = new ThreeGlobe()
    .globeImageUrl('/globe/earth-daymap.jpg')
    .showAtmosphere(true)
    .atmosphereColor(globeConfig.atmosphereColor)
    .atmosphereAltitude(globeConfig.atmosphereAltitude)
    .polygonsData(countriesData.value.features)
    .polygonAltitude(globeConfig.polygonAltitude)
    .polygonCapColor(() => globeConfig.polygonCapColor)
    .polygonSideColor(() => globeConfig.polygonSideColor)
    .polygonStrokeColor(() => globeConfig.polygonStrokeColor)

  scene.add(globe)
}

onMounted(async () => {
  if (!containerRef.value) {
    return
  }

  // Create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(globeConfig.backgroundColor)

  // Create camera
  camera = new THREE.PerspectiveCamera(
    globeConfig.cameraFov,
    1,
    globeConfig.cameraNear,
    globeConfig.cameraFar
  )
  camera.position.set(
    globeConfig.initialCameraPosition.x,
    globeConfig.initialCameraPosition.y,
    globeConfig.initialCameraPosition.z
  )

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // Create controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = globeConfig.minDistance
  controls.maxDistance = globeConfig.maxDistance
  controls.enableZoom = true
  controls.enableRotate = true
  controls.enablePan = false
  controls.autoRotate = true
  controls.autoRotateSpeed = globeConfig.autoRotateSpeed

  // Add lighting
  const ambient = new THREE.AmbientLight('#ffffff', 0.6)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight('#ffffff', 1.2)
  dirLight.position.set(10, 10, 10)
  scene.add(dirLight)

  const fillLight = new THREE.DirectionalLight('#88aaff', 0.5)
  fillLight.position.set(-10, 5, -10)
  scene.add(fillLight)

  // Load data and create globe
  await loadCountryData()
  createGlobe()

  // Start render loop
  resizeScene()
  window.addEventListener('resize', resizeScene)
  renderScene()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frameId)
  window.removeEventListener('resize', resizeScene)

  controls?.dispose()

  // Dispose of globe
  if (globe) {
    scene?.remove(globe)
    // Note: three-globe handles its own geometry/material disposal
  }

  renderer?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="globe-scene-canvas" aria-hidden="true" />
</template>

<style scoped>
.globe-scene-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: v-bind('globeConfig.backgroundColor');
}

.globe-scene-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
```

**Step 2: Run diagnostics**

Use `lsp_diagnostics` on `components/globe/GlobeSceneCanvas.vue`

Expected: No introduced errors (may have warnings about `any` type for countries data - this is acceptable for v1)

**Step 3: Verify component auto-imports**

Check that component will auto-import correctly with Nuxt's flat component structure:
- File location: `components/globe/GlobeSceneCanvas.vue`
- Auto-import name: `GlobeSceneCanvas`

**Step 4: Commit**

```bash
git add components/globe/GlobeSceneCanvas.vue
git commit -m "feat: add globe scene canvas component"
```

---

## Task 5: Add the `/globe` route

**Files:**
- Create: `pages/globe.vue`
- Reference: `pages/index.vue`

**Step 1: Create the page shell**

Create `pages/globe.vue`:
```vue
<script setup lang="ts">
// Globe page - full-screen Earth visualization
</script>

<template>
  <main class="globe-viewer">
    <NuxtLink class="globe-back-link" to="/">
      Back to city
    </NuxtLink>

    <ClientOnly>
      <GlobeSceneCanvas />
    </ClientOnly>
  </main>
</template>

<style scoped>
.globe-viewer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.globe-back-link {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 8px 16px;
  font-size: 14px;
  background: rgba(10, 10, 15, 0.8);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.globe-back-link:hover {
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
```

**Step 2: Run diagnostics**

Use `lsp_diagnostics` on `pages/globe.vue`

Expected: No introduced errors

**Step 3: Verify page routing**

Test that Nuxt recognizes the route:
```bash
pnpm dev &
curl -s http://localhost:3000/globe | head -20
```

Expected: Returns HTML (not 404)

**Step 4: Commit**

```bash
git add pages/globe.vue
git commit -m "feat: add globe exploration route at /globe"
```

---

## Task 6: Add navigation affordance from homepage

**Files:**
- Modify: `pages/index.vue`

**Step 1: Add globe link to homepage**

Modify `pages/index.vue`:
```vue
<script setup lang="ts">
import { cities, getCityConfig } from '~/composables/cityConfig'

const route = useRoute()
const currentCity = computed(() => {
  const cityId = route.query.city as string
  return getCityConfig(cityId)
})

const availableCities = Object.values(cities)
</script>

<template>
  <main class="city-viewer">
    <div class="city-selector">
      <select
        :value="currentCity.id"
        @change="$router.push({ query: { city: ($event.target as HTMLSelectElement).value } })"
      >
        <option
          v-for="city in availableCities"
          :key="city.id"
          :value="city.id"
        >
          {{ city.name }}
        </option>
      </select>
    </div>

    <!-- Globe exploration link -->
    <NuxtLink class="globe-link" to="/globe">
      Explore globe
    </NuxtLink>
    
    <ClientOnly>
      <HeroSceneCanvas :city="currentCity" />
    </ClientOnly>
  </main>
</template>

<style scoped>
.city-viewer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.city-selector {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.city-selector select {
  padding: 8px 16px;
  font-size: 14px;
  background: rgba(10, 10, 15, 0.8);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.city-selector select:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

/* Globe link - positioned top-right */
.globe-link {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  padding: 8px 16px;
  font-size: 14px;
  background: rgba(10, 10, 15, 0.8);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.globe-link:hover {
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
```

**Step 2: Run diagnostics**

Use `lsp_diagnostics` on `pages/index.vue`

Expected: No introduced errors

**Step 3: Commit**

```bash
git add pages/index.vue
git commit -m "feat: add globe route navigation from homepage"
```

---

## Task 7: Update README with architecture and licensing

**Files:**
- Modify: `README.md`

**Step 1: Add globe section to README**

Append to `README.md`:
```markdown
## Globe Viewer

A dedicated `/globe` route provides an immersive Earth visualization for exploring geographic data layers.

### Architecture

- **Route:** `/globe`
- **Component:** `components/globe/GlobeSceneCanvas.vue`
- **Config:** `composables/globeConfig.ts`
- **Data:** `public/globe/countries.geojson`
- **Texture:** `public/globe/earth-daymap.jpg`

### Implementation

The globe uses [`three-globe`](https://github.com/vasturiano/three-globe) for procedural Earth rendering and country polygon visualization. The implementation follows the same Three.js lifecycle patterns as the city viewer:

1. Scene/Camera/Renderer setup in `onMounted`
2. ThreeGlobe instance with Earth texture and country polygons
3. OrbitControls with auto-rotation
4. Cleanup in `onBeforeUnmount`

### Features

- Full-screen Earth with 2K day texture
- Country polygon boundaries (first data layer)
- Soft atmospheric glow
- Auto-rotation with interactive controls
- Minimal navigation to return to city view

### Asset Attribution

**Earth Texture**
- Source: [Solar System Scope](https://www.solarsystemscope.com/textures/)
- File: 2K Earth - Day map (2048x1024)
- License: CC BY 4.0
- Attribution: Textures by Solar System Scope

**Country Boundaries**
- Source: [Natural Earth](https://www.naturalearthdata.com/) (1:110m scale)
- Processed via: [geo-countries](https://github.com/datasets/geo-countries)
- License: Public Domain

### Navigation

- From city viewer (`/`): Click "Explore globe" in top-right
- From globe (`/globe`): Click "Back to city" in top-left
```

**Step 2: Verify README formatting**

Preview the markdown:
```bash
head -100 README.md
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document globe page architecture and licensing"
```

---

## Task 8: Verify end-to-end

**Files to verify:**
- `pages/globe.vue`
- `components/globe/GlobeSceneCanvas.vue`
- `composables/globeConfig.ts`
- `pages/index.vue`
- `README.md`

### Step 1: Run diagnostics on all source files

Use `lsp_diagnostics` on:
1. `pages/globe.vue`
2. `components/globe/GlobeSceneCanvas.vue`
3. `composables/globeConfig.ts`
4. `pages/index.vue`

Expected: No introduced errors in any file

### Step 2: Build the app

```bash
pnpm build
```

Expected: Exit code 0, no errors

### Step 3: Manual verification checklist

Start dev server:
```bash
pnpm dev --host 0.0.0.0
```

Verify:
- [ ] `/` loads the city viewer
- [ ] City selector dropdown works
- [ ] "Explore globe" link visible in top-right
- [ ] Click "Explore globe" → navigates to `/globe`
- [ ] `/globe` renders the Earth globe
- [ ] Earth texture is visible (not solid color)
- [ ] Country polygon boundaries are visible
- [ ] Auto-rotation is active
- [ ] Drag to rotate works
- [ ] Scroll to zoom works
- [ ] "Back to city" link visible in top-left
- [ ] Click "Back to city" → navigates to `/`
- [ ] No console errors
- [ ] No WebGL warnings

### Step 4: Performance check

Open Chrome DevTools:
1. Performance tab → Record 5 seconds
2. Expected: 60 FPS on desktop
3. Memory tab → Take heap snapshot
4. Navigate `/` → `/globe` → `/` → `/globe`
5. Take another heap snapshot
6. Expected: No significant memory growth

### Step 5: Final commit

```bash
git add -A
git commit -m "feat: launch globe exploration page

- Add three-globe dependency for Earth visualization
- Add 2K Earth texture and country GeoJSON data
- Create globe scene component with country polygons
- Add /globe route with full-screen viewer
- Add navigation between city and globe views
- Document architecture, assets, and licensing in README

Assets:
- Earth texture: Solar System Scope (CC BY 4.0)
- Country data: Natural Earth (Public Domain)"
```

---

## Troubleshooting

### Issue: "three-globe" module not found
**Solution:** Ensure `pnpm install` ran after adding dependency. Check `node_modules/three-globe` exists.

### Issue: TypeScript errors with ThreeGlobe import
**Solution:** Try `import * as ThreeGlobe from 'three-globe'` or add `// @ts-ignore` temporarily and verify runtime works.

### Issue: Country data not loading (404)
**Solution:** Ensure `public/globe/countries.geojson` exists. Check browser Network tab for fetch errors.

### Issue: Earth texture not displaying
**Solution:** Check browser Console for 404 errors on `/globe/earth-daymap.jpg`. Verify file exists in `public/globe/`.

### Issue: WebGL context lost errors
**Solution:** Normal on route switching. Ensure `renderer.dispose()` is called in `onBeforeUnmount`.

### Issue: Low FPS on mobile
**Solution:** Expected on low-end devices. Consider reducing auto-rotate speed or polygon detail in future iterations.

### Issue: Build fails with "window is not defined"
**Solution:** Ensure `<ClientOnly>` wrapper is present in `pages/globe.vue`. Check for any server-side references to `window` or `document`.

---

## Future Extension Points (Do Not Implement)

These are documented for future work, NOT part of v1:

1. **Additional textures:** Night map, clouds, specular maps
2. **Data layers:** Markers, arcs, heatmaps
3. **Interactivity:** Hover tooltips, country selection, click handlers
4. **UI controls:** Layer toggles, search/filter, settings
5. **Camera:** Guided tours, animation sequences
6. **Mobile:** Responsive UI, touch optimizations
7. **Performance:** LOD, texture streaming, instancing

---

## Completion Checklist

- [ ] Task 1: three-globe installed and verified
- [ ] Task 2: Assets downloaded and committed
- [ ] Task 3: globeConfig.ts created
- [ ] Task 4: GlobeSceneCanvas.vue created
- [ ] Task 5: pages/globe.vue created
- [ ] Task 6: Navigation added to pages/index.vue
- [ ] Task 7: README updated with docs
- [ ] Task 8: Build passes, manual verification complete
- [ ] All acceptance criteria met
- [ ] No introduced type errors
- [ ] No memory leaks
- [ ] Final commit created
