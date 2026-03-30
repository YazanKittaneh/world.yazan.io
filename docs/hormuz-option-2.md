# Option 2: Custom Three.js Overlay Layer

## Overview
Add a custom Three.js layer to the existing globe showing 3D geometry - tankers, oil rigs, missile batteries positioned on the globe surface.

## Pros
- Real 3D objects on the globe
- Can animate movement (tankers sailing)
- Full Three.js flexibility
- Still maintains globe context

## Cons
- Requires custom Three.js code
- Objects must be positioned on spherical surface
- More complex to maintain

## Implementation

### Code Changes
Modify `GlobeSceneCanvas.vue` to add custom objects:

```typescript
// Add after globe initialization
const straitObjects = new THREE.Group()
straitObjects.name = 'strait-overlay'

// Oil tankers
const tankerGeo = new THREE.SphereGeometry(0.5, 8, 8)
const tankerMat = new THREE.MeshBasicMaterial({ color: 0x27ae60 })

const tankers = [
  { lat: 26.5, lng: 56.4, name: 'Tanker 1' },
  { lat: 26.4, lng: 56.3, name: 'Tanker 2' },
  { lat: 26.6, lng: 56.5, name: 'Tanker 3' }
]

tankers.forEach(t => {
  const mesh = new THREE.Mesh(tankerGeo, tankerMat)
  const pos = latLngToWorldDir(t.lat, t.lng).multiplyScalar(101)
  mesh.position.copy(pos)
  mesh.lookAt(0, 0, 0) // Face center
  straitObjects.add(mesh)
})

// Missile batteries on Iran coast
const batteryGeo = new THREE.ConeGeometry(0.8, 2, 8)
const batteryMat = new THREE.MeshBasicMaterial({ color: 0xc0392b })

const batteries = [
  { lat: 26.8, lng: 56.2 },
  { lat: 27.0, lng: 56.1 }
]

batteries.forEach(b => {
  const mesh = new THREE.Mesh(batteryGeo, batteryMat)
  const pos = latLngToWorldDir(b.lat, b.lng).multiplyScalar(101)
  mesh.position.copy(pos)
  mesh.lookAt(0, 0, 0)
  straitObjects.add(mesh)
})

globe.add(straitObjects)
```

### Animation
```typescript
// Animate tankers moving through strait
function animateTankers() {
  straitObjects.children.forEach((child, i) => {
    if (child.userData.isTanker) {
      // Move along arc path
      child.userData.progress += 0.001
      const newPos = getPositionOnArc(child.userData.progress)
      child.position.copy(newPos)
    }
  })
}
```

### Story JSON
```json
{
  "sceneTitle": "Strait Traffic",
  "narration": "Dozens of supertankers navigate the narrow passage daily...",
  "camera": { "lat": 26.5, "lng": 56.5, "distance": 140 },
  "highlights": [
    { "iso": "IR", "color": "#c0392b" },
    { "iso": "OM", "color": "#2980b9" },
    { "iso": "AE", "color": "#2980b9" }
  ],
  "customLayer": "strait-overlay"
}
```

### When to Use
- When you want animated 3D elements
- When specific icons matter (tankers vs batteries vs ships)
- When showing movement through time

### Technical Notes
- Must convert lat/lng to 3D world positions
- Objects should be children of the globe so they rotate with it
- Scale appropriately for zoom level
- Clean up objects when leaving scene
