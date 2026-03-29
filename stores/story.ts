import type { Story, Scene } from '~/types/story'

export const useStoryStore = defineStore('story', () => {
  const story = ref<Story | null>(null)
  const currentIndex = ref(0)
  let lastJson = ''
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const currentScene = computed<Scene | null>(() => {
    if (!story.value || story.value.scenes.length === 0) return null
    return story.value.scenes[currentIndex.value] ?? null
  })

  const totalScenes = computed(() => story.value?.scenes.length ?? 0)

  const loadStory = async () => {
    try {
      const res = await fetch(`/story/current.json?t=${Date.now()}`)
      const json = await res.text()
      if (json !== lastJson) {
        lastJson = json
        const data: Story = JSON.parse(json)
        story.value = data
        currentIndex.value = 0
      }
    } catch {
      // silently ignore — server may not have the file yet
    }
  }

  const startPolling = () => {
    loadStory()
    pollTimer = setInterval(loadStory, 3000)
  }

  const stopPolling = () => {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const nextScene = () => {
    if (currentIndex.value < totalScenes.value - 1) {
      currentIndex.value++
    }
  }

  const prevScene = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  return {
    story,
    currentIndex,
    currentScene,
    totalScenes,
    loadStory,
    startPolling,
    stopPolling,
    nextScene,
    prevScene
  }
})
