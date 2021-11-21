import { createApp } from 'vue'

import { MainRouter } from './routers'

import App from './App.vue'

const app = createApp(App)


app.use(MainRouter)
    .mount('#app')
