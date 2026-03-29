import countriesGeoJson from '~/data/globe/countries.geo.json'

interface LatLng { lat: number; lng: number }

type Coordinate = [number, number]
type Ring = Coordinate[]
type PolygonCoords = Ring[]
type MultiPolygonCoords = PolygonCoords[]

function bboxCenter(geometry: { type: string; coordinates: PolygonCoords | MultiPolygonCoords }): LatLng {
  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity

  const processRing = (ring: Ring) => {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates as PolygonCoords) {
      processRing(ring)
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates as MultiPolygonCoords) {
      for (const ring of polygon) {
        processRing(ring)
      }
    }
  }

  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2
  }
}

let cache: Map<string, LatLng> | null = null

export function useCountryCenters(): Map<string, LatLng> {
  if (cache) return cache

  cache = new Map()
  for (const feature of (countriesGeoJson as any).features) {
    const iso = feature.properties?.ISO_A2
    if (iso && iso !== '-99') {
      cache.set(iso, bboxCenter(feature.geometry))
    }
  }
  return cache
}
