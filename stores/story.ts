import type { Story, Scene, StoryControl } from '~/types/story'

export const useStoryStore = defineStore('story', () => {
  const story = ref<Story | null>(null)
  const currentIndex = ref(0)
  let lastJson = ''
  let lastControlT = 0
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let controlPollTimer: ReturnType<typeof setInterval> | null = null
  let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null

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
      // silently ignore
    }
  }

  const loadControl = async () => {
    try {
      const res = await fetch(`/story/control.json?t=${Date.now()}`)
      const json = await res.text()
      const ctrl: StoryControl = JSON.parse(json)
      if (ctrl.t && ctrl.t !== lastControlT) {
        lastControlT = ctrl.t
        if (typeof ctrl.goToScene === 'number') {
          currentIndex.value = Math.max(0, Math.min(ctrl.goToScene, totalScenes.value - 1))
        }
      }
    } catch {
      // silently ignore — control file may not exist yet
    }
  }

  const startPolling = () => {
    loadStory()
    loadControl()
    pollTimer = setInterval(loadStory, 3000)
    controlPollTimer = setInterval(loadControl, 1000)
  }

  const stopPolling = () => {
    if (pollTimer !== null) { clearInterval(pollTimer); pollTimer = null }
    if (controlPollTimer !== null) { clearInterval(controlPollTimer); controlPollTimer = null }
    if (autoAdvanceTimer !== null) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
  }

  const nextScene = () => {
    if (currentIndex.value < totalScenes.value - 1) currentIndex.value++
  }

  const prevScene = () => {
    if (currentIndex.value > 0) currentIndex.value--
  }

  // Auto-advance when scene has a duration
  watch(currentScene, (sc) => {
    if (autoAdvanceTimer !== null) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
    if (sc?.duration && sc.duration > 0) {
      autoAdvanceTimer = setTimeout(nextScene, sc.duration)
    }
  })

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
