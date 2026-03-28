<script setup lang="ts">
import type { MediaItem } from '~/types/content'

const props = defineProps<{
  items: MediaItem[]
}>()

const mediaPlanStore = useMediaPlanStore()

watchEffect(() => {
  mediaPlanStore.setMediaItems(props.items)
})
</script>

<template>
  <section id="featured-media" class="media-rail">
    <div class="layout-shell media-rail__inner">
      <div class="media-rail__main">
        <p class="media-rail__eyebrow">Media plan</p>
        <h2 class="media-rail__headline">A sequence of premium placements rather than disconnected units.</h2>

        <div v-if="mediaPlanStore.activeMedia" class="media-rail__feature section-panel">
          <p class="media-rail__index">{{ mediaPlanStore.activeMedia.indexLabel }}</p>
          <div>
            <p class="media-rail__title">{{ mediaPlanStore.activeMedia.title }}</p>
            <p class="media-rail__subtitle">{{ mediaPlanStore.activeMedia.subtitle }}</p>
            <p class="media-rail__detail">{{ mediaPlanStore.activeMedia.detail }}</p>
          </div>
        </div>
      </div>

      <div class="media-rail__list">
        <button
          v-for="(item, index) in items"
          :key="item.title"
          :class="['media-rail__item', { 'media-rail__item--active': mediaPlanStore.activeIndex === index }]"
          type="button"
          @click="mediaPlanStore.setActiveIndex(index)"
        >
          <span class="media-rail__item-index">{{ item.indexLabel }}</span>
          <span class="media-rail__item-copy">
            <span class="media-rail__item-title">{{ item.title }}</span>
            <span class="media-rail__item-subtitle">{{ item.subtitle }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-rail {
  padding: 4rem 0 8rem;
}

.media-rail__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr);
  gap: 2rem;
}

.media-rail__main {
  display: grid;
  gap: 1.2rem;
}

.media-rail__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.media-rail__headline {
  max-width: 13ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4.9rem);
  line-height: 0.96;
  text-transform: uppercase;
}

.media-rail__feature {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
  margin-top: 2rem;
  padding: 1.4rem;
  background:
    linear-gradient(180deg, rgba(2, 71, 254, 0.16), rgba(255, 255, 255, 0.02)),
    rgba(15, 18, 26, 0.88);
}

.media-rail__index {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 4.3rem);
  line-height: 1;
}

.media-rail__title,
.media-rail__subtitle,
.media-rail__detail {
  margin: 0;
}

.media-rail__title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 3rem);
  text-transform: uppercase;
}

.media-rail__subtitle {
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.92);
}

.media-rail__detail {
  margin-top: 1rem;
  color: var(--color-text-muted);
}

.media-rail__list {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.media-rail__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    background-color 180ms ease;
}

.media-rail__item:hover,
.media-rail__item--active {
  transform: translateX(-4px);
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(2, 71, 254, 0.16);
}

.media-rail__item-index {
  display: inline-grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
}

.media-rail__item-copy {
  display: grid;
  gap: 0.2rem;
}

.media-rail__item-title {
  font-family: var(--font-display);
  font-size: 1.28rem;
  text-transform: uppercase;
}

.media-rail__item-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

@media (max-width: 980px) {
  .media-rail__inner {
    grid-template-columns: 1fr;
  }
}
</style>
