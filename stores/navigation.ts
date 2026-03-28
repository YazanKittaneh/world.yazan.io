export const useNavigationStore = defineStore('navigation', () => {
  const isCompact = ref(false)

  const setCompact = (value: boolean) => {
    isCompact.value = value
  }

  const scrollToSection = async (selector: string) => {
    await nextTick()
    const target = document.querySelector(selector)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return {
    isCompact,
    setCompact,
    scrollToSection
  }
})
