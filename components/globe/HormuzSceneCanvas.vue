<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0

// Animated objects
const animatedObjects: { update: (time: number, delta: number) => void }[] = []

// Strait geography constants
const STRAIT_WIDTH = 21 // nautical miles scaled to scene units
const STRAIT_LENGTH = 60
const WATER_SURFACE_Y = 0

function createWaterSurface(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(200, 200, 128, 128)
  
  // Deep ocean material with subtle shimmer
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x0a1628,
    emissive: 0x051020,
    emissiveIntensity: 0.2,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.95
  })
  
  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = -Math.PI / 2
  water.position.y = WATER_SURFACE_Y
  
  // Animate subtle wave movement
  const initialPositions = geometry.attributes.position.array.slice()
  animatedObjects.push({
    update: (time: number) => {
      const positions = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        const x = initialPositions[i]
        const y = initialPositions[i + 1]
        positions[i + 2] = Math.sin(x * 0.1 + time * 0.0005) * 0.3 +
                           Math.cos(y * 0.08 + time * 0.0003) * 0.2
      }
      geometry.attributes.position.needsUpdate = true
    }
  })
  
  return water
}

function createCoastline(isNorth: boolean): THREE.Group {
  const group = new THREE.Group()
  const zOffset = isNorth ? -15 : 15
  
  // Rocky coastline geometry
  const coastGeo = new THREE.BoxGeometry(80, 8, 12)
  const coastMat = new THREE.MeshStandardMaterial({
    color: isNorth ? 0x5a4a3a : 0x8b7355,
    roughness: 0.9,
    metalness: 0.1
  })
  
  const coast = new THREE.Mesh(coastGeo, coastMat)
  coast.position.set(0, 4, zOffset)
  group.add(coast)
  
  // Add rugged terrain details
  for (let i = 0; i < 12; i++) {
    const rockGeo = new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0)
    const rockMat = new THREE.MeshStandardMaterial({
      color: isNorth ? 0x6b5b4b : 0x9b8365,
      roughness: 1,
      metalness: 0
    })
    const rock = new THREE.Mesh(rockGeo, rockMat)
    rock.position.set(
      (Math.random() - 0.5) * 70,
      2 + Math.random() * 3,
      zOffset + (isNorth ? -2 : 2) + (Math.random() - 0.5) * 4
    )
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    group.add(rock)
  }
  
  // Iranian coast gets missile batteries
  if (isNorth) {
    const batteryPositions = [
      { x: -20, z: zOffset - 3 },
      { x: 0, z: zOffset - 4 },
      { x: 20, z: zOffset - 2 }
    ]
    
    batteryPositions.forEach((pos, i) => {
      const batteryGroup = new THREE.Group()
      
      // Launcher base
      const baseGeo = new THREE.CylinderGeometry(1.5, 2, 1, 8)
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.7,
        metalness: 0.3
      })
      const base = new THREE.Mesh(baseGeo, baseMat)
      base.position.y = 0.5
      batteryGroup.add(base)
      
      // Missile silos
      for (let j = 0; j < 4; j++) {
        const siloGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 6)
        const siloMat = new THREE.MeshStandardMaterial({
          color: 0xc0392b,
          roughness: 0.4,
          metalness: 0.6
        })
        const silo = new THREE.Mesh(siloGeo, siloMat)
        silo.position.set(
          Math.cos(j * Math.PI / 2) * 0.8,
          1.5,
          Math.sin(j * Math.PI / 2) * 0.8
        )
        silo.rotation.x = -0.3
        batteryGroup.add(silo)
      }
      
      batteryGroup.position.set(pos.x, 8, pos.z)
      batteryGroup.lookAt(0, 8, 0)
      group.add(batteryGroup)
      
      // Radar sweep effect
      const radarGeo = new THREE.RingGeometry(0, 15, 32, 1, 0, Math.PI / 3)
      const radarMat = new THREE.MeshBasicMaterial({
        color: 0xc0392b,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      })
      const radar = new THREE.Mesh(radarGeo, radarMat)
      radar.position.set(pos.x, 10, pos.z)
      radar.rotation.x = -Math.PI / 2
      
      const startAngle = i * (Math.PI * 2 / 3)
      animatedObjects.push({
        update: (time: number) => {
          const angle = startAngle + time * 0.001
          radar.rotation.z = angle
          radar.material.opacity = 0.15 + Math.sin(time * 0.003 + i) * 0.1
        }
      })
      
      group.add(radar)
    })
  }
  
  return group
}

function createTanker(id: number): THREE.Group {
  const tanker = new THREE.Group()
  
  // Hull
  const hullGeo = new THREE.CapsuleGeometry(1.2, 6, 4, 12)
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.7
  })
  const hull = new THREE.Mesh(hullGeo, hullMat)
  hull.rotation.z = Math.PI / 2
  hull.rotation.y = Math.PI / 2
  tanker.add(hull)
  
  // Bridge/superstructure
  const bridgeGeo = new THREE.BoxGeometry(1.5, 1.8, 1.2)
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.5,
    metalness: 0.2
  })
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat)
  bridge.position.set(2, 1.2, 0)
  tanker.add(bridge)
  
  // Smokestack
  const stackGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8)
  const stackMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    roughness: 0.6,
    metalness: 0.4
  })
  const stack = new THREE.Mesh(stackGeo, stackMat)
  stack.position.set(1.5, 1.8, 0)
  tanker.add(stack)
  
  // Navigation lights
  const lightGeo = new THREE.SphereGeometry(0.1, 8, 8)
  const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  
  const redLight = new THREE.Mesh(lightGeo, redLightMat)
  redLight.position.set(-3, 0.5, 0.8)
  tanker.add(redLight)
  
  const greenLight = new THREE.Mesh(lightGeo, greenLightMat)
  greenLight.position.set(-3, 0.5, -0.8)
  tanker.add(greenLight)
  
  // Wake effect (animated)
  const wakeGeo = new THREE.PlaneGeometry(8, 4, 16, 8)
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  })
  const wake = new THREE.Mesh(wakeGeo, wakeMat)
  wake.rotation.x = -Math.PI / 2
  wake.position.set(-6, 0.1, 0)
  tanker.add(wake)
  
  animatedObjects.push({
    update: (time: number) => {
      // Bobbing motion
      tanker.position.y = Math.sin(time * 0.001 + id) * 0.15
      tanker.rotation.z = Math.sin(time * 0.0005 + id * 0.5) * 0.02
      
      // Wake shimmer
      wakeMat.opacity = 0.05 + Math.sin(time * 0.005 + id) * 0.05
    }
  })
  
  return tanker
}

function createShippingLane(): THREE.Group {
  const group = new THREE.Group()
  
  // Lane markers
  const markerGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0x27ae60,
    emissive: 0x27ae60,
    emissiveIntensity: 0.3
  })
  
  for (let z = -20; z <= 20; z += 10) {
    // North marker
    const northMarker = new THREE.Mesh(markerGeo, markerMat)
    northMarker.position.set(0, 1, z - 3)
    group.add(northMarker)
    
    // South marker
    const southMarker = new THREE.Mesh(markerGeo, markerMat)
    southMarker.position.set(0, 1, z + 3)
    group.add(southMarker)
  }
  
  return group
}

function createAtmosphere(): THREE.Group {
  const group = new THREE.Group()
  
  // Volumetric light shafts
  for (let i = 0; i < 5; i++) {
    const shaftGeo = new THREE.ConeGeometry(2, 40, 16, 1, true)
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const shaft = new THREE.Mesh(shaftGeo, shaftMat)
    shaft.position.set(
      (Math.random() - 0.5) * 60,
      20,
      (Math.random() - 0.5) * 40
    )
    shaft.rotation.x = Math.random() * 0.3
    shaft.rotation.z = Math.random() * 0.3
    group.add(shaft)
    
    animatedObjects.push({
      update: (time: number) => {
        shaft.rotation.y = time * 0.0001 * (i % 2 === 0 ? 1 : -1)
        shaftMat.opacity = 0.02 + Math.sin(time * 0.0005 + i) * 0.015
      }
    })
  }
  
  // Haze/fog planes
  const hazeGeo = new THREE.PlaneGeometry(150, 100)
  const hazeMat = new THREE.MeshBasicMaterial({
    color: 0xffddaa,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const haze = new THREE.Mesh(hazeGeo, hazeMat)
  haze.position.set(0, 15, -20)
  group.add(haze)
  
  return group
}

function initScene() {
  if (!containerRef.value) return
  
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050810)
  scene.fog = new THREE.FogExp2(0x050810, 0.008)
  
  // Camera - dramatic low angle looking down the strait
  camera = new THREE.PerspectiveCamera(
    45,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(40, 25, 35)
  camera.lookAt(0, 0, 0)
  
  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  containerRef.value.appendChild(renderer.domElement)
  
  // Controls - constrained for cinematic feel
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.minDistance = 20
  controls.maxDistance = 80
  controls.maxPolarAngle = Math.PI / 2 - 0.1
  controls.target.set(0, 0, 0)
  
  // Lighting - dramatic dawn/dusk atmosphere
  const ambient = new THREE.AmbientLight(0x404060, 0.3)
  scene.add(ambient)
  
  // Sun - low angle for long shadows
  const sun = new THREE.DirectionalLight(0xffaa66, 2)
  sun.position.set(-50, 20, -30)
  sun.castShadow = true
  sun.shadow.mapSize.width = 2048
  sun.shadow.mapSize.height = 2048
  scene.add(sun)
  
  // Fill light from opposite side
  const fill = new THREE.DirectionalLight(0x6688cc, 0.5)
  fill.position.set(30, 10, 30)
  scene.add(fill)
  
  // Rim lighting for drama
  const rim = new THREE.SpotLight(0xff4400, 3)
  rim.position.set(0, 30, -40)
  rim.lookAt(0, 0, 0)
  rim.angle = Math.PI / 4
  rim.penumbra = 0.5
  scene.add(rim)
  
  // Scene elements
  scene.add(createWaterSurface())
  scene.add(createCoastline(true))  // North - Iran
  scene.add(createCoastline(false)) // South - Oman/UAE
  scene.add(createShippingLane())
  scene.add(createAtmosphere())
  
  // Tankers in the strait
  const tankerPositions = [
    { x: -8, z: -8, rot: -0.2 },
    { x: 5, z: 5, rot: 0.1 },
    { x: -3, z: 12, rot: -0.15 },
    { x: 10, z: -5, rot: 0.25 }
  ]
  
  tankerPositions.forEach((pos, i) => {
    const tanker = createTanker(i)
    tanker.position.set(pos.x, 0.5, pos.z)
    tanker.rotation.y = pos.rot
    scene.add(tanker)
  })
  
  // Start animation loop
  animate()
}

function animate() {
  if (!renderer || !scene || !camera) return
  
  const time = Date.now()
  const delta = 0.016
  
  // Update all animated objects
  animatedObjects.forEach(obj => obj.update(time, delta))
  
  controls?.update()
  renderer.render(scene, camera)
  frameId = requestAnimationFrame(animate)
}

function handleResize() {
  if (!containerRef.value || !renderer || !camera) return
  
  const { clientWidth, clientHeight } = containerRef.value
  renderer.setSize(clientWidth, clientHeight)
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('resize', handleResize)
  
  controls?.dispose()
  
  // Cleanup
  scene?.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => m.dispose())
    }
  })
  
  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  renderer?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="hormuz-scene-canvas" aria-hidden="true" />
</template>

<style scoped>
.hormuz-scene-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #050810 0%, #0a1525 50%, #0d1a2d 100%);
}

.hormuz-scene-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(255, 170, 68, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(192, 57, 43, 0.06) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

.hormuz-scene-canvas::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 100, 50, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(100, 150, 255, 0.04) 0%, transparent 25%);
  pointer-events: none;
  z-index: 2;
  animation: atmosphere-shift 20s ease-in-out infinite;
}

@keyframes atmosphere-shift {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.hormuz-scene-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
