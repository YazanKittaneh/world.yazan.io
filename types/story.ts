export interface ArcDef {
  from: string       // ISO 3166-1 alpha-2, e.g. 'AU'
  to: string
  color: string
  // Visual properties
  thickness?: number        // Line width multiplier (0.1 to 5.0, default: 1.0)
  speed?: number            // Animation duration in ms (default: 2000)
  label?: string            // Label shown on hover/legend
  // Multi-hop routes
  waypoints?: string[]      // Additional ISO codes between from and to
  // Style properties
  directional?: boolean     // Show arrowhead indicating direction
  style?: 'dashed' | 'solid' | 'dotted'  // Line style (default: 'dashed')
}

export interface HighlightDef {
  iso: string
  color: string
}

export interface MarkerDef {
  lat: number
  lng: number
  label: string
  color: string
}

export interface CameraOverride {
  lat: number
  lng: number
  distance?: number  // Three.js units; globe radius = 100, normal view ≈ 260
}

export interface Scene {
  narration: string
  sceneTitle?: string
  duration?: number  // ms before auto-advancing; omit or 0 = manual
  arcs?: ArcDef[]
  highlights?: HighlightDef[]
  markers?: MarkerDef[]
  camera?: CameraOverride
}

export interface Story {
  title?: string
  scenes: Scene[]
}

export interface StoryControl {
  goToScene?: number
  t?: number  // timestamp — used to detect repeated commands
}
