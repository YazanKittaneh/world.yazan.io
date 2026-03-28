<script setup lang="ts">
const navigationStore = useNavigationStore()

const links = [
  { label: 'Capabilities', target: '#capabilities' },
  { label: 'Media', target: '#featured-media' },
  { label: 'Contact', target: '#contact' }
]

const handleClick = async (target: string) => {
  await navigationStore.scrollToSection(target)
}
</script>

<template>
  <header :class="['site-header', { 'site-header--compact': navigationStore.isCompact }]">
    <button class="site-header__brand" type="button" @click="handleClick('#top')">
      <span>WOW</span>
      <span class="site-header__brand-subtitle">Media Demo</span>
    </button>

    <nav class="site-header__nav" aria-label="Primary">
      <button
        v-for="link in links"
        :key="link.target"
        class="site-header__link"
        type="button"
        @click="handleClick(link.target)"
      >
        {{ link.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  transition:
    background-color 220ms ease,
    backdrop-filter 220ms ease,
    padding 220ms ease;
}

.site-header--compact {
  padding: 0.85rem 1.1rem;
  background: rgba(8, 10, 14, 0.72);
  backdrop-filter: blur(18px);
}

.site-header__brand,
.site-header__link {
  border: 0;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.site-header__brand {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__brand-subtitle {
  font-family: var(--font-sans-regular);
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.site-header__nav {
  display: flex;
  gap: 0.75rem;
  order: -1;
}

.site-header__link {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.site-header__link:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(2, 71, 254, 0.16);
}

@media (max-width: 720px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.9rem;
  }

  .site-header__nav {
    order: 0;
    flex-wrap: wrap;
  }
}
</style>
