export interface GlobeConfig {
  backgroundColor: string
  atmosphereColor: string
  atmosphereAltitude: number
  autoRotateSpeed: number
  cameraFov: number
  cameraNear: number
  cameraFar: number
  initialCameraPosition: { x: number; y: number; z: number }
  controls: {
    minDistance: number
    maxDistance: number
    enableZoom: boolean
    enablePan: boolean
  }
  polygonAltitude: number
  polygonCapColor: string
  polygonSideColor: string
  polygonStrokeColor: string
  lighting: {
    ambient: { color: string; intensity: number }
    hemisphere: { skyColor: string; groundColor: string; intensity: number }
    directional: { color: string; intensity: number; position: [number, number, number] }
  }
}

export const globeConfig: GlobeConfig = {
  backgroundColor: '#090a0d',
  atmosphereColor: '#4f7cff',
  atmosphereAltitude: 0.12,
  autoRotateSpeed: 0.35,
  cameraFov: 35,
  cameraNear: 0.1,
  cameraFar: 1000,
  initialCameraPosition: { x: 0, y: 0, z: 260 },
  controls: {
    minDistance: 140,
    maxDistance: 320,
    enableZoom: true,
    enablePan: false
  },
  polygonAltitude: 0.01,
  polygonCapColor: 'rgba(255,255,255,0.08)',
  polygonSideColor: 'rgba(79,124,255,0.18)',
  polygonStrokeColor: 'rgba(255,255,255,0.45)',
  lighting: {
    ambient: { color: '#d6deff', intensity: 1.8 },
    hemisphere: { skyColor: '#88a7ff', groundColor: '#05070d', intensity: 1.1 },
    directional: { color: '#ffffff', intensity: 2.1, position: [8, 6, 10] }
  }
}
