<script setup lang="ts">
/**
 * StorySceneRenderer - Extensible scene rendering system
 * 
 * This component routes scenes to their appropriate renderers based on metadata:
 * - renderMode: 'globe' (default) or 'local'
 * - rendererKey: identifies which local renderer to use (e.g., 'hormuz')
 * 
 * This allows future scenes to have dedicated cinematic renderers while
 * maintaining a unified navigation and narration system.
 */

const storyStore = useStoryStore()
const { currentScene } = storeToRefs(storyStore)

// Determine which renderer to use based on scene metadata
const useGlobeRenderer = computed(() => {
  const scene = currentScene.value
  if (!scene) return true
  
  // Default to globe renderer unless explicitly set to local
  return scene.renderMode !== 'local'
})

const localRendererKey = computed(() => {
  const scene = currentScene.value
  if (!scene || scene.renderMode !== 'local') return null
  
  return scene.rendererKey || 'default'
})

// Check if we have a renderer for this key
const hasLocalRenderer = computed(() => {
  return localRendererKey.value === 'hormuz-cinematic'
})
</script>

<template>
  <div class="story-scene-renderer">
    <!-- Globe renderer for standard scenes -->
    <GlobeSceneCanvas v-if="useGlobeRenderer" />
    
    <!-- Local cinematic renderers for specific scenes -->
    <HormuzSceneCanvas v-else-if="localRendererKey === 'hormuz-cinematic' && hasLocalRenderer" />
    
    <!-- Fallback to globe if local renderer not found -->
    <GlobeSceneCanvas v-else />
  </div>
</template>

<style scoped>
.story-scene-renderer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
