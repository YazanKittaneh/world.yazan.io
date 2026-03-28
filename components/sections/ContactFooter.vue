<script setup lang="ts">
import type { ContactContent } from '~/types/content'

defineProps<{
  contact: ContactContent
}>()
</script>

<template>
  <footer id="contact" class="contact-footer">
    <div class="layout-shell section-panel contact-footer__inner">
      <div class="contact-footer__lead">
        <p class="contact-footer__eyebrow">Contact</p>
        <h2 class="contact-footer__title">{{ contact.title }}</h2>
      </div>

      <div class="contact-footer__meta">
        <p class="contact-footer__body">{{ contact.body }}</p>
        <a class="contact-footer__link" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
        <p class="contact-footer__location">{{ contact.location }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.contact-footer {
  padding: 4rem 0 3rem;
}

.contact-footer__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 28rem);
  gap: 2rem;
  padding: 2rem;
}

.contact-footer__eyebrow {
  margin: 0 0 0.8rem;
  color: var(--color-accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.contact-footer__title {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.contact-footer__meta {
  display: grid;
  gap: 0.9rem;
  align-content: start;
}

.contact-footer__body,
.contact-footer__location {
  margin: 0;
  color: var(--color-text-muted);
}

.contact-footer__link {
  color: var(--color-text);
  font-family: var(--font-sans-bold);
  text-decoration: none;
}

@media (max-width: 860px) {
  .contact-footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
