export interface CityConfig {
  id: string
  name: string
  modelUrl: string
  camera: {
    position: [number, number, number]
    target: [number, number, number]
    fov: number
  }
  controls: {
    minDistance: number
    maxDistance: number
    minPolarAngle: number
    maxPolarAngle: number
  }
  scale: number
  lighting?: {
    ambient?: { color: string; intensity: number }
    hemisphere?: { skyColor: string; groundColor: string; intensity: number }
    directional?: { color: string; intensity: number; position: [number, number, number] }
  }
}

export const cities: Record<string, CityConfig> = {
  losAngeles: {
    id: 'losAngeles',
    name: 'Los Angeles',
    modelUrl: '/gltf/MAP_V5.gltf',
    camera: {
      position: [52, 42, 52],
      target: [0, 5, 0],
      fov: 30
    },
    controls: {
      minDistance: 14,
      maxDistance: 180,
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 2.35
    },
    scale: 300
  },
  
  chicago: {
    id: 'chicago',
    name: 'Chicago',
    modelUrl: '/gltf/chicago/MAP_CHICAGO.gltf',
    camera: {
      position: [60, 50, 60],
      target: [0, 0, 0],
      fov: 30
    },
    controls: {
      minDistance: 20,
      maxDistance: 200,
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 2.35
    },
    scale: 280
  },
  
  newYork: {
    id: 'newYork',
    name: 'New York',
    modelUrl: '/gltf/nyc/MAP_NYC.gltf',
    camera: {
      position: [70, 55, 70],
      target: [0, 0, 0],
      fov: 30
    },
    controls: {
      minDistance: 25,
      maxDistance: 220,
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 2.35
    },
    scale: 250
  }
}

export const defaultCity = cities.losAngeles

export function getCityConfig(cityId: string): CityConfig {
  return cities[cityId] || defaultCity
}
