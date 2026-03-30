# Option 3: Separate Three.js Scene

## Overview
Create a completely separate Three.js scene showing a detailed local view of the strait - no globe, just the strait region with terrain, water, and vessels.

## Pros
- Complete creative control
- Detailed terrain/bathymetry possible
- Can show underwater topography
- Independent camera movement (not locked to globe)
- Special effects (wake trails, explosions, weather)

## Cons
- Most complex implementation
- No automatic globe context
- Must create all assets from scratch
- Separate page/route needed

## Implementation

### New Page: `pages/hormuz.vue`

```vue
<template>
  <div ref="containerRef" class="hormuz-scene" />
  <NarrationOverlay />
</template>

<script setup>
import * as THREE from 'three'

const containerRef = ref(null)
let scene, camera, renderer

onMounted(() => {
  // Setup scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Sky blue
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 50, 100)
  
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  containerRef.value.appendChild(renderer.domElement)
  
  // Terrain - simplified strait geometry
  const terrainGeo = new THREE.PlaneGeometry(200, 100, 100, 50)
  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0xE8DCC0, // Sand/rock
    roughness: 0.9 
  })
  const terrain = new THREE.Mesh(terrainGeo, terrainMat)
  terrain.rotation.x = -Math.PI / 2
  scene.add(terrain)
  
  // Water
  const waterGeo = new THREE.PlaneGeometry(200, 40, 50, 20)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1
  })
  const water = new THREE.Mesh(waterGeo, waterMat)
  water.rotation.x = -Math.PI / 2
  water.position.y = -5
  scene.add(water)
  
  // Tankers
  const tankerGeo = new THREE.BoxGeometry(4, 2, 12)
  const tankerMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
  
  for (let i = 0; i < 5; i++) {
    const tanker = new THREE.Mesh(tankerGeo, tankerMat)
    tanker.position.set(
      (Math.random() - 0.5) * 40, // Spread across strait width
      -3, // Slightly in water
      (Math.random() - 0.5) * 100 // Along strait length
    )
    scene.add(tanker)
  }
  
  // Coastlines - Iran and Oman
  createCoastline(35, 0x8B4513, 'Iran')
  createCoastline(-35, 0x8B4513, 'Oman')
  
  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  
  const sun = new THREE.DirectionalLight(0xffffff, 1)
  sun.position.set(50, 100, 50)
  scene.add(sun)
  
  animate()
})

function createCoastline(xPos, color, name) {
  const coastGeo = new THREE.BoxGeometry(60, 10, 200)
  const coastMat = new THREE.MeshStandardMaterial({ color })
  const coast = new THREE.Mesh(coastGeo, coastMat)
  coast.position.set(xPos, 0, 0)
  scene.add(coast)
}

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
</script>
```

### Visual Design
- **Scale**: 1 unit = 1 km approximately
- **Strait width**: ~40 units (actual ~21 miles at narrowest)
- **Strait length**: ~200 units visible
- **Terrain**: Brown/tan for land, blue for water
- **Vessels**: Dark gray tankers, ~12 units long (supertanker scale)

### Assets Needed
- Better terrain mesh (actual strait bathymetry)
- Ship models (or procedural generation)
- Water shader with waves
- Skybox
- Optional: weather effects (dust, heat shimmer)

### When to Use
- When hyper-realism is required
- When showing specific tactical/operational details
- When timeline allows for extensive 3D work
- When this is a centerpiece scene worth the investment

### Alternative: Hybrid Approach
Keep the globe but transition smoothly to a detailed overlay when zooming in:

```typescript
// In GlobeSceneCanvas.vue
if (camera.distance < 150) {
  // Switch to detailed terrain shader
  globe.material = detailedStraitShader
  // Show high-res overlays
  straitDetailLayer.visible = true
}
```

### Notes
This is essentially building a mini game/visualization scene. Consider using:
- **Babylon.js** instead of raw Three.js for better terrain tools
- **Mapbox GL** with custom 3D layers for real geographic accuracy
- **Cesium** for true globe-to-local transitions
