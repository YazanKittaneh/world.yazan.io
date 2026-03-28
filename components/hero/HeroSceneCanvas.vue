<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { CityConfig } from '~/composables/cityConfig'

const props = defineProps<{
  city: CityConfig
}>()

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0
let cityModel: THREE.Object3D | null = null
let handleKeyPress: ((e: KeyboardEvent) => void) | null = null

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

const loadCityModel = () => {
  if (!props.city) return
  
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  loader.setDRACOLoader(dracoLoader)

  loader.load(
    props.city.modelUrl,
    (gltf) => {
      cityModel = gltf.scene
      
      const box = new THREE.Box3().setFromObject(cityModel)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      cityModel.position.x = -center.x
      cityModel.position.z = -center.z
      cityModel.position.y = -center.y
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = props.city.scale / maxDim
      cityModel.scale.setScalar(scale)
      
      cityModel.position.y = (size.y * scale) / 2
      
      cityModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene?.add(cityModel)
      
      console.log('City model loaded:', props.city.name, {
        size: size.toArray(),
        center: center.toArray(),
        scale
      })
    },
    undefined,
    (error) => {
      console.error('Error loading GLTF model:', error)
    }
  )
}

onMounted(() => {
  if (!containerRef.value) {
    return
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0a0a0f')
  
  camera = new THREE.PerspectiveCamera(
    props.city.camera.fov,
    1,
    0.1,
    2000
  )
  camera.position.set(...props.city.camera.position)
  camera.lookAt(...props.city.camera.target)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  containerRef.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = props.city.controls.minDistance
  controls.maxDistance = props.city.controls.maxDistance
  controls.minPolarAngle = props.city.controls.minPolarAngle
  controls.maxPolarAngle = props.city.controls.maxPolarAngle
  controls.enableZoom = true
  controls.zoomToCursor = true
  controls.enableRotate = true
  controls.enablePan = false
  controls.target.set(...props.city.camera.target)

  // Much brighter ambient light to show through the veil
  const ambient = new THREE.AmbientLight('#ffffff', 1.2)
  scene.add(ambient)

  // Strong hemisphere light
  const hemiLight = new THREE.HemisphereLight('#aaccff', '#2244aa', 1.0)
  scene.add(hemiLight)

  // Multiple directional lights for better visibility
  const dirLight = new THREE.DirectionalLight('#ffffff', 2)
  dirLight.position.set(10, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 50
  dirLight.shadow.camera.left = -20
  dirLight.shadow.camera.right = 20
  dirLight.shadow.camera.top = 20
  dirLight.shadow.camera.bottom = -20
  scene.add(dirLight)

  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight('#88aaff', 1.5)
  fillLight.position.set(-10, 10, -10)
  scene.add(fillLight)

  // Rim light for edge definition
  const rimLight = new THREE.DirectionalLight('#ffffff', 1.0)
  rimLight.position.set(0, 5, -15)
  scene.add(rimLight)

  // Accent lights for mood
  const accentLight1 = new THREE.PointLight('#4488ff', 3, 40)
  accentLight1.position.set(-15, 8, -15)
  scene.add(accentLight1)

  const accentLight2 = new THREE.PointLight('#66ffaa', 2, 35)
  accentLight2.position.set(15, 6, 15)
  scene.add(accentLight2)



  // Load the city model
  loadCityModel()

  // Add keyboard shortcut for wireframe toggle
  handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'w') {
      cityModel?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(mat => {
            mat.wireframe = !mat.wireframe
          })
        }
      })
    }
  }
  window.addEventListener('keydown', handleKeyPress)

  resizeScene()
  window.addEventListener('resize', resizeScene)
  renderScene()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frameId)
  window.removeEventListener('resize', resizeScene)
  if (handleKeyPress) {
    window.removeEventListener('keydown', handleKeyPress)
  }

  controls?.dispose()
  
  // Dispose of city model
  cityModel?.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose())
      } else {
        child.material.dispose()
      }
    }
  })

  renderer?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="hero-scene" aria-hidden="true" />
</template>

<style scoped>
.hero-scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #0a0a0f;
}

.hero-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
