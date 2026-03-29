export interface ArcDef {
  from: string   // ISO 3166-1 alpha-2, e.g. 'AU'
  to: string
  color: string
}

export interface HighlightDef {
  iso: string
  color: string
}

export interface Scene {
  narration: string
  arcs?: ArcDef[]
  highlights?: HighlightDef[]
}

export interface Story {
  title?: string
  scenes: Scene[]
}
