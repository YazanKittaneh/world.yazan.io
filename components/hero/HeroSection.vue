<script setup lang="ts">
import type { HeroContent } from '~/types/content'

defineProps<{
  hero: HeroContent
}>()

const mediaPlanStore = useMediaPlanStore()
const transitionsStore = useTransitionsStore()
const navigationStore = useNavigationStore()

const handleEnter = async (target: string) => {
  await navigationStore.scrollToSection(target)
}

const networkNodes = ['Spectaculars', 'EON Network', 'District Reach']
</script>

<template>
  <section id="top" :class="['hero', { 'hero--ready': transitionsStore.heroReady }]">
    <ClientOnly>
      <HeroSceneCanvas />
    </ClientOnly>

    <div class="hero__veil" />
    <div class="hero__city-glow" />

    <div class="hero__content layout-shell">
      <div class="hero__lead">
        <div class="hero__network-tabs" aria-hidden="true">
          <span v-for="node in networkNodes" :key="node" class="hero__network-tab">
            {{ node }}
          </span>
        </div>
        <div class="hero__lead-copy">
          <p class="hero__eyebrow">{{ hero.eyebrow }}</p>
          <p class="hero__kicker">{{ hero.kicker }}</p>
        </div>
      </div>

      <div class="hero__headline">
        <h1 class="hero__title">
          <span>{{ hero.titleTop }}</span>
          <span class="hero__title hero__title--accent">{{ hero.titleBottom }}</span>
        </h1>
      </div>

      <div class="hero__foot">
        <p class="hero__summary">{{ hero.summary }}</p>

        <div class="hero__actions">
          <button class="hero__cta" type="button" @click="handleEnter(hero.ctaTarget)">
            {{ hero.ctaLabel }}
          </button>

          <div v-if="mediaPlanStore.activeMedia" class="hero__active">
            <span class="hero__active-label">{{ mediaPlanStore.activeMedia.indexLabel }}</span>
            <span>{{ mediaPlanStore.activeMedia.title }}</span>
          </div>
        </div>
      </div>

      <ul class="hero__metrics">
        <li v-for="metric in hero.metrics" :key="metric.label" class="hero__metric">
          <span class="hero__metric-value">{{ metric.value }}</span>
          <span class="hero__metric-label">{{ metric.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  overflow: clip;
  padding: 6.5rem 0 1.8rem;
  background:
    radial-gradient(circle at 75% 18%, rgba(95, 119, 255, 0.2), transparent 20%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 16%);
}

.hero__veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(180deg, rgba(8, 10, 14, 0.18) 0%, rgba(8, 10, 14, 0.24) 35%, rgba(8, 10, 14, 0.78) 100%),
    radial-gradient(circle at top, transparent 8%, rgba(8, 10, 14, 0.08) 50%, rgba(8, 10, 14, 0.4) 100%);
}

.hero__city-glow {
  position: absolute;
  inset: auto 0 0;
  z-index: 2;
  height: 42vh;
  background:
    linear-gradient(180deg, transparent, rgba(8, 10, 14, 0.42)),
    radial-gradient(circle at 12% 70%, rgba(90, 115, 255, 0.24), transparent 18%),
    radial-gradient(circle at 82% 15%, rgba(2, 71, 254, 0.16), transparent 18%);
}

.hero__content {
  position: relative;
  z-index: 3;
  display: grid;
  min-height: calc(100vh - 7.5rem);
  align-content: end;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 2rem;
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 650ms ease,
    transform 650ms ease;
}

.hero--ready .hero__content {
  opacity: 1;
  transform: translateY(0);
}

.hero__lead {
  grid-column: 1 / -1;
  display: grid;
  gap: 1rem;
}

.hero__network-tabs {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.hero__network-tab {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__lead-copy {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.hero__eyebrow,
.hero__kicker {
  max-width: 22rem;
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.hero__headline {
  grid-column: 1 / -1;
  width: min(1320px, calc(100vw - 2rem));
  margin-left: calc(var(--layout-gutter) * -1);
}

.hero__title {
  display: block;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(5.2rem, 12.8vw, 12.8rem);
  line-height: 0.84;
  text-transform: uppercase;
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.hero__title--accent {
  color: var(--color-accent-soft);
  text-shadow: 0 0 24px rgba(77, 240, 109, 0.2);
}

.hero__foot {
  display: grid;
  gap: 1.75rem;
  align-content: end;
  max-width: 44rem;
}

.hero__summary {
  max-width: 38rem;
  margin: 0;
  font-size: clamp(1rem, 1.7vw, 1.28rem);
  color: var(--color-text-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.hero__cta {
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1.4rem;
  background: linear-gradient(135deg, #034cff, #2d6bff);
  color: #fff;
  font-family: var(--font-sans-bold);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 16px 48px rgba(2, 71, 254, 0.32);
}

.hero__active {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  color: rgba(255, 255, 255, 0.86);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.74rem;
}

.hero__active-label {
  display: inline-grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
}

.hero__metrics {
  display: grid;
  gap: 1rem;
  align-self: end;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__metric {
  display: grid;
  gap: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  padding-top: 1rem;
}

.hero__metric-value {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 3rem);
}

.hero__metric-label {
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
}

@media (max-width: 900px) {
  .hero__content {
    grid-template-columns: 1fr;
  }

  .hero__lead-copy {
    flex-direction: column;
  }

  .hero__headline {
    width: 100%;
    margin-left: 0;
  }
}
</style>
