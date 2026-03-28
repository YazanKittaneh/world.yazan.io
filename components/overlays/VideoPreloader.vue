<script setup lang="ts">
const transitionsStore = useTransitionsStore()
let finishTimer = 0
let introTimer = 0

onMounted(() => {
  finishTimer = window.setTimeout(() => {
    transitionsStore.finishPreloader()
  }, 2100)

  introTimer = window.setTimeout(() => {
    transitionsStore.markIntroComplete()
  }, 2650)
})

onBeforeUnmount(() => {
  window.clearTimeout(finishTimer)
  window.clearTimeout(introTimer)
})
</script>

<template>
  <Transition name="preloader">
    <div v-if="transitionsStore.preloaderVisible" class="preloader">
      <div class="preloader__video-shell">
        <div class="preloader__scanline" />
        <div class="preloader__pulse" />
        <div class="preloader__copy">
          <p class="preloader__eyebrow">WOW media system</p>
          <h1 class="preloader__title">Entering the network</h1>
          <p class="preloader__body">
            Full-bleed, dark, and cinematic. The intro is intentionally short so the page reaches the hero quickly in local
            development.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 35%, rgba(2, 71, 254, 0.26), transparent 28%),
    linear-gradient(180deg, rgba(10, 12, 19, 0.98), rgba(4, 5, 9, 0.98));
}

.preloader__video-shell {
  position: relative;
  display: grid;
  min-height: min(78vh, 820px);
  width: min(88vw, 1380px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 2rem;
  background:
    radial-gradient(circle at 18% 20%, rgba(90, 111, 255, 0.5), transparent 28%),
    radial-gradient(circle at 84% 18%, rgba(77, 240, 109, 0.22), transparent 18%),
    linear-gradient(140deg, rgba(13, 16, 25, 0.96), rgba(8, 10, 16, 0.88)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1400' height='900' viewBox='0 0 1400 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23060a11'/%3E%3Cstop offset='1' stop-color='%23121728'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1400' height='900'/%3E%3Ccircle cx='270' cy='630' r='230' fill='rgba(120,160,255,.12)'/%3E%3Ccircle cx='1120' cy='200' r='130' fill='rgba(120,160,255,.18)'/%3E%3Cpath d='M0 720C220 620 480 600 710 690s472 108 690-20' stroke='rgba(255,255,255,.06)' stroke-width='16' fill='none'/%3E%3C/svg%3E")
      center/cover;
}

.preloader__scanline,
.preloader__pulse {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.preloader__scanline {
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.11) 48%, transparent 100%);
  animation: scan 1.8s linear infinite;
  mix-blend-mode: screen;
}

.preloader__pulse {
  background: radial-gradient(circle at center, rgba(2, 71, 254, 0.16), transparent 50%);
  animation: pulse 2.4s ease-in-out infinite;
}

.preloader__copy {
  position: relative;
  align-self: end;
  padding: 2rem;
}

.preloader__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.preloader__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 8vw, 7.2rem);
  line-height: 0.92;
  text-transform: uppercase;
}

.preloader__body {
  max-width: 40rem;
  margin: 1rem 0 0;
  color: var(--color-text-muted);
}

.preloader-enter-active,
.preloader-leave-active {
  transition:
    opacity 420ms ease,
    transform 420ms ease;
}

.preloader-enter-from,
.preloader-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@keyframes scan {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(100%);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}
</style>
