<script setup lang="ts">
const storyStore = useStoryStore()
const { currentScene, currentIndex, totalScenes } = storeToRefs(storyStore)

// Trigger fade animation on scene change
const visible = ref(true)
watch(currentIndex, async () => {
  visible.value = false
  await nextTick()
  setTimeout(() => { visible.value = true }, 50)
})
</script>

<template>
  <Transition name="scene-fade" mode="out-in">
    <div
      v-if="currentScene"
      class="narration-overlay"
      :key="currentIndex"
    >
      <p class="narration-text">{{ currentScene.narration }}</p>
      <div class="narration-footer">
        <span class="scene-counter">{{ currentIndex + 1 }} / {{ totalScenes }}</span>
        <span class="nav-hints">
          <kbd>←</kbd> prev &nbsp; <kbd>→</kbd> next
        </span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.narration-overlay {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: min(560px, calc(100vw - 48px));
  padding: 20px 24px 16px;
  background: rgba(9, 10, 13, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  color: #fff;
  pointer-events: none;
}

.narration-text {
  margin: 0 0 14px;
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  line-height: 1.6;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.92);
}

.narration-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.scene-counter {
  letter-spacing: 0.06em;
}

.nav-hints kbd {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
}

/* Crossfade transition */
.scene-fade-enter-active,
.scene-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.scene-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.scene-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
