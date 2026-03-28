import type { MediaItem } from '~/types/content'

export const useMediaPlanStore = defineStore('mediaPlan', () => {
  const featuredMedia = ref<MediaItem[]>([])
  const activeIndex = ref(0)
  const hoveredCapability = ref<string | null>(null)

  const activeMedia = computed(() => {
    return featuredMedia.value[activeIndex.value] ?? null
  })

  const setMediaItems = (items: MediaItem[]) => {
    featuredMedia.value = items
  }

  const setActiveIndex = (index: number) => {
    if (!featuredMedia.value.length) {
      activeIndex.value = 0
      return
    }

    activeIndex.value = ((index % featuredMedia.value.length) + featuredMedia.value.length) % featuredMedia.value.length
  }

  const cycleNext = () => {
    setActiveIndex(activeIndex.value + 1)
  }

  const setHoveredCapability = (title: string | null) => {
    hoveredCapability.value = title
  }

  return {
    featuredMedia,
    activeIndex,
    hoveredCapability,
    activeMedia,
    setMediaItems,
    setActiveIndex,
    cycleNext,
    setHoveredCapability
  }
})
