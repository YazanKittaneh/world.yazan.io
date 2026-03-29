<script setup lang="ts">
const storyStore = useStoryStore()

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    storyStore.nextScene()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    storyStore.prevScene()
  }
}

onMounted(() => {
  storyStore.startPolling()
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  storyStore.stopPolling()
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <main class="globe-viewer">
    <ClientOnly>
      <GlobeSceneCanvas />
      <NarrationOverlay />
    </ClientOnly>
  </main>
</template>

<style scoped>
.globe-viewer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
