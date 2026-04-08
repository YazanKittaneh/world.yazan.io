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
    <div class="globe-chrome">
      <NuxtLink class="globe-back-link" to="/">Back to city</NuxtLink>
    </div>

    <ClientOnly>
      <StorySceneRenderer />
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

.globe-chrome {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.globe-back-link {
  pointer-events: auto;
  position: fixed;
  top: 20px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.02em;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.globe-back-link:hover {
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
