<script setup lang="ts">
import type { CapabilityItem } from '~/types/content'

defineProps<{
  items: CapabilityItem[]
}>()

const mediaPlanStore = useMediaPlanStore()
</script>

<template>
  <section id="capabilities" class="capabilities">
    <div class="layout-shell capabilities__inner">
      <div class="section-heading">
        <p class="section-heading__eyebrow">Capabilities</p>
        <h2 class="section-heading__title">Built like a media system, presented like a world.</h2>
      </div>

      <div class="capabilities__grid">
        <article
          v-for="item in items"
          :key="item.title"
          class="capabilities__card section-panel"
          :style="{ '--card-accent': item.accent }"
          @mouseenter="mediaPlanStore.setHoveredCapability(item.title)"
          @mouseleave="mediaPlanStore.setHoveredCapability(null)"
        >
          <div class="capabilities__tag">{{ item.tag }}</div>
          <h3 class="capabilities__title">{{ item.title }}</h3>
          <p class="capabilities__description">{{ item.description }}</p>
          <p class="capabilities__state">
            {{ mediaPlanStore.hoveredCapability === item.title ? 'Highlighted in plan' : 'Hover to emphasize' }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.capabilities {
  padding: 5rem 0;
}

.capabilities__inner {
  display: grid;
  gap: 2rem;
}

.section-heading {
  display: grid;
  gap: 0.75rem;
}

.section-heading__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-heading__title {
  max-width: 14ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  line-height: 0.96;
  text-transform: uppercase;
}

.capabilities__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.capabilities__card {
  display: grid;
  gap: 1rem;
  min-height: 24rem;
  padding: 1.35rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01)),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(2, 71, 254, 0.1), transparent 44%),
    rgba(14, 16, 23, 0.76);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.capabilities__card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.22);
}

.capabilities__tag {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  letter-spacing: 0.18em;
}

.capabilities__title {
  margin: auto 0 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 0.92;
  text-transform: uppercase;
}

.capabilities__description,
.capabilities__state {
  margin: 0;
  color: var(--color-text-muted);
}

@media (max-width: 980px) {
  .capabilities__grid {
    grid-template-columns: 1fr;
  }

  .capabilities__card {
    min-height: auto;
  }
}
</style>
