export const useTransitionsStore = defineStore('transitions', () => {
  const preloaderVisible = ref(true)
  const introComplete = ref(false)
  const heroReady = ref(false)

  const finishPreloader = () => {
    preloaderVisible.value = false
    heroReady.value = true
  }

  const markIntroComplete = () => {
    introComplete.value = true
  }

  return {
    preloaderVisible,
    introComplete,
    heroReady,
    finishPreloader,
    markIntroComplete
  }
})
