import { createApp } from 'vue'

import { MainRouter } from './routers'

import App from './App.vue'

import '@/assets/styles/global.scss'

const app = createApp(App)


app.use(MainRouter)
    .mount('#app')
