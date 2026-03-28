import homepage from '~/data/prismic/homepage.json'
import type { HomepageDocument } from '~/types/content'

export const useHomepageContent = () => {
  return computed(() => homepage as HomepageDocument)
}
