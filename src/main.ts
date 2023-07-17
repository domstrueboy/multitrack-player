/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')



// import Vue from 'vue';
// import App from './App.vue';
// import router from './router';
// import store from './store';
// import './registerServiceWorker';
// import vuetify from './plugins/vuetify';

// Vue.config.productionTip = false;

// new Vue({
//   router,
//   store,
//   vuetify,
//   render: h => h(App)
// }).$mount('#app');
