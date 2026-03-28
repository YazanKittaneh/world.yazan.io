export interface HeroMetric {
  label: string
  value: string
}

export interface HeroContent {
  eyebrow: string
  titleTop: string
  titleBottom: string
  summary: string
  ctaLabel: string
  ctaTarget: string
  kicker: string
  metrics: HeroMetric[]
}

export interface StatementContent {
  overline: string
  title: string
  body: string
}

export interface CapabilityItem {
  title: string
  description: string
  accent: string
  tag: string
}

export interface MediaItem {
  title: string
  subtitle: string
  detail: string
  accent: string
  indexLabel: string
}

export interface ContactContent {
  title: string
  body: string
  email: string
  location: string
}

export interface HomepageDocument {
  hero: HeroContent
  statements: StatementContent[]
  capabilities: CapabilityItem[]
  featuredMedia: MediaItem[]
  contact: ContactContent
}
