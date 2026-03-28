<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import countries from '~/data/globe/countries.geo.json'
import { globeConfig } from '~/composables/globeConfig'

type CountryFeature = {
  properties?: {
    ISO_A2?: string
    NAME?: string
  }
  geometry: object
}

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0
let globeObject: THREE.Object3D | null = null

const polygonFeatures = (countries.features as CountryFeature[]).filter(
  country => country.properties?.ISO_A2 !== 'AQ' && country.properties?.NAME !== 'Antarctica'
)

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

  const arcsData = [
    {
      startLat: -25.2744,
      startLng: 133.7751,
      endLat: 32.4279,
      endLng: 53.6880,
      color: '#ff2222'
    }
  ]

  const globe = new ThreeGlobe({ waitForGlobeReady: false })
    .globeMaterial(globeMat)
    .showAtmosphere(true)
    .atmosphereColor(globeConfig.atmosphereColor)
    .atmosphereAltitude(globeConfig.atmosphereAltitude)
    .polygonsData(polygonFeatures)
    .polygonAltitude(() => globeConfig.polygonAltitude)
    .polygonCapColor((d) => {
      const iso = (d as CountryFeature).properties?.ISO_A2
      return iso === 'AU' || iso === 'IR' ? 'rgba(255,40,40,0.55)' : globeConfig.polygonCapColor
    })
    .polygonSideColor(() => globeConfig.polygonSideColor)
    .polygonStrokeColor(() => globeConfig.polygonStrokeColor)
    .arcsData(arcsData)
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor('color')
    .arcAltitude(0.3)
    .arcStroke(0.5)
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(2000)

  globe.rotation.y = -Math.PI / 2
  globeObject = globe
  scene.add(globe)

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
