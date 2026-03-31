<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import countries from '~/data/globe/countries.geo.json'
import { globeConfig } from '~/composables/globeConfig'
import { useCountryCenters } from '~/composables/useCountryCenters'

type CountryFeature = {
  properties?: {
    ISO_A2?: string
    NAME?: string
  }
  geometry: object
}

const containerRef = ref<HTMLElement | null>(null)
const storyStore = useStoryStore()
const { currentScene } = storeToRefs(storyStore)
const countryCenters = useCountryCenters()

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0
let globeObject: THREE.Object3D | null = null
let globeInstance: any = null

// Camera animation state
const targetCamPos = new THREE.Vector3(0, 0, 260)
let targetFov = globeConfig.cameraFov
let targetDist = 260  // lerped independently so zoom can change smoothly
let isAnimatingCamera = false

const polygonFeatures = (countries.features as CountryFeature[]).filter(
  country => country.properties?.ISO_A2 !== 'AQ' && country.properties?.NAME !== 'Antarctica'
)

// Convert lat/lng to a world-space unit direction
// Uses three-globe's polar2Cartesian convention:
// phi = 90° - lat, theta = 90° - lng
// x = sin(phi) * cos(theta), y = cos(phi), z = sin(phi) * sin(theta)
function latLngToWorldDir(lat: number, lng: number): THREE.Vector3 {
  const phi = (90 - lat) * THREE.MathUtils.DEG2RAD
  const theta = (90 - lng) * THREE.MathUtils.DEG2RAD
  const x = Math.sin(phi) * Math.cos(theta)
  const y = Math.cos(phi)
  const z = Math.sin(phi) * Math.sin(theta)
  return new THREE.Vector3(x, y, z)
}

// Custom 3D overlay for detailed scenes
let customOverlayGroup: THREE.Group | null = null
let animatedObjects: { mesh: THREE.Mesh; update: (delta: number) => void }[] = []

function manageCustomOverlay(sc: any) {
  // Remove existing overlay
  if (customOverlayGroup && globeObject) {
    globeObject.remove(customOverlayGroup)
    customOverlayGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(m => m.dispose())
      }
    })
    customOverlayGroup = null
    animatedObjects = []
  }

  // Only create overlay for Hormuz scene
  if (sc?.sceneTitle !== 'The Chokepoint') return

  customOverlayGroup = new THREE.Group()
  
  // Tankers navigating through the strait
  const tankerGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8)
  const tankerMat = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    roughness: 0.3,
    metalness: 0.7
  })

  const tankerPositions = [
    { lat: 26.6, lng: 56.3, progress: 0.2 },
    { lat: 26.5, lng: 56.4, progress: 0.5 },
    { lat: 26.4, lng: 56.5, progress: 0.8 },
    { lat: 26.7, lng: 56.2, progress: 0.1 }
  ]

  tankerPositions.forEach((pos, i) => {
    const tanker = new THREE.Mesh(tankerGeo, tankerMat)
    const pos3D = latLngToWorldDir(pos.lat, pos.lng).multiplyScalar(100.5)
    tanker.position.copy(pos3D)
    tanker.lookAt(0, 0, 0)
    tanker.rotateX(Math.PI / 2)
    tanker.userData = { 
      isTanker: true, 
      baseLat: pos.lat, 
      baseLng: pos.lng,
      offset: i * 1000,
      speed: 0.00005 + Math.random() * 0.00003
    }
    
    animatedObjects.push({
      mesh: tanker,
      update: (delta: number) => {
        // Subtle bobbing motion
        tanker.position.y += Math.sin(Date.now() * 0.001 + tanker.userData.offset) * 0.01
      }
    })
    
    customOverlayGroup!.add(tanker)
  })

  // Missile batteries on Iran coast
  const batteryGeo = new THREE.ConeGeometry(0.6, 1.5, 6)
  const batteryMat = new THREE.MeshStandardMaterial({ 
    color: 0xc0392b,
    roughness: 0.8 
  })

  const batteryPositions = [
    { lat: 26.85, lng: 56.15 },
    { lat: 26.9, lng: 56.1 },
    { lat: 27.0, lng: 56.05 }
  ]

  batteryPositions.forEach(pos => {
    const battery = new THREE.Mesh(batteryGeo, batteryMat)
    const pos3D = latLngToWorldDir(pos.lat, pos.lng).multiplyScalar(100.3)
    battery.position.copy(pos3D)
    battery.lookAt(0, 0, 0)
    customOverlayGroup!.add(battery)
  })

  // Radar/range circles
  const ringGeo = new THREE.RingGeometry(2, 2.2, 32)
  const ringMat = new THREE.MeshBasicMaterial({ 
    color: 0xc0392b, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  })
  
  const ring = new THREE.Mesh(ringGeo, ringMat)
  const ringPos = latLngToWorldDir(26.85, 56.15).multiplyScalar(100.2)
  ring.position.copy(ringPos)
  ring.lookAt(0, 0, 0)
  
  animatedObjects.push({
    mesh: ring,
    update: () => {
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.2
      ring.scale.setScalar(scale)
      ring.material.opacity = 0.3 - (scale - 1) * 0.3
    }
  })
  
  customOverlayGroup!.add(ring)

  if (globeObject) {
    globeObject.add(customOverlayGroup)
  }
}

function animateCameraToScene() {
  if (!camera || !currentScene.value) return
  const sc = currentScene.value

  // Camera override: LLM-specified lat/lng/distance bypasses auto-framing
  if (sc.camera) {
    const dir = latLngToWorldDir(sc.camera.lat, sc.camera.lng)
    targetDist = sc.camera.distance ?? camera.position.length()
    targetCamPos.copy(dir).multiplyScalar(targetDist)
    targetFov = globeConfig.cameraFov
    isAnimatingCamera = true
    return
  }

  const isoSet = new Set<string>()
  for (const h of sc.highlights ?? []) isoSet.add(h.iso)
  for (const a of sc.arcs ?? []) {
    isoSet.add(a.from)
    isoSet.add(a.to)
    for (const wp of a.waypoints ?? []) isoSet.add(wp)
  }
  if (isoSet.size === 0) return

  const dirs: THREE.Vector3[] = []
  for (const iso of isoSet) {
    const c = countryCenters.get(iso)
    if (c) dirs.push(latLngToWorldDir(c.lat, c.lng))
  }
  if (dirs.length === 0) return

  // Spherical centroid with antipodal handling
  // When countries span >180°, vector average cancels out and points wrong way
  let centroid = new THREE.Vector3()
  for (const d of dirs) centroid.add(d)
  centroid.normalize()

  // Check if centroid is reasonable (majority of points should be within 90°)
  let closeCount = 0
  for (const d of dirs) {
    if (centroid.dot(d) > 0) closeCount++ // Within 90°
  }
  // If centroid is wrong, flip it
  if (closeCount < dirs.length / 2) {
    centroid.negate()
  }

  // Max angular spread from centroid to any country
  let maxAngle = 0
  for (const d of dirs) {
    const angle = Math.acos(Math.max(-1, Math.min(1, centroid.dot(d))))
    if (angle > maxAngle) maxAngle = angle
  }

  // Widen FOV for distant country pairs (spread > 30° starts expanding)
  const spreadDeg = maxAngle * THREE.MathUtils.RAD2DEG
  targetFov = Math.min(65, Math.max(globeConfig.cameraFov, globeConfig.cameraFov + (spreadDeg - 30) * 0.4))

  targetDist = camera.position.length()
  targetCamPos.copy(centroid).multiplyScalar(targetDist)
  isAnimatingCamera = true
}

const renderScene = () => {
  if (!renderer || !scene || !camera) return

  if (isAnimatingCamera) {
    camera.position.lerp(targetCamPos, 0.055)

    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.055)
    camera.updateProjectionMatrix()

    if (camera.position.distanceTo(targetCamPos) < 5 && Math.abs(camera.fov - targetFov) < 0.3) {
      camera.position.copy(targetCamPos)
      camera.fov = targetFov
      camera.updateProjectionMatrix()
      isAnimatingCamera = false
    }
  }

  // Update animated custom overlay objects
  animatedObjects.forEach(obj => obj.update(0.016))

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

const disposeObject = (object: THREE.Object3D | null) => {
  object?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    child.geometry.dispose()

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) {
          value.dispose()
        }
      }

      material.dispose()
    }
  })
}

const loadGrayscaleTexture = (url: string): Promise<THREE.Texture> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        d[i] = d[i + 1] = d[i + 2] = gray
      }
      ctx.putImageData(imageData, 0, 0)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      resolve(tex)
    }
    img.onerror = reject
    img.src = url
  })

onMounted(async () => {
  if (!containerRef.value) {
    return
  }

  const [{ default: ThreeGlobe }, grayscaleTex] = await Promise.all([
    import('three-globe'),
    loadGrayscaleTexture('/globe/earth-daymap-solarsystemscope-2k.jpg')
  ])

  scene = new THREE.Scene()
  scene.background = new THREE.Color(globeConfig.backgroundColor)

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

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enableRotate = true
  controls.enableZoom = globeConfig.controls.enableZoom
  controls.enablePan = globeConfig.controls.enablePan
  controls.minDistance = globeConfig.controls.minDistance
  controls.maxDistance = globeConfig.controls.maxDistance
  controls.autoRotate = true
  controls.autoRotateSpeed = globeConfig.autoRotateSpeed
  controls.target.set(0, 0, 0)

  const ambient = new THREE.AmbientLight(
    globeConfig.lighting.ambient.color,
    globeConfig.lighting.ambient.intensity
  )
  scene.add(ambient)

  const hemisphere = new THREE.HemisphereLight(
    globeConfig.lighting.hemisphere.skyColor,
    globeConfig.lighting.hemisphere.groundColor,
    globeConfig.lighting.hemisphere.intensity
  )
  scene.add(hemisphere)

  const directional = new THREE.DirectionalLight(
    globeConfig.lighting.directional.color,
    globeConfig.lighting.directional.intensity
  )
  directional.position.set(...globeConfig.lighting.directional.position)
  scene.add(directional)

  const globeMat = new THREE.MeshPhongMaterial({
    map: grayscaleTex,
    shininess: 8,
    specular: new THREE.Color(0x222222)
  })

  const globe = new ThreeGlobe({ waitForGlobeReady: false })
    .globeMaterial(globeMat)
    .showAtmosphere(true)
    .atmosphereColor(globeConfig.atmosphereColor)
    .atmosphereAltitude(globeConfig.atmosphereAltitude)
    .polygonsData(polygonFeatures)
    .polygonAltitude(() => globeConfig.polygonAltitude)
    .polygonCapColor((d: CountryFeature) => {
      const iso = d.properties?.ISO_A2
      const scene = currentScene.value
      if (iso && scene?.highlights) {
        const match = scene.highlights.find(h => h.iso === iso)
        if (match) return match.color
      }
      return globeConfig.polygonCapColor
    })
    .polygonSideColor(() => globeConfig.polygonSideColor)
    .polygonStrokeColor(() => globeConfig.polygonStrokeColor)
    .arcsData([])
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor('color')
    .arcAltitude(0.3)
    .arcStroke((d: any) => d.stroke ?? 0.5)
    .arcDashLength((d: any) => d.dashLength ?? 0.4)
    .arcDashGap((d: any) => d.dashGap ?? 0.2)
    .arcDashAnimateTime((d: any) => d.animateTime ?? 2000)
    .labelsData([])
    .labelLat('lat')
    .labelLng('lng')
    .labelText('text')
    .labelColor('color')
    .labelAltitude(0.02)
    .labelSize(1.2)
    .labelDotRadius(0.3)
    .labelIncludeDot(true)
    .labelDotOrientation('bottom')

  globe.rotation.y = -Math.PI / 2
  globeObject = globe
  globeInstance = globe
  scene.add(globe)

  // React to story scene changes
  watchEffect(() => {
    if (!globeInstance) return

    const sc = currentScene.value

    // Update arcs - handle waypoints by creating multiple segments
    const arcsData: any[] = []
    for (const arc of sc?.arcs ?? []) {
      const waypoints = arc.waypoints ?? []
      const hops = [arc.from, ...waypoints, arc.to]
      
      // Convert style to dash parameters
      let dashLength = 0.4
      let dashGap = 0.2
      if (arc.style === 'solid') {
        dashLength = 1
        dashGap = 0
      } else if (arc.style === 'dotted') {
        dashLength = 0.1
        dashGap = 0.3
      }
      
      for (let i = 0; i < hops.length - 1; i++) {
        const from = countryCenters.get(hops[i])
        const to = countryCenters.get(hops[i + 1])
        if (!from || !to) continue
        
        arcsData.push({
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          color: arc.color,
          stroke: (arc.thickness ?? 1) * 0.5,
          dashLength,
          dashGap,
          animateTime: arc.speed ?? 2000,
          label: arc.label
        })
      }
    }

    globeInstance.arcsData(arcsData)

    // Update labels/markers
    const labelsData = (sc?.markers ?? []).map((marker: any) => ({
      lat: marker.lat,
      lng: marker.lng,
      text: marker.label,
      color: marker.color
    }))
    globeInstance.labelsData(labelsData)

    // Re-render polygons to pick up new highlight colors
    globeInstance.polygonsData([...polygonFeatures])

    // Manage custom 3D overlay objects
    manageCustomOverlay(sc)

    // Animate camera to center on the scene's countries
    animateCameraToScene()
  })

  resizeScene()
  window.addEventListener('resize', resizeScene)
  renderScene()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frameId)
  window.removeEventListener('resize', resizeScene)

  controls?.dispose()
  disposeObject(globeObject)

  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  renderer?.dispose()
  scene?.clear()
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
  background: #090a0d;
}

.globe-scene-canvas::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 45%, rgba(79, 124, 255, 0.12), transparent 30%),
    radial-gradient(circle at top, rgba(2, 71, 254, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(9, 10, 13, 0) 0%, rgba(9, 10, 13, 0.28) 100%);
  pointer-events: none;
}

.globe-scene-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
