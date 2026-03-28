export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-02-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  modules: ['@pinia/nuxt', '@nuxtjs/prismic'],
  app: {
    head: {
      title: 'WOW Media Demo',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'A Nuxt 3 recreation of the WOW Media homepage aesthetic with local fixtures and a Three.js hero scene.'
        }
      ]
    },
    pageTransition: {
      name: 'page-fade',
      mode: 'out-in'
    }
  },
  prismic: {
    endpoint: 'https://wowmedia-demo.cdn.prismic.io/api/v2',
    preview: false,
    toolbar: false
  }
})
