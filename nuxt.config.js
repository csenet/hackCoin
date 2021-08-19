export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'hackCoin',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    ['@nuxtjs/firebase',
      {
        config: {
          apiKey: "AIzaSyDwNKQnTuFny1oyVMTrhxtQmRVXLF5ZpOA",
          authDomain: "hackcoin-88d48.firebaseapp.com",
          databaseURL: "https://hackcoin-88d48-default-rtdb.asia-southeast1.firebasedatabase.app",
          projectId: "hackcoin-88d48",
          storageBucket: "hackcoin-88d48.appspot.com",
          messagingSenderId: "187032823289",
          appId: "1:187032823289:web:46abd02a76e701a7518928"
        },
        services: {
          database: true
        }
      }]
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
}
