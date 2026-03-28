<script setup lang="ts">
import type { StatementContent } from '~/types/content'

defineProps<{
  statement: StatementContent
  inverse?: boolean
}>()
</script>

<template>
  <section :class="['statement-band', { 'statement-band--inverse': inverse }]">
    <div class="layout-shell section-panel statement-band__inner">
      <p class="statement-band__overline">{{ statement.overline }}</p>
      <h2 class="statement-band__title">{{ statement.title }}</h2>
      <p class="statement-band__body">{{ statement.body }}</p>
    </div>
  </section>
</template>

<style scoped>
.statement-band {
  padding: 6rem 0 2rem;
}

.statement-band--inverse {
  padding-top: 2rem;
}

.statement-band__inner {
  display: grid;
  gap: 1rem;
  padding: 2.2rem;
}

.statement-band__overline {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.statement-band__title {
  max-width: 16ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 6vw, 6rem);
  line-height: 0.9;
  text-transform: uppercase;
}

.statement-band__body {
  max-width: 42rem;
  margin: 0;
  color: var(--color-text-muted);
}
</style>
